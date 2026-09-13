import { getCompleteCharacterData } from '../../systems/characters/characters';
import { startCombat } from '../../systems/combat/combat';
import { getItemByID } from '../../systems/equipment/helpers';
import {
    calculateTrialFee,
    getHighestStat,
    getHighestUnlockedTrialTier,
    getTrialDifficulty,
    isTrialOnCooldown,
    isTrialTierUnlocked,
    parseTrialTier,
    TRIAL_TIERS,
    TrialFeeConfig,
    TrialTierThresholds,
} from '../../systems/guild/guild-trial';
import { generateMonster } from '../../systems/monsters/monster-generation';
import { calculateShopCost } from '../../systems/shops/shops';
import { chargePlayerForHeal } from '../../systems/user/healer';
import {
    equipItemOnUser,
    getUserData,
    getUserName,
    setUserCurrentHP,
} from '../../systems/user/user';
import { CharacterClass } from '../../types/equipment';
import { UserCommand } from '../../types/firebot';
import {
    adjustCurrencyForUser,
    getCurrencyName,
    getUserCurrencyTotal,
    getWorldMeta,
    logger,
    sendChatMessage,
    setCharacterMeta,
} from '../firebot';

// TODO(step 8): replace all three of these with typed getters over a new `guildSettings`
// category in register-game.ts, mirroring getDuelTimeout(). They are inlined here only so
// this file type-checks on its own -- no number in this feature is meant to ship hardcoded.
const TRIAL_THRESHOLDS: TrialTierThresholds = {
    basic: 1,
    rare: 3,
    epic: 5,
    legendary: 7,
};

const TRIAL_FEE_CONFIG: TrialFeeConfig = {
    baseCost: 500,
    multiplier: {
        basic: 0.25,
        rare: 0.5,
        epic: 1.0,
        legendary: 1.75,
    },
    floor: {
        basic: 500,
        rare: 2000,
        epic: 6000,
        legendary: 15000,
    },
};

const TRIAL_COOLDOWN_MINUTES = 10;

const USAGE = `specify a trial tier. Tiers: ${TRIAL_TIERS.join(
    ', '
)}. Example: !rpg guild trial basic`;

/**
 * The guild trial. The player pays a non-refundable fee to fight a champion wearing a class of
 * the chosen tier, and takes that class if they win.
 * @param userCommand
 */
export async function rpgGuildCommand(userCommand: UserCommand) {
    const username = userCommand.commandSender;
    const { args } = userCommand;
    const characterName = await getUserName(username);
    const currencyName = getCurrencyName();

    // !rpg guild trial <tier>
    if (args[1] !== 'trial') {
        sendChatMessage(`@${username}, ${USAGE}`);
        return;
    }

    const tier = parseTrialTier(args[2] as string);
    if (tier == null) {
        sendChatMessage(`@${username}, ${USAGE}`);
        return;
    }

    const { upgrades } = await getWorldMeta();
    const guildLevel = upgrades.guild;

    if (!isTrialTierUnlocked(tier, guildLevel, TRIAL_THRESHOLDS)) {
        const highest = getHighestUnlockedTrialTier(
            guildLevel,
            TRIAL_THRESHOLDS
        );

        sendChatMessage(
            highest == null
                ? `@${username}, the guild hall is still being built and isn't taking on challengers yet.`
                : `@${username}, the guild won't put ${characterName} forward for a ${tier} trial yet. The best they'll offer is ${highest}.`
        );
        return;
    }

    const player = await getUserData(username);

    // Checked before any charge, so a dead character is never billed for a trial they can't take.
    if (player.currentHP === 0) {
        sendChatMessage(
            `@${username}, ${characterName} is dead and needs to be healed first.`
        );
        return;
    }

    // `trial` is optional on Character and is undefined for every character created before this
    // feature shipped -- verifyUser does not backfill. strictNullChecks is off, so nothing but
    // this `?.` protects that read.
    if (isTrialOnCooldown(player.trial?.time ?? null, TRIAL_COOLDOWN_MINUTES)) {
        sendChatMessage(
            `@${username}, the trial ring is still being reset from ${characterName}'s last bout. Try again in a few minutes.`
        );
        return;
    }

    const fee = await calculateShopCost(
        calculateTrialFee(tier, getHighestStat(player), TRIAL_FEE_CONFIG)
    );
    const currencyTotal = await getUserCurrencyTotal(username);

    if (currencyTotal < fee) {
        logger('debug', `${username} could not afford a ${tier} guild trial.`);
        sendChatMessage(
            `@${username}, the guild charges ${fee} ${currencyName} for a ${tier} trial. ${characterName} can't cover it.`
        );
        return;
    }

    // The fee is non-refundable and is taken before the fight, win or lose.
    await adjustCurrencyForUser(-Math.abs(fee), username);
    await setCharacterMeta(username, { time: Date.now() }, 'trial');

    logger('debug', `TRIAL STARTED: ${username} at ${tier} tier.`);

    // The champion is a normal monster of the matching difficulty, except that its class is
    // forced to this tier. Its gear still rolls within DEFAULT_MONSTER_RARITY.
    const champion = await generateMonster(username, getTrialDifficulty(tier), {
        rarity: [tier],
    });

    const completePlayer = await getCompleteCharacterData(player);
    const completeChampion = await getCompleteCharacterData(champion);
    const combat = await startCombat(completePlayer, completeChampion);

    await setUserCurrentHP(username, combat.one);

    const won = combat.one > 0;
    const championClass = getItemByID(
        champion.characterClass.id,
        'characterClass'
    ) as CharacterClass;

    if (won) {
        await equipItemOnUser(username, champion.characterClass, 'backpack');
    }

    const healMessage = await chargePlayerForHeal(username);
    const outcome = won
        ? `${characterName} won in ${combat.rounds} rounds. The guild recognises them as a ${championClass.name} -- claim it with !rpg equip class.`
        : `${characterName} fell in ${combat.rounds} rounds. The guild keeps the fee.`;

    sendChatMessage(
        `@${username}, ${characterName} paid ${fee} ${currencyName} and entered the trial ring against a ${champion.name} bearing the ${championClass.name} class. ${outcome} ${healMessage}`
    );
}
