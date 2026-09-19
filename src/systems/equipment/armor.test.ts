import { getArmorFilteredByRarity } from './armor';
import { RARITIES } from './rarities';

describe('getArmorFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity armor when only %s is allowed',
        (rarity) => {
            const result = getArmorFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
