import { getClassFilteredByRarity } from './character-class';
import { RARITIES } from './rarities';

describe('getClassFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity class when only %s is allowed',
        (rarity) => {
            const result = getClassFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
