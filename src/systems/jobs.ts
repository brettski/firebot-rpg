import { jobList } from '../data/jobs';
import { Rarity } from '../types/equipment';
import { Job, JobChallengeRatings, JobTierThresholds } from '../types/jobs';

export const JOB_TIERS: JobChallengeRatings[] = [
    'easy',
    'medium',
    'hard',
    'legendary',
];

/**
 * The intended job loot curve, by tier and by whether the job makes you fight for it.
 *
 * Rarity is WEIGHTED, not uniform: getWeightedRarity applies 50/35/10/5 normalised over
 * whichever rarities are in the array, so a SHORTER top-heavy array is worth MORE than a
 * longer one. ['epic','legendary'] is a 33% legendary roll; ['basic','rare','epic','legendary']
 * is only 5%. That is what inverted the old table -- the no-encounter jobs had been given the
 * short arrays.
 *
 * See docs/decisions/job-loot-pays-for-risk.md.
 */
export const JOB_LOOT_TABLE: Record<
    JobChallengeRatings,
    { safe: Rarity[]; fight: Rarity[] }
> = {
    easy: { safe: ['basic'], fight: ['basic', 'rare'] },
    medium: { safe: ['basic', 'rare'], fight: ['rare', 'epic'] },
    hard: { safe: ['rare'], fight: ['rare', 'epic', 'legendary'] },
    legendary: { safe: ['rare', 'epic'], fight: ['epic', 'legendary'] },
};

/**
 * Returns the highest job tier unlocked at the given guild level.
 * @param guildLevel
 * @param thresholds
 */
export function getUnlockedJobTier(
    guildLevel: number,
    thresholds: JobTierThresholds
): JobChallengeRatings {
    if (guildLevel >= thresholds.legendary) {
        return 'legendary';
    }

    if (guildLevel >= thresholds.hard) {
        return 'hard';
    }

    if (guildLevel >= thresholds.medium) {
        return 'medium';
    }

    return 'easy';
}

/**
 * Returns the job tiers in play for a band: the unlocked tier and the one below it.
 * @param band
 */
export function getJobTiersForBand(
    band: JobChallengeRatings
): JobChallengeRatings[] {
    const index = JOB_TIERS.indexOf(band);

    if (index === 0) {
        return [band];
    }

    return [JOB_TIERS[index - 1], band];
}

/**
 * Selects a job at random from the tiers available at the given guild level, with a
 * small chance of a job from the next locked tier leaking through.
 * @param guildLevel
 * @param thresholds
 * @param spilloverChance percent chance (0-100) of rolling the next locked tier instead
 */
export function selectJobForGuildLevel(
    guildLevel: number,
    thresholds: JobTierThresholds,
    spilloverChance: number
): Job {
    const band = getUnlockedJobTier(guildLevel, thresholds);
    let tiers = getJobTiersForBand(band);

    const spilloverTier = JOB_TIERS[JOB_TIERS.indexOf(band) + 1];
    if (spilloverTier != null && Math.random() < spilloverChance / 100) {
        tiers = [spilloverTier];
    }

    const filteredJobs = jobList.filter((job) => tiers.includes(job.challenge));

    return filteredJobs[Math.floor(Math.random() * filteredJobs.length)];
}
