import { jobList } from '../data/jobs';
import { Job, JobChallengeRatings, JobTierThresholds } from '../types/jobs';

export const JOB_TIERS: JobChallengeRatings[] = [
    'easy',
    'medium',
    'hard',
    'legendary',
];

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
