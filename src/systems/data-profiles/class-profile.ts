import { classList } from '../../data/classes';
import { CharacterClass } from '../../types/equipment';

import {
    renderIdDensityTable,
    renderRarityDistributionTable,
} from './id-rarity-table';
import {
    renderStatBonusLadderTable,
    renderStatRangeTable,
} from './stat-bonus-table';

export function renderClassProfile(
    classes: CharacterClass[] = classList
): string {
    return [
        '# Class Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(classes),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(classes),
        '\n## 3. Stat bonus ladder\n',
        renderStatBonusLadderTable(classes),
        '\n## 4. Stat range by rarity\n',
        renderStatRangeTable(classes),
    ].join('\n');
}
