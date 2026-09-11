import { getClassFilteredByRarity } from './character-class';

describe('getClassFilteredByRarity', () => {
    it.each(['basic', 'rare', 'epic', 'legendary'] as const)(
        'returns a %s-rarity class when only %s is allowed',
        (rarity) => {
            const result = getClassFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
