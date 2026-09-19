import { jobList } from '../data/jobs';
import { Rarity } from '../types/equipment';
import { Job, JobChallengeRatings, JobTierThresholds } from '../types/jobs';

import {
    JOB_LOOT_TABLE,
    getJobTiersForBand,
    getUnlockedJobTier,
    selectJobForGuildLevel,
} from './jobs';

const DEFAULT_THRESHOLDS: JobTierThresholds = {
    medium: 2,
    hard: 4,
    legendary: 6,
};

describe('getUnlockedJobTier', () => {
    it.each([
        [0, 'easy'],
        [1, 'easy'],
        [2, 'medium'],
        [3, 'medium'],
        [4, 'hard'],
        [5, 'hard'],
        [6, 'legendary'],
        [99, 'legendary'],
    ])(
        'guild level %i with default thresholds unlocks %s',
        (guildLevel, expected) => {
            expect(getUnlockedJobTier(guildLevel, DEFAULT_THRESHOLDS)).toBe(
                expected
            );
        }
    );

    it('respects custom thresholds', () => {
        const thresholds: JobTierThresholds = {
            medium: 0,
            hard: 10,
            legendary: 20,
        };
        expect(getUnlockedJobTier(0, thresholds)).toBe('medium');
    });

    it('resolves the highest tier when thresholds collapse to the same value', () => {
        const thresholds: JobTierThresholds = {
            medium: 2,
            hard: 2,
            legendary: 2,
        };
        expect(getUnlockedJobTier(2, thresholds)).toBe('legendary');
    });
});

describe('getJobTiersForBand', () => {
    it('easy has nothing below it', () => {
        expect(getJobTiersForBand('easy')).toEqual(['easy']);
    });

    it('medium is easy + medium', () => {
        expect(getJobTiersForBand('medium')).toEqual(['easy', 'medium']);
    });

    it('hard is medium + hard', () => {
        expect(getJobTiersForBand('hard')).toEqual(['medium', 'hard']);
    });

    it('legendary is hard + legendary', () => {
        expect(getJobTiersForBand('legendary')).toEqual(['hard', 'legendary']);
    });
});

describe('selectJobForGuildLevel', () => {
    let randomSpy: jest.SpyInstance<number, []>;

    afterEach(() => {
        randomSpy?.mockRestore();
    });

    it('with spillover 0, easy band only ever returns easy jobs', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

        for (let i = 0; i < 20; i += 1) {
            randomSpy
                .mockReturnValueOnce(0.9)
                .mockReturnValueOnce(Math.random());
            const job = selectJobForGuildLevel(0, DEFAULT_THRESHOLDS, 0);
            expect(job.challenge).toBe('easy');
        }
    });

    it('with spillover 0, hard band returns only medium or hard, never easy', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

        for (let i = 0; i < 20; i += 1) {
            const job = selectJobForGuildLevel(4, DEFAULT_THRESHOLDS, 0);
            expect(['medium', 'hard']).toContain(job.challenge);
        }
    });

    it('rolls a spillover job when random is below the spillover threshold', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValueOnce(0.01);
        const job = selectJobForGuildLevel(0, DEFAULT_THRESHOLDS, 5);
        expect(job.challenge).toBe('medium');
    });

    it('stays in band when random is at/above the spillover threshold', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValueOnce(0.05);
        const job = selectJobForGuildLevel(0, DEFAULT_THRESHOLDS, 5);
        expect(job.challenge).toBe('easy');
    });

    it('with spillover 100 at the medium band, always returns hard', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

        for (let i = 0; i < 20; i += 1) {
            const job = selectJobForGuildLevel(2, DEFAULT_THRESHOLDS, 100);
            expect(job.challenge).toBe('hard');
        }
    });

    it('with spillover 100 at the legendary band, still returns a defined job', () => {
        randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

        for (let i = 0; i < 20; i += 1) {
            const job = selectJobForGuildLevel(6, DEFAULT_THRESHOLDS, 100);
            expect(job).toBeDefined();
            expect(['hard', 'legendary']).toContain(job.challenge);
        }
    });

    it('never returns undefined across every band', () => {
        const bands = [0, 2, 4, 6];
        for (const guildLevel of bands) {
            for (let i = 0; i < 20; i += 1) {
                const job = selectJobForGuildLevel(
                    guildLevel,
                    DEFAULT_THRESHOLDS,
                    5
                );
                expect(job).toBeDefined();
            }
        }
    });
});

describe('jobList data invariants', () => {
    const tiers: JobChallengeRatings[] = [
        'easy',
        'medium',
        'hard',
        'legendary',
    ];

    it.each(tiers)('%s tier has at least one job', (tier) => {
        const jobsInTier = jobList.filter((job: Job) => job.challenge === tier);
        expect(jobsInTier.length).toBeGreaterThan(0);
    });

    it.each(tiers)('%s tier has at least one non-combat job', (tier) => {
        const nonCombatJobs = jobList.filter(
            (job: Job) => job.challenge === tier && job.encounter == null
        );
        expect(nonCombatJobs.length).toBeGreaterThan(0);
    });

    it('every job id is unique', () => {
        const ids = jobList.map((job: Job) => job.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('job ids strictly ascend in file order', () => {
        const ids = jobList.map((job: Job) => job.id);
        const outOfOrder = ids.filter((id, i) => i > 0 && id <= ids[i - 1]);
        expect(outOfOrder).toEqual([]);
    });

    /** Expected quality (basic=1 .. legendary=4) of a rarity array under getWeightedRarity. */
    function expectedRarityScore(rarity: Rarity[]): number {
        const weights: Record<Rarity, number> = {
            basic: 50,
            rare: 35,
            epic: 10,
            legendary: 5,
        };
        const scores: Record<Rarity, number> = {
            basic: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        };
        const total = rarity.reduce((sum, r) => sum + weights[r], 0);
        return rarity.reduce(
            (sum, r) => sum + (weights[r] / total) * scores[r],
            0
        );
    }

    it.each(tiers)(
        '%s: fighting for the loot out-rewards playing it safe',
        (tier) => {
            const safe = expectedRarityScore(JOB_LOOT_TABLE[tier].safe);
            const fight = expectedRarityScore(JOB_LOOT_TABLE[tier].fight);

            // Losing a fight forfeits the money AND the loot (rpg-job.ts returns early
            // on a loss), so an encounter job must pay more when it does pay.
            expect({ tier, safe, fight, fightWins: fight > safe }).toEqual({
                tier,
                safe,
                fight,
                fightWins: true,
            });
        }
    );

    it('every job loot rarity matches JOB_LOOT_TABLE for its tier and encounter', () => {
        const mismatches = jobList.flatMap((job: Job) => {
            const bucket = job.encounter == null ? 'safe' : 'fight';
            const expected = JOB_LOOT_TABLE[job.challenge][bucket];
            const actual = job.loot.item?.rarity ?? [];

            if (actual.join() === expected.join()) {
                return [];
            }

            return [
                `job ${job.id} is ${job.challenge}/${bucket}, so loot.item.rarity must be ` +
                    `[${expected.join(', ')}] but is [${actual.join(', ')}]`,
            ];
        });

        expect(mismatches).toEqual([]);
    });
});
