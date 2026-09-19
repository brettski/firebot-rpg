import { weaponList } from '../../data/weapons';
import { Weapon } from '../../types/equipment';

import {
    renderDamageDistributionTable,
    renderMeleeRangedTable,
    renderPropertiesUsageTable,
} from './damage-gear-table';
import { renderEnchantmentSumTable } from './enchantment-sum-table';
import {
    renderIdDensityTable,
    renderRarityDistributionTable,
} from './id-rarity-table';
import { renderRefinementsTable } from './refinements-table';

export function renderWeaponProfile(weapons: Weapon[] = weaponList): string {
    return [
        '# Weapon Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(weapons),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(weapons),
        '\n## 3. Damage distribution by rarity\n',
        renderDamageDistributionTable(weapons),
        '\n## 4. Properties & range summary\n',
        '**Properties usage**\n',
        renderPropertiesUsageTable(weapons),
        '\n**Melee vs. ranged by rarity**\n',
        renderMeleeRangedTable(weapons),
        '\n## 5. Enchantment point sum by rarity\n',
        renderEnchantmentSumTable(weapons),
        '\n## 6. Refinements by rarity\n',
        renderRefinementsTable(weapons),
    ].join('\n');
}
