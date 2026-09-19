import { Rarity } from '../../types/equipment';

import { renderModalLadderTable } from './modal-ladder-table';

type RefinedItem = {
    id: number;
    rarity: Rarity;
    refinements: number;
};

/**
 * A DATA-INTEGRITY check, same shape as renderEnchantmentSumTable. `refinements` has no effect on
 * damage -- calculateDamage (src/systems/combat/combat.ts:62-91) rolls mainWeapon.damage and adds
 * getCharacterDamageBonus (str/dex/int only), neither reads it. It IS added directly to to-hit
 * for weapons/spells (characters.ts:211-234) and to AC for armor/shields (characters.ts:88,100),
 * so an anomalous refinements value is a real combat-relevant outlier, not just a catalog
 * artifact -- e.g. a newly-added epic item with refinements: 5 instead of the tier's usual 1
 * would meaningfully change its hit chance (or AC), and this table is what would catch it.
 */
export function renderRefinementsTable(items: RefinedItem[]): string {
    return renderModalLadderTable(
        items,
        (i) => i.refinements,
        'modal refinements'
    );
}
