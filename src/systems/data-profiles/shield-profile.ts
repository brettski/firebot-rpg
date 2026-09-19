import { shieldList } from '../../data/shields';
import { Shield } from '../../types/equipment';

import {
    renderArmorClassRangeTable,
    renderPropertiesDistributionTable,
} from './defense-gear-table';
import { renderEnchantmentSumTable } from './enchantment-sum-table';
import {
    renderIdDensityTable,
    renderRarityDistributionTable,
} from './id-rarity-table';
import { renderRefinementsTable } from './refinements-table';

export function renderShieldProfile(shields: Shield[] = shieldList): string {
    return [
        '# Shield Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(shields),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(shields),
        '\n## 3. Armor class range by rarity\n',
        renderArmorClassRangeTable(shields),
        '\n## 4. Properties distribution by rarity\n',
        renderPropertiesDistributionTable(shields),
        '\n## 5. Enchantment point sum by rarity\n',
        renderEnchantmentSumTable(shields),
        '\n## 6. Refinements by rarity\n',
        renderRefinementsTable(shields),
    ].join('\n');
}
