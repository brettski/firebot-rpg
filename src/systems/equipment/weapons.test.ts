import { RARITIES } from './rarities';
import { getWeaponFilteredByRarity } from './weapons';

describe('getWeaponFilteredByRarity', () => {
    it.each(RARITIES)(
        'returns a %s-rarity weapon when only %s is allowed',
        (rarity) => {
            const result = getWeaponFilteredByRarity([rarity]);
            expect(result.rarity).toBe(rarity);
        }
    );
});
