import { RARITIES } from './rarities';
import { getSpellFilteredByRarity } from './spells';

describe('getSpellFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity spell when only %s is allowed',
        (rarity) => {
            const result = getSpellFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
