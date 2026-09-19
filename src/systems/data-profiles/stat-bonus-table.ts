import { Rarity } from '../../types/equipment';
import { RARITIES } from '../equipment/rarities';

import { markdownTable } from './markdown-table';
import { renderModalLadderTable } from './modal-ladder-table';

type StatBonusItem = {
    id: number;
    rarity: Rarity;
    bonuses: { str: number; dex: number; int: number };
};

/**
 * A DATA-INTEGRITY check, not an authoring reference -- see renderStatRangeTable below for that.
 * One row per rarity: entry count, the modal (most common) str+dex+int sum for that rarity, and
 * the ids whose sum doesn't match it. Titles and classes both scale a clean stat-total ladder by
 * rarity tier, with a handful of real exceptions -- this table surfaces them without needing a
 * fixed "expected" table per rarity, since the modal sum is derived from the data itself.
 */
export function renderStatBonusLadderTable(items: StatBonusItem[]): string {
    return renderModalLadderTable(
        items,
        (i) => i.bonuses.str + i.bonuses.dex + i.bonuses.int,
        'modal sum'
    );
}

/** Exported so other range tables (e.g. armor class) can use the same median-over-mean choice. */
export function median(sortedValues: number[]): number {
    const n = sortedValues.length;
    const mid = Math.floor(n / 2);
    return n % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid];
}

/**
 * The authoring reference: min–max range and median for str/dex/int individually, per rarity.
 * Unlike renderStatBonusLadderTable (which only ever shows the combined sum), this is what
 * actually answers "what values are plausible for each stat on a new entry at this tier."
 *
 * Median over mean deliberately -- these groups are small (12-24 entries) and a couple of
 * outliers pull the mean toward a value nothing in the group actually has (e.g. classes/basic
 * str: mean 7.0, but the real values cluster at 0/5/10 with median 5). A 95th-percentile column
 * was considered and rejected: at this sample size it lands within one step of the max almost
 * every time (redundant with the range already shown), and interpolation produces fractional
 * values like 16.5 that don't exist anywhere in this data -- every stat bonus here is a multiple
 * of 5.
 */
export function renderStatRangeTable(items: StatBonusItem[]): string {
    const rows = RARITIES.map((rarity) => {
        const group = items.filter((i) => i.rarity === rarity);
        const range = (stat: 'str' | 'dex' | 'int') => {
            const values = group
                .map((i) => i.bonuses[stat])
                .sort((a, b) => a - b);
            const min = values[0];
            const max = values[values.length - 1];
            const med = median(values);
            const medDisplay = Number.isInteger(med) ? med : med.toFixed(1);
            return `${min}–${max} (median ${medDisplay})`;
        };
        return [rarity, range('str'), range('dex'), range('int')];
    });

    return markdownTable(['rarity', 'str', 'dex', 'int'], rows);
}
