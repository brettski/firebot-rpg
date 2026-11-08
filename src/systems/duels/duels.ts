import { getCompleteCharacterData } from '../characters/characters';
import { startCombat } from '../combat/combat';
import { getDuelTimeout } from '../settings';
import { getUserData } from '../user/user';

/**
 * Minutes a duel challenge stays open. Uses the Duel Timeout setting,
 * falling back to 2 if it is unset or 0.
 */
export function getDuelTimeoutMinutes() {
    return getDuelTimeout() || 2;
}

export function isDuelExpired(date: number | null) {
    if (date == null) {
        return true;
    }

    const timer = 1000 * 60 * getDuelTimeoutMinutes();
    const checked = Date.now() - timer;

    // If the challenge is older than the timeout, the duel is expired.
    return date < checked;
}

export async function startDuel(attacker: string, defender: string) {
    const attackingCharacter = await getUserData(attacker);
    const defendingCharacter = await getUserData(defender);

    const completePlayer = await getCompleteCharacterData(attackingCharacter);
    const completePlayerTwo =
        await getCompleteCharacterData(defendingCharacter);

    const results = await startCombat(completePlayer, completePlayerTwo);
    return results;
}
