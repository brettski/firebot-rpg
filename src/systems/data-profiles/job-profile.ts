import { jobList } from '../../data/jobs';
import { Job, JobChallengeRatings } from '../../types/jobs';
import { JOB_LOOT_TABLE } from '../jobs';

import { markdownTable } from './markdown-table';

const TIERS: JobChallengeRatings[] = ['easy', 'medium', 'hard', 'legendary'];
const ITEM_TYPES = [
    'weapon',
    'armor',
    'shield',
    'spell',
    'title',
    'characterClass',
] as const;
const TENDENCY_STATS = ['happiness', 'resources', 'research'] as const;

function bucketOf(job: Job): 'safe' | 'fight' {
    return job.encounter == null ? 'safe' : 'fight';
}

export function renderTierSummaryTable(jobs: Job[]): string {
    const headers = [
        'tier',
        'total',
        'safe',
        'fight',
        '$ safe',
        '$ fight',
        'rarity (safe)',
        'rarity (fight)',
    ];
    const rows = TIERS.map((tier) => {
        const safe = jobs.filter(
            (j) => j.challenge === tier && bucketOf(j) === 'safe'
        );
        const fight = jobs.filter(
            (j) => j.challenge === tier && bucketOf(j) === 'fight'
        );
        const money = (g: Job[]) =>
            [...new Set(g.map((j) => j.loot.money ?? 0))]
                .sort((a, b) => a - b)
                .join('/');
        return [
            tier,
            safe.length + fight.length,
            safe.length,
            fight.length,
            money(safe),
            money(fight),
            `[${JOB_LOOT_TABLE[tier].safe.join(',')}]`,
            `[${JOB_LOOT_TABLE[tier].fight.join(',')}]`,
        ];
    });
    return markdownTable(headers, rows);
}

export function renderItemTypeCoverageTable(jobs: Job[]): string {
    const headers = ['tier/bucket', ...ITEM_TYPES];
    const rows: (string | number)[][] = [];
    for (const tier of TIERS) {
        for (const bucket of ['safe', 'fight'] as const) {
            const g = jobs.filter(
                (j) => j.challenge === tier && bucketOf(j) === bucket
            );
            rows.push([
                `${tier}/${bucket}`,
                ...ITEM_TYPES.map(
                    (t) => g.filter((j) => j.loot.item?.itemType === t).length
                ),
            ]);
        }
    }
    return markdownTable(headers, rows);
}

export function renderEncounterStyleTable(jobs: Job[]): string {
    const headers = ['style', 'count', 'example ids'];
    const nameJobs = jobs.filter((j) =>
        TIERS.includes(j.encounter as JobChallengeRatings)
    );
    const idJobs = jobs.filter(
        (j) =>
            j.encounter != null &&
            !TIERS.includes(j.encounter as JobChallengeRatings)
    );
    const noneJobs = jobs.filter((j) => j.encounter == null);
    const examples = (g: Job[]) =>
        `${g
            .slice(0, 5)
            .map((j) => j.id)
            .join(', ')}, ...`;
    return markdownTable(headers, [
        ['difficulty name', nameJobs.length, examples(nameJobs)],
        ['hardcoded monster id', idJobs.length, examples(idJobs)],
        ['none (safe job)', noneJobs.length, examples(noneJobs)],
    ]);
}

export function renderWorldTendencyTable(
    jobs: Job[],
    bucket: 'all' | 'fight' | 'safe' = 'all'
): string {
    const filtered =
        bucket === 'all' ? jobs : jobs.filter((j) => bucketOf(j) === bucket);
    const headers = [
        'tier',
        'happiness (0,1,2)',
        'resources (0,1,2)',
        'research (0,1,2)',
        'job total',
    ];
    const rows = TIERS.map((tier) => {
        const g = filtered.filter((j) => j.challenge === tier);
        const cells = TENDENCY_STATS.map((stat) => {
            const counts = { 0: 0, 1: 0, 2: 0 };
            g.forEach((j) => {
                const v = j.world_tendency[stat] as 0 | 1 | 2;
                counts[v] = (counts[v] ?? 0) + 1;
            });
            return `${counts[0]},${counts[1]},${counts[2]}`;
        });
        return [tier, ...cells, g.length];
    });
    return markdownTable(headers, rows);
}

export function renderJobProfile(
    tendencyBucket: 'all' | 'fight' | 'safe' = 'all',
    jobs: Job[] = jobList
): string {
    return [
        '# Job Data Profile\n',
        '## 1. Tier summary\n',
        renderTierSummaryTable(jobs),
        '\n## 2. Item type coverage by tier/bucket\n',
        renderItemTypeCoverageTable(jobs),
        '\n## 3. Encounter style audit\n',
        renderEncounterStyleTable(jobs),
        `\n## 4. World tendency distribution by tier (bucket: ${tendencyBucket})\n`,
        renderWorldTendencyTable(jobs, tendencyBucket),
    ].join('\n');
}
