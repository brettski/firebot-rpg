import { Enchantments, Rarity } from '../../types/equipment';

import { renderModalLadderTable } from './modal-ladder-table';

type EnchantedItem = {
    id: number;
    rarity: Rarity;
    enchantments: Enchantments;
};

function sumEnchantments(enchantments: Enchantments): number {
    return Object.values(enchantments).reduce((a, b) => a + b, 0);
}

/**
 * A DATA-INTEGRITY check, same shape and purpose as renderStatBonusLadderTable (stat-bonus-
 * table.ts): one row per rarity, the modal enchantment-point sum, and the ids that don't match
 * it. On weapons/armor/shields this is expected to read all-zero except a single legendary
 * outlier (enchantments there are catalog-authoring defaults, not a real per-entry signal) --
 * kept anyway so that stops being true is visible rather than silently unreported. Spells are the
 * one table where every entry actually varies meaningfully.
 */
export function renderEnchantmentSumTable(items: EnchantedItem[]): string {
    return renderModalLadderTable(
        items,
        (i) => sumEnchantments(i.enchantments),
        'modal sum'
    );
}
