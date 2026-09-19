import { Rarity } from '../../types/equipment';
import { RARITIES } from '../equipment/rarities';

import { markdownTable } from './markdown-table';

/**
 * A DATA-INTEGRITY check: one row per rarity, the modal (most common) value of some numeric
 * field, and the ids whose value doesn't match it. Shared by every table that flags "this should
 * be flat within a tier -- does it stay flat" (stat-bonus sums, enchantment-point sums,
 * refinements). Extracted rather than writing a third near-identical copy of this algorithm --
 * same reasoning as RARITIES' own extraction out of nine hardcoded copies.
 */
export function renderModalLadderTable<
    T extends { id: number; rarity: Rarity },
>(items: T[], valueOf: (item: T) => number, valueLabel: string): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const values = group.map(valueOf);

        const counts = new Map<number, number>();
        values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
        let modal = values[0] ?? 0;
        let modalCount = 0;
        counts.forEach((count, value) => {
            if (count > modalCount) {
                modalCount = count;
                modal = value;
            }
        });

        const offLadder = group
            .filter((i) => valueOf(i) !== modal)
            .map((i) => i.id);

        return [
            rarity,
            group.length,
            modal,
            offLadder.length === 0 ? 'none' : offLadder.join(', '),
        ];
    });

    return markdownTable(
        ['rarity', 'entries', valueLabel, 'off-ladder ids'],
        rows
    );
}
