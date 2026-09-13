import {
    Armor,
    CharacterClass,
    EquippableItemsDetails,
    Shield,
    Spell,
    StorableItems,
    StoredArmor,
    StoredCharacterClass,
    StoredShield,
    StoredSpell,
    StoredTitle,
    StoredWeapon,
    Title,
    Weapon,
} from './equipment';

export type EquippableSlots =
    'backpack' | 'armor' | 'mainHand' | 'offHand' | 'characterClass' | 'title';

export type EnchantableSlots = 'armor' | 'mainHand' | 'offHand';

export type CharacterStatNames = 'str' | 'dex' | 'int';

export type Duel = {
    challenger: string | null;
    time: number | null;
};

export type Trial = {
    time: number | null;
};

export type Character = {
    resetId: string;
    name: string;
    totalHP: number;
    currentHP: number;
    str: number;
    dex: number;
    int: number;
    backpack: StorableItems | null;
    armor: StoredArmor | null;
    mainHand: StoredWeapon | StoredSpell;
    offHand: StoredWeapon | StoredShield | StoredSpell | null;
    characterClass: StoredCharacterClass;
    title: StoredTitle;
    duel: Duel;
    // Optional on purpose. verifyUser does not backfill fields onto existing characters -- it
    // only builds a whole new one when the metadata is missing or the resetId changed -- so
    // every character created before the guild trial shipped has no `trial` at all, and so do
    // the Character-shaped literals built elsewhere (GeneratedMonster, monster-generation.ts).
    //
    // Note this does NOT get you compiler protection: strictNullChecks is off in tsconfig.json,
    // so `character.trial.time` compiles fine and would throw at runtime for those players.
    // Always read it as `character.trial?.time ?? null`.
    trial?: Trial;
};

export interface CompleteCharacter extends Character {
    armorData: Armor | null;
    mainHandData: Weapon | Spell | null;
    offHandData: Weapon | Spell | Shield | null;
    characterClassData: CharacterClass | null;
    titleData: Title | null;
    backpackData: EquippableItemsDetails | null;
}
