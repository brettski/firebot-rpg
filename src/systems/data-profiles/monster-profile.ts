import { monsterList } from '../../data/monsters';
import { Monster } from '../../types/monsters';
import { MONSTER_DIFFICULTIES } from '../monsters/monsters';

import { renderIdDensityTable } from './id-rarity-table';
import { markdownTable } from './markdown-table';
import { median } from './stat-bonus-table';

const STATS = ['str', 'dex', 'int', 'hp'] as const;

/**
 * Count per difficulty tier. Unlike every rarity-based tier table elsewhere in this family,
 * monster difficulty selection is UNIFORM within a tier, not weighted -- getMonsterByDifficulty
 * (src/systems/monsters/monsters.ts) picks uniformly at random -- so there is no expected-value
 * scoring column here the way jobs.ts's loot rarity has one. A tier's own size *is* the whole
 * story: each entry's draw chance is exactly 1/(tier size).
 */
function renderTierSummaryTable(monsters: Monster[]): string {
    const rows = MONSTER_DIFFICULTIES.map((difficulty) => {
        const group = monsters.filter((m) => m.difficulty[0] === difficulty);
        return [difficulty, group.length];
    });

    return markdownTable(['difficulty', 'count'], rows);
}

/** Count of monsters with each `equipment.*` flag true, per difficulty tier. */
function renderEquipmentCoverageTable(monsters: Monster[]): string {
    const rows = MONSTER_DIFFICULTIES.map((difficulty) => {
        const group = monsters.filter((m) => m.difficulty[0] === difficulty);
        const armor = group.filter((m) => m.equipment.armor).length;
        const title = group.filter((m) => m.equipment.title).length;
        const characterClass = group.filter(
            (m) => m.equipment.characterClass
        ).length;
        return [difficulty, group.length, armor, title, characterClass];
    });

    return markdownTable(
        ['difficulty', 'total', 'armor', 'title', 'characterClass'],
        rows
    );
}

/**
 * min–max range and median for each bonus stat, per difficulty tier. These are percent modifiers
 * applied to the *player's* own stats (generateMonsterStats, src/systems/monsters/monster-
 * generation.ts), not absolute monster stats -- median over mean for the same reasoning as every
 * other range table in this family (small groups, as few as 8 entries).
 */
function renderBonusRangeTable(monsters: Monster[]): string {
    const rows = MONSTER_DIFFICULTIES.map((difficulty) => {
        const group = monsters.filter((m) => m.difficulty[0] === difficulty);
        const range = (stat: (typeof STATS)[number]) => {
            const values = group
                .map((m) => m.bonuses[stat])
                .sort((a, b) => a - b);
            const min = values[0];
            const max = values[values.length - 1];
            const med = median(values);
            const medDisplay = Number.isInteger(med) ? med : med.toFixed(1);
            return `${min}–${max} (median ${medDisplay})`;
        };
        return [difficulty, ...STATS.map(range)];
    });

    return markdownTable(['difficulty', ...STATS], rows);
}

export function renderMonsterProfile(
    monsters: Monster[] = monsterList
): string {
    return [
        '# Monster Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(monsters),
        '\n## 2. Tier summary (uniform selection, not weighted)\n',
        renderTierSummaryTable(monsters),
        '\n## 3. Equipment coverage by tier\n',
        renderEquipmentCoverageTable(monsters),
        '\n## 4. Bonus range by tier\n',
        renderBonusRangeTable(monsters),
    ].join('\n');
}
