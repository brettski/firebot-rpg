import { titleList } from '../../data/titles';
import { Title } from '../../types/equipment';

import {
    renderIdDensityTable,
    renderRarityDistributionTable,
} from './id-rarity-table';
import {
    renderStatBonusLadderTable,
    renderStatRangeTable,
} from './stat-bonus-table';

export function renderTitleProfile(titles: Title[] = titleList): string {
    return [
        '# Title Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(titles),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(titles),
        '\n## 3. Stat bonus ladder\n',
        renderStatBonusLadderTable(titles),
        '\n## 4. Stat range by rarity\n',
        renderStatRangeTable(titles),
    ].join('\n');
}
