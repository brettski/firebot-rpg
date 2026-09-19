import { Rarity } from '../../types/equipment';
import { RARITIES } from '../equipment/rarities';

import { markdownTable } from './markdown-table';

/**
 * Metrics table for a data table's `id` column: entry count, unique id count, id range, and any
 * duplicate or gapped ids. Duplicates matter because `getItemFromItemListById` (src/systems/
 * utils.ts) is first-match-wins -- a duplicated id silently shadows every entry after the first.
 */
export function renderIdDensityTable(items: { id: number }[]): string {
    const ids = items.map((i) => i.id);
    const unique = new Set(ids);
    const min = Math.min(...ids);
    const max = Math.max(...ids);

    const occurrences = new Map<number, number>();
    ids.forEach((id) => occurrences.set(id, (occurrences.get(id) ?? 0) + 1));
    const duplicates = [...occurrences.entries()]
        .filter(([, count]) => count > 1)
        .sort(([a], [b]) => a - b);

    const gaps: number[] = [];
    for (let id = min; id <= max; id += 1) {
        if (!unique.has(id)) {
            gaps.push(id);
        }
    }

    const duplicateList =
        duplicates.length === 0
            ? 'none'
            : duplicates.map(([id, count]) => `${id} (×${count})`).join(', ');
    const gapList = gaps.length === 0 ? 'none' : gaps.join(', ');

    return markdownTable(
        ['metric', 'value'],
        [
            ['entries', items.length],
            ['unique ids', unique.size],
            ['id range', `${min}–${max}`],
            ['duplicate ids', duplicateList],
            ['gaps', gapList],
        ]
    );
}

/**
 * One row per rarity: count and share of the total. `rarity` here is a single scalar per item
 * (Weapon/Armor/Shield/Spell/Title/CharacterClass all type it as `Rarity`, not `Rarity[]` the way
 * jobs' `loot.item.rarity` does), so this is a plain frequency table, not a weighted-draw model.
 */
export function renderRarityDistributionTable(
    items: { rarity: Rarity }[]
): string {
    const total = items.length;
    const rows = RARITIES.map((rarity) => {
        const count = items.filter((i) => i.rarity === rarity).length;
        const pct = total === 0 ? 0 : (count / total) * 100;
        return [rarity, count, `${pct.toFixed(1)}%`];
    });

    return markdownTable(
        ['rarity', 'count', '%'],
        [...rows, ['total', total, '100.0%']]
    );
}
