import { Rarity } from '../../types/equipment';
import { MonsterDifficulties } from '../../types/monsters';
import { RARITIES } from '../equipment/rarities';

export type TrialTier = Rarity;

export const TRIAL_TIERS: TrialTier[] = RARITIES;

export type TrialTierThresholds = {
    basic: number;
    rare: number;
    epic: number;
    legendary: number;
};

/**
 * Parses raw command input into a trial tier. Case-sensitive, matching how every other
 * subcommand in this codebase parses its arguments (no `.toLowerCase()` anywhere in
 * rpg-trainer.ts, rpg-equip.ts, or register-commands.ts).
 * @param input
 */
export function parseTrialTier(input: string | undefined): TrialTier | null {
    if (input == null) {
        return null;
    }

    return TRIAL_TIERS.includes(input as TrialTier)
        ? (input as TrialTier)
        : null;
}

/**
 * Maps a trial tier to the monster difficulty the champion is generated at.
 * @param tier
 */
export function getTrialDifficulty(tier: TrialTier): MonsterDifficulties {
    switch (tier) {
        case 'basic':
            return 'easy';
        case 'rare':
            return 'medium';
        case 'epic':
            return 'hard';
        case 'legendary':
            return 'legendary';
        default:
            throw new Error(`Unknown trial tier: ${tier}`);
    }
}

/**
 * Whether a given trial tier is available at the given guild level. Unlike job-tier bands,
 * unlocking a higher tier never locks out a lower one -- reaching legendary still allows a
 * basic trial.
 * @param tier
 * @param guildLevel
 * @param thresholds
 */
export function isTrialTierUnlocked(
    tier: TrialTier,
    guildLevel: number,
    thresholds: TrialTierThresholds
): boolean {
    return guildLevel >= thresholds[tier];
}

/**
 * Returns the highest trial tier unlocked at the given guild level, or null if the guild
 * hasn't reached the basic threshold yet.
 * @param guildLevel
 * @param thresholds
 */
export function getHighestUnlockedTrialTier(
    guildLevel: number,
    thresholds: TrialTierThresholds
): TrialTier | null {
    if (guildLevel >= thresholds.legendary) {
        return 'legendary';
    }

    if (guildLevel >= thresholds.epic) {
        return 'epic';
    }

    if (guildLevel >= thresholds.rare) {
        return 'rare';
    }

    if (guildLevel >= thresholds.basic) {
        return 'basic';
    }

    return null;
}

export type TrialFeeConfig = {
    baseCost: number;
    multiplier: Record<TrialTier, number>;
    floor: Record<TrialTier, number>;
};

/**
 * The highest of a character's three base stats. Uses the raw, un-adjusted stat (the same
 * field rpg-trainer.ts reads for its own cost formula, `userdata[stat] - 9`), not the
 * class/title-adjusted stat from getAdjustedCharacterStat -- the fee is meant to track what
 * the player has invested via the trainer, not their current equipment.
 * @param stats
 */
export function getHighestStat(stats: {
    str: number;
    dex: number;
    int: number;
}): number {
    return Math.max(stats.str, stats.dex, stats.int);
}

/**
 * The guild's fee for a trial at the given tier, indexed to the player's own trainer step so
 * it scales with how much a class is actually worth to them (class bonuses are percentages,
 * so the same class is worth far more to a heavily-trained character than a fresh one).
 * Never returns less than the tier's floor, even for a highestStat at or below 9 where the
 * (highestStat - 9) term is zero or negative.
 * @param tier
 * @param highestStat
 * @param config
 */
export function calculateTrialFee(
    tier: TrialTier,
    highestStat: number,
    config: TrialFeeConfig
): number {
    const unit = (highestStat - 9) * config.baseCost;
    return Math.max(config.floor[tier], unit * config.multiplier[tier]);
}

/**
 * Re-applies the tier's floor to a fee that has already been through calculateShopCost.
 *
 * calculateShopCost applies the world's `resources` modifier, which at 75+ resources is a 25%
 * *discount* -- and it runs after calculateTrialFee, so it will happily take a 500 basic trial
 * down to 375, under its own configured minimum. That defeats the point of the floor: it exists
 * to stop a fresh character buying a high tier cheaply in a mature world, and a mature world is
 * precisely the one sitting on high resources with the deepest discount.
 *
 * The surcharge direction needs no special handling -- a fee pushed *up* is already above the
 * floor and passes through untouched.
 * @param tier
 * @param fee a fee that has already had calculateShopCost applied
 * @param config
 */
export function applyTrialFeeFloor(
    tier: TrialTier,
    fee: number,
    config: TrialFeeConfig
): number {
    return Math.max(config.floor[tier], fee);
}

/**
 * Whether a trial is still on cooldown for a player. Same shape as isDuelExpired (duels.ts),
 * but inverted -- this returns true while BLOCKING, isDuelExpired returns true once NOT
 * blocking -- and `now` is an explicit parameter rather than an internal `Date.now()` call,
 * which is what makes this testable (isDuelExpired has no tests for exactly that reason).
 *
 * A cooldown of 0 (or negative) always returns false, as an explicit "cooldown disabled"
 * switch, rather than depending on `now` and `time` never landing in the same millisecond.
 *
 * The boundary is inclusive: at `now - time === cooldownMs` exactly, the trial is still
 * considered blocking. It only clears on the first tick strictly after that.
 * @param time the last trial's timestamp, or null if the player has never attempted one
 * @param cooldownMinutes
 * @param now defaults to the real clock
 */
export function isTrialOnCooldown(
    time: number | null,
    cooldownMinutes: number,
    now: number = Date.now()
): boolean {
    if (time == null || cooldownMinutes <= 0) {
        return false;
    }

    const cooldownMs = 1000 * 60 * cooldownMinutes;
    return now - time <= cooldownMs;
}

export type TrialPriceEntry =
    | { tier: TrialTier; unlocked: true; fee: number }
    | { tier: TrialTier; unlocked: false; requiredGuildLevel: number };

/**
 * The per-tier price list for `!rpg guild trial` with no tier given. Deliberately mirrors
 * calculateTrialFee's own boundary: this returns the pre-discount fee for each unlocked tier,
 * not the final price. calculateShopCost is async and Firebot-dependent, so applying it (and
 * applyTrialFeeFloor afterwards) is left to the caller, exactly as calculateTrialFee's own
 * doc comment establishes for the same reason.
 * @param highestStat
 * @param guildLevel
 * @param thresholds
 * @param feeConfig
 */
export function buildTrialPriceList(
    highestStat: number,
    guildLevel: number,
    thresholds: TrialTierThresholds,
    feeConfig: TrialFeeConfig
): TrialPriceEntry[] {
    return TRIAL_TIERS.map((tier) => {
        if (isTrialTierUnlocked(tier, guildLevel, thresholds)) {
            return {
                tier,
                unlocked: true,
                fee: calculateTrialFee(tier, highestStat, feeConfig),
            };
        }

        return {
            tier,
            unlocked: false,
            requiredGuildLevel: thresholds[tier],
        };
    });
}
