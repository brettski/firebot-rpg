import { weaponList } from '../../data/weapons';
import { Rarity, StoredWeapon, Weapon } from '../../types/equipment';
import { filterArrayByProperty } from '../utils';
import { getWeightedRarity } from './helpers';

/**
 * Selects a random weapon of a certain rarity.
 * @param rarity
 * @returns
 */
export function getWeaponFilteredByRarity(rarity: Rarity[]): Weapon {
    // First, pick which rarity our item will be.
    const selectedRarity = getWeightedRarity(rarity);

    // Then, narrow down our weapon list to only items with that rarity.
    const availableWeapons = filterArrayByProperty(
        weaponList,
        ['rarity'],
        selectedRarity
    );

    // Then, pick a random item from our selected weapons.
    return availableWeapons[
        Math.floor(Math.random() * availableWeapons.length)
    ];
}

/**
 * Generates a new weapon for a user.
 * @param username
 * @param rarity
 * @returns
 */
export async function generateWeaponForUser(
    username: string,
    rarity: Rarity[]
): Promise<StoredWeapon> {
    // Get our weapon
    const weapon = getWeaponFilteredByRarity(rarity);

    // Combine them into a "stored weapon" and return.
    return {
        id: weapon.id,
        itemType: 'weapon',
        nickname: null,
        refinements: 0,
        enchantments: {
            earth: 0,
            wind: 0,
            fire: 0,
            water: 0,
            light: 0,
            darkness: 0,
        },
    };
}
