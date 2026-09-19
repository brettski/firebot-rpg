import { spellList } from '../../data/spells';
import { Spell } from '../../types/equipment';

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

export function renderSpellProfile(spells: Spell[] = spellList): string {
    return [
        '# Spell Data Profile\n',
        '## 1. Id density\n',
        renderIdDensityTable(spells),
        '\n## 2. Rarity distribution\n',
        renderRarityDistributionTable(spells),
        '\n## 3. Damage distribution by rarity\n',
        renderDamageDistributionTable(spells),
        '\n## 4. Properties & range summary\n',
        '**Properties usage**\n',
        renderPropertiesUsageTable(spells),
        '\n**Melee vs. ranged by rarity**\n',
        renderMeleeRangedTable(spells),
        '\n## 5. Enchantment point sum by rarity\n',
        renderEnchantmentSumTable(spells),
        '\n## 6. Refinements by rarity\n',
        renderRefinementsTable(spells),
    ].join('\n');
}
