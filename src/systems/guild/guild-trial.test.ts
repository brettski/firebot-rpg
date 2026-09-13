import { MonsterDifficulties } from '../../types/monsters';

import {
    applyTrialFeeFloor,
    calculateTrialFee,
    getHighestStat,
    getHighestUnlockedTrialTier,
    getTrialDifficulty,
    isTrialOnCooldown,
    isTrialTierUnlocked,
    parseTrialTier,
    TRIAL_TIERS,
    TrialFeeConfig,
    TrialTier,
    TrialTierThresholds,
} from './guild-trial';

const DEFAULT_THRESHOLDS: TrialTierThresholds = {
    basic: 1,
    rare: 3,
    epic: 5,
    legendary: 7,
};

const DEFAULT_FEE_CONFIG: TrialFeeConfig = {
    baseCost: 500,
    multiplier: {
        basic: 0.25,
        rare: 0.5,
        epic: 1.0,
        legendary: 1.75,
    },
    floor: {
        basic: 500,
        rare: 2000,
        epic: 6000,
        legendary: 15000,
    },
};

describe('parseTrialTier', () => {
    it.each(['basic', 'rare', 'epic', 'legendary'] as const)(
        'parses %s',
        (tier) => {
            expect(parseTrialTier(tier)).toBe(tier);
        }
    );

    it.each(['', 'BASIC', 'Rare', 'weapon', 'legendaries'])(
        'returns null for %j',
        (input) => {
            expect(parseTrialTier(input)).toBeNull();
        }
    );

    it('returns null for undefined', () => {
        expect(parseTrialTier(undefined)).toBeNull();
    });
});

describe('getTrialDifficulty', () => {
    it.each([
        ['basic', 'easy'],
        ['rare', 'medium'],
        ['epic', 'hard'],
        ['legendary', 'legendary'],
    ] as [TrialTier, MonsterDifficulties][])(
        '%s tier maps to %s difficulty',
        (tier, expected) => {
            expect(getTrialDifficulty(tier)).toBe(expected);
        }
    );

    it('is total over every entry in TRIAL_TIERS', () => {
        TRIAL_TIERS.forEach((tier) => {
            expect(getTrialDifficulty(tier)).toBeDefined();
        });
    });
});

describe('isTrialTierUnlocked', () => {
    it.each([
        ['basic', 0, false],
        ['basic', 1, true],
        ['rare', 2, false],
        ['rare', 3, true],
        ['epic', 4, false],
        ['epic', 5, true],
        ['legendary', 6, false],
        ['legendary', 7, true],
    ] as [TrialTier, number, boolean][])(
        '%s at guild level %i is unlocked: %s',
        (tier, guildLevel, expected) => {
            expect(
                isTrialTierUnlocked(tier, guildLevel, DEFAULT_THRESHOLDS)
            ).toBe(expected);
        }
    );

    it('remains unlocked for a lower tier once a higher one is reached', () => {
        // Guild level 7 unlocks legendary, but basic/rare/epic must not be locked out.
        expect(isTrialTierUnlocked('basic', 7, DEFAULT_THRESHOLDS)).toBe(true);
        expect(isTrialTierUnlocked('rare', 7, DEFAULT_THRESHOLDS)).toBe(true);
        expect(isTrialTierUnlocked('epic', 7, DEFAULT_THRESHOLDS)).toBe(true);
    });

    it('respects custom thresholds', () => {
        const thresholds: TrialTierThresholds = {
            basic: 0,
            rare: 10,
            epic: 20,
            legendary: 30,
        };
        expect(isTrialTierUnlocked('basic', 0, thresholds)).toBe(true);
        expect(isTrialTierUnlocked('rare', 0, thresholds)).toBe(false);
    });
});

describe('getHighestUnlockedTrialTier', () => {
    it.each([
        [0, null],
        [1, 'basic'],
        [2, 'basic'],
        [3, 'rare'],
        [4, 'rare'],
        [5, 'epic'],
        [6, 'epic'],
        [7, 'legendary'],
        [99, 'legendary'],
    ] as [number, TrialTier | null][])(
        'guild level %i with default thresholds unlocks %s',
        (guildLevel, expected) => {
            expect(
                getHighestUnlockedTrialTier(guildLevel, DEFAULT_THRESHOLDS)
            ).toBe(expected);
        }
    );

    it('returns null below the basic threshold', () => {
        const thresholds: TrialTierThresholds = {
            basic: 5,
            rare: 10,
            epic: 15,
            legendary: 20,
        };
        expect(getHighestUnlockedTrialTier(4, thresholds)).toBeNull();
    });

    it('resolves the highest tier when thresholds collapse to the same value', () => {
        const thresholds: TrialTierThresholds = {
            basic: 2,
            rare: 2,
            epic: 2,
            legendary: 2,
        };
        expect(getHighestUnlockedTrialTier(2, thresholds)).toBe('legendary');
    });
});

describe('getHighestStat', () => {
    it.each([
        [{ str: 10, dex: 5, int: 3 }, 10],
        [{ str: 3, dex: 20, int: 5 }, 20],
        [{ str: 5, dex: 5, int: 30 }, 30],
        [{ str: 5, dex: 5, int: 5 }, 5],
    ])('returns %j -> %i', (stats, expected) => {
        expect(getHighestStat(stats)).toBe(expected);
    });
});

