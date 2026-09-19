export type GameSettings = {
    generalSettings: {
        currencyId: string;
        resetId: string;
    };
    worldSettings: {
        name: string;
        type: string;
        citizens: string;
        cycleTime: number;
    };
    creatureSettings: {
        easyMinHP: number;
        mediumMinHP: number;
        hardMinHP: number;
        legendaryMinHP: number;
        mediumGuildLevel: number;
        hardGuildLevel: number;
        legendaryGuildLevel: number;
        jobSpilloverChance: number;
    };
    shops: {
        refinementBaseCost: number;
        refinementMultiplier: number;
        refinementsPerLevel: number;
        enchantmentBaseCost: number;
        enchantmentMultiplier: number;
        enchantmentsPerLevel: number;
        trainingBaseCost: number;
        trainingMultiplier: number;
        trainingsPerLevel: number;
    };
    combatSettings: {
        duelTimeout: number;
        offHandMissChance: number;
        rangedInMeleePenalty: number;
        hitBonus: number;
        damageBonus: number;
        heavyMovementSpeed: number;
        mediumMovementSpeed: number;
        lightMovementSpeed: number;
        nakedMovementSpeed: number;
        heavyDexBonus: number;
        mediumDexBonus: number;
        lightDexBonus: number;
        nakedDexBonus: number;
        heavyArcaneFailure: number;
        mediumArcaneFailure: number;
        lightArcaneFailure: number;
        nakedArcaneFailure: number;
        spellDC: number;
    };
    guildSettings: {
        guildTrialCooldown: number;
        guildTrialBaseCost: number;
        basicGuildLevel: number;
        rareGuildLevel: number;
        epicGuildLevel: number;
        legendaryGuildLevel: number;
        // Stored as percentages, matching the other shop multipliers (trainingMultiplier
        // etc.) -- 25 means 0.25x. getTrialFeeConfig() divides them down.
        basicTrialMultiplier: number;
        rareTrialMultiplier: number;
        epicTrialMultiplier: number;
        legendaryTrialMultiplier: number;
        basicTrialFloor: number;
        rareTrialFloor: number;
        epicTrialFloor: number;
        legendaryTrialFloor: number;
    };
};
