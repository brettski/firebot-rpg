import { ArmorProperties, Rarity } from '../../types/equipment';
import { RARITIES } from '../equipment/rarities';

import { markdownTable } from './markdown-table';
import { median } from './stat-bonus-table';

type DefenseGearItem = {
    id: number;
    rarity: Rarity;
    armorClass: number;
    properties: ArmorProperties[];
};

const PROPERTY_VALUES: ArmorProperties[] = ['light', 'medium', 'heavy'];

/**
 * min–max range and median armorClass per rarity. Median over mean, same reasoning as
 * renderStatRangeTable (stat-bonus-table.ts) -- these groups are small (as few as 1 for
 * legendary), so a mean adds nothing a median wouldn't already show more robustly.
 */
export function renderArmorClassRangeTable(items: DefenseGearItem[]): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const values = group.map((i) => i.armorClass).sort((a, b) => a - b);
        const min = values[0];
        const max = values[values.length - 1];
        const med = median(values);
        const medDisplay = Number.isInteger(med) ? med : med.toFixed(1);
        return [rarity, `${min}–${max} (median ${medDisplay})`];
    });

    return markdownTable(['rarity', 'armorClass'], rows);
}

/**
 * Count of light/medium/heavy per rarity. `properties` is typed as an array, but every armor and
 * shield entry carries exactly one value in practice (the code reads properties[0] directly), so
 * a per-rarity breakdown is more informative here than the flat cross-rarity count damage-gear-
 * table.ts uses for weapons/spells (where an item can carry several properties at once).
 */
export function renderPropertiesDistributionTable(
    items: DefenseGearItem[]
): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const counts = PROPERTY_VALUES.map(
            (p) => group.filter((i) => i.properties.includes(p)).length
        );
        return [rarity, ...counts];
    });

    return markdownTable(['rarity', ...PROPERTY_VALUES], rows);
}
