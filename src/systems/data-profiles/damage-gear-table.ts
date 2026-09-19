import { Rarity, WeaponProperties } from '../../types/equipment';
import { RARITIES } from '../equipment/rarities';

import { markdownTable } from './markdown-table';

type DamageGearItem = {
    id: number;
    rarity: Rarity;
    damage: string;
    properties: WeaponProperties[];
    range: number;
};

/** Sorts dice notation ("1d4", "2d6", ...) numerically by die count then die size. */
function compareDice(a: string, b: string): number {
    const parse = (dice: string) => {
        const [count, size] = dice.split('d').map(Number);
        return { count, size };
    };
    const da = parse(a);
    const db = parse(b);
    return da.count - db.count || da.size - db.size;
}

/** One row per rarity: the distinct dice values used and how many entries carry each. */
export function renderDamageDistributionTable(items: DamageGearItem[]): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const counts = new Map<string, number>();
        group.forEach((i) =>
            counts.set(i.damage, (counts.get(i.damage) ?? 0) + 1)
        );
        const dice = [...counts.keys()].sort(compareDice);
        const summary = dice.map((d) => `${d}:${counts.get(d)}`).join(', ');
        return [rarity, group.length, summary];
    });

    return markdownTable(['rarity', 'entries', 'damage (dice:count)'], rows);
}

/**
 * Flat count per `properties[]` value across every entry, not broken out by rarity -- the same
 * property (e.g. "heavy") appears at every tier, so a per-rarity split would mostly repeat itself.
 */
export function renderPropertiesUsageTable(items: DamageGearItem[]): string {
    const counts = new Map<string, number>();
    items.forEach((i) =>
        i.properties.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1))
    );
    const rows = [...counts.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([property, count]) => [property, count]);

    return markdownTable(['property', 'count'], rows);
}

/**
 * Melee vs. ranged counts by rarity. `range === 0` is melee, per the same convention
 * src/systems/equipment/helpers.ts already uses to render a weapon's range ("melee" vs a number).
 */
export function renderMeleeRangedTable(items: DamageGearItem[]): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const melee = group.filter((i) => i.range === 0).length;
        return [rarity, melee, group.length - melee, group.length];
    });

    return markdownTable(['rarity', 'melee', 'ranged', 'total'], rows);
}
