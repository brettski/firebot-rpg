import { getArmorFilteredByRarity } from './armor';

describe('getArmorFilteredByRarity', () => {
    it.each(['basic', 'rare', 'epic', 'legendary'] as const)(
        'returns a %s-rarity armor when only %s is allowed',
        (rarity) => {
            const result = getArmorFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
