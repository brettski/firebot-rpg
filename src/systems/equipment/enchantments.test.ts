import { logger } from '../../firebot/firebot';
import { Enchantments } from '../../types/equipment';

import { getEnchantmentName } from './enchantments';

jest.mock('../../firebot/firebot', () => ({
    logger: jest.fn(),
}));

const noEnchantments: Enchantments = {
    earth: 0,
    wind: 0,
    fire: 0,
    water: 0,
    light: 0,
    darkness: 0,
};

describe('getEnchantmentName', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('names a combo regardless of which order the top two values come back in', () => {
        // Lava is defined as ['earth', 'fire']. earth outweighs fire here, so
        // getTopValuesFromObject returns ['earth', 'fire'] in that order.
        const earthHeavy: Enchantments = {
            ...noEnchantments,
            earth: 10,
            fire: 5,
        };
        expect(getEnchantmentName(earthHeavy, 'weapon')).toBe('Lava');

        // Same pair, opposite magnitude order: getTopValuesFromObject now returns
        // ['fire', 'earth']. This is the order-independence the fix restores — the
        // pre-fix substring match only succeeded in the first case above.
        const fireHeavy: Enchantments = {
            ...noEnchantments,
            fire: 10,
            earth: 5,
        };
        expect(getEnchantmentName(fireHeavy, 'weapon')).toBe('Lava');
    });

    it('matches the equivalent armor/shield pair list for armor and shield item types', () => {
        // The armor/shield list names the wind+fire pair differently from the
        // weapon/spell list ('Warding' vs 'Scorching') -- confirms getEnchantmentName
        // actually switches lists by itemType rather than always using one.
        const windHeavy: Enchantments = {
            ...noEnchantments,
            wind: 10,
            fire: 5,
        };
        expect(getEnchantmentName(windHeavy, 'armor')).toBe('Warding');
        expect(getEnchantmentName(windHeavy, 'shield')).toBe('Warding');
    });

    it('falls back to Magic when only one enchantment type is present', () => {
        // Every 2-element combination of the 6 enchantment types is a defined pair in
        // the data, so the only way to get a genuine non-match is a single nonzero
        // value: getTopValuesFromObject returns a 1-element array, which can never
        // satisfy the 2-element set-equality check against a defined pair.
        const singleType: Enchantments = { ...noEnchantments, earth: 10 };
        expect(getEnchantmentName(singleType, 'weapon')).toBe('Magic');
    });

    it('falls back to Magic for an itemType outside weapon/spell/armor/shield', () => {
        const someEnchantments: Enchantments = {
            ...noEnchantments,
            earth: 10,
            fire: 5,
        };
        expect(getEnchantmentName(someEnchantments, 'unknown-type')).toBe(
            'Magic'
        );
    });

    it('returns null for an all-zero enchantments object without calling logger', () => {
        expect(getEnchantmentName(noEnchantments, 'weapon')).toBeNull();
        expect(logger).not.toHaveBeenCalled();
    });
});