describe('calculateTrialFee', () => {
    it('is monotonic in tier at a fixed stat', () => {
        const fees = TRIAL_TIERS.map((tier) =>
            calculateTrialFee(tier, 20, DEFAULT_FEE_CONFIG)
        );

        expect(fees[0]).toBeLessThan(fees[1]);
        expect(fees[1]).toBeLessThan(fees[2]);
        expect(fees[2]).toBeLessThan(fees[3]);
    });

    it.each(TRIAL_TIERS)(
        'is monotonic in stat at a fixed tier (%s)',
        (tier) => {
            const feeAt15 = calculateTrialFee(tier, 15, DEFAULT_FEE_CONFIG);
            const feeAt35 = calculateTrialFee(tier, 35, DEFAULT_FEE_CONFIG);

            expect(feeAt35).toBeGreaterThan(feeAt15);
        }
    );

    it.each([
        ['basic', 750],
        ['rare', 2000],
        ['epic', 6000],
        ['legendary', 15000],
    ] as [TrialTier, number][])(
        '%s at stat 15 costs exactly %i',
        (tier, expected) => {
            expect(calculateTrialFee(tier, 15, DEFAULT_FEE_CONFIG)).toBe(
                expected
            );
        }
    );

    it.each([
        ['basic', 3250],
        ['rare', 6500],
        ['epic', 13000],
        ['legendary', 22750],
    ] as [TrialTier, number][])(
        '%s at stat 35 costs exactly %i',
        (tier, expected) => {
            expect(calculateTrialFee(tier, 35, DEFAULT_FEE_CONFIG)).toBe(
                expected
            );
        }
    );

    it.each(TRIAL_TIERS)(
        'never drops below the %s tier floor, even at stat 10',
        (tier) => {
            expect(calculateTrialFee(tier, 10, DEFAULT_FEE_CONFIG)).toBe(
                DEFAULT_FEE_CONFIG.floor[tier]
            );
        }
    );

    it.each(TRIAL_TIERS)(
        'is exactly the %s floor at stat 9, where the (stat - 9) term is zero',
        (tier) => {
            expect(calculateTrialFee(tier, 9, DEFAULT_FEE_CONFIG)).toBe(
                DEFAULT_FEE_CONFIG.floor[tier]
            );
        }
    );

    it.each(TRIAL_TIERS)(
        'stays at the %s floor, not negative, for a stat below 9',
        (tier) => {
            expect(calculateTrialFee(tier, 5, DEFAULT_FEE_CONFIG)).toBe(
                DEFAULT_FEE_CONFIG.floor[tier]
            );
        }
    );
});

describe('isTrialOnCooldown', () => {
    const time = 1_000_000;
    const cooldownMinutes = 10;
    const cooldownMs = cooldownMinutes * 60 * 1000;

    it('is false when there is no stamp -- the migration case for every pre-existing character', () => {
        expect(isTrialOnCooldown(null, cooldownMinutes, time)).toBe(false);
    });

    it('returns true when blocking -- the opposite polarity from isDuelExpired, which returns true when NOT blocking', () => {
        expect(isTrialOnCooldown(time, cooldownMinutes, time)).toBe(true);
    });

    it('is true just before the cooldown window ends', () => {
        expect(
            isTrialOnCooldown(time, cooldownMinutes, time + cooldownMs - 1)
        ).toBe(true);
    });

    it("is true exactly at the cooldown boundary, mirroring isDuelExpired's inclusive boundary (only strictly after it clears)", () => {
        expect(
            isTrialOnCooldown(time, cooldownMinutes, time + cooldownMs)
        ).toBe(true);
    });

    it('is false just after the cooldown boundary', () => {
        expect(
            isTrialOnCooldown(time, cooldownMinutes, time + cooldownMs + 1)
        ).toBe(false);
    });

    it('a cooldown of 0 never blocks, even at the exact same instant as the stamp', () => {
        expect(isTrialOnCooldown(time, 0, time)).toBe(false);
    });

    it('a negative cooldown never blocks', () => {
        expect(isTrialOnCooldown(time, -5, time)).toBe(false);
    });

    it('defaults now to the real clock when omitted', () => {
        const stamp = Date.now();
        expect(isTrialOnCooldown(stamp, cooldownMinutes)).toBe(true);
    });
});

describe('applyTrialFeeFloor', () => {
    // The world's `resources` discount is applied by calculateShopCost *after* the fee is
    // worked out, so without re-flooring afterwards a -25% discount takes a 500 basic trial
    // down to 375 -- below its own configured minimum. That defeats the floor's whole purpose,
    // since the mature, high-resources world with the deepest discount is exactly the one the
    // floor exists to stop cheap trials in.
    it.each(TRIAL_TIERS)(
        'raises a discounted %s fee back up to its floor',
        (tier) => {
            const floor = DEFAULT_FEE_CONFIG.floor[tier];
            const discounted = Math.floor(floor * 0.75);

            expect(
                applyTrialFeeFloor(tier, discounted, DEFAULT_FEE_CONFIG)
            ).toBe(floor);
        }
    );

    it.each(TRIAL_TIERS)(
        'leaves a %s fee above the floor untouched, including a surcharge',
        (tier) => {
            const surcharged = DEFAULT_FEE_CONFIG.floor[tier] * 2;

            expect(
                applyTrialFeeFloor(tier, surcharged, DEFAULT_FEE_CONFIG)
            ).toBe(surcharged);
        }
    );

    it('is a no-op when the fee already equals the floor', () => {
        expect(applyTrialFeeFloor('basic', 500, DEFAULT_FEE_CONFIG)).toBe(500);
    });

    it('reproduces the reported case: a 500 basic trial discounted to 375 is re-floored to 500', () => {
        // resources >= 75 gives -25%: floor(500 * -0.25 + 500) = 375
        expect(applyTrialFeeFloor('basic', 375, DEFAULT_FEE_CONFIG)).toBe(500);
    });
});
