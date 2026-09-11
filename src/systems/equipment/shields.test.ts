import { getShieldFilteredByRarity } from './shields';

describe('getShieldFilteredByRarity', () => {
    it.each(['basic', 'rare', 'epic', 'legendary'] as const)(
        'returns a %s-rarity shield when only %s is allowed',
        (rarity) => {
            const result = getShieldFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
