import { RARITIES } from './rarities';
import { getShieldFilteredByRarity } from './shields';

describe('getShieldFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity shield when only %s is allowed',
        (rarity) => {
            const result = getShieldFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
