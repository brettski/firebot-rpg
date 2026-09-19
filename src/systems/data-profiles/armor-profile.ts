import { armorList } from '../../data/armor';
import { Armor } from '../../types/equipment';

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

export function renderArmorProfile(armor: Armor[] = armorList): string {
    return [
        '# Armor Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(armor),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(armor),
        '\n## 3. Armor class range by rarity\n',
        renderArmorClassRangeTable(armor),
        '\n## 4. Properties distribution by rarity\n',
        renderPropertiesDistributionTable(armor),
        '\n## 5. Enchantment point sum by rarity\n',
        renderEnchantmentSumTable(armor),
        '\n## 6. Refinements by rarity\n',
        renderRefinementsTable(armor),
    ].join('\n');
}
