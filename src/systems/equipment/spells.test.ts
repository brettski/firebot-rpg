import { getSpellFilteredByRarity } from './spells';

describe('getSpellFilteredByRarity', () => {
    it.each(['basic', 'rare', 'epic', 'legendary'] as const)(
        'returns a %s-rarity spell when only %s is allowed',
        (rarity) => {
            const result = getSpellFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
