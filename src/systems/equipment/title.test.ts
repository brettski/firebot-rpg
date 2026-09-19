import { RARITIES } from './rarities';
import { getTitleFilteredByRarity } from './title';

describe('getTitleFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity title when only %s is allowed',
        (rarity) => {
            const result = getTitleFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
