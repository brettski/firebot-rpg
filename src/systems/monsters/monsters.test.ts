import { monsterList } from '../../data/monsters';
import { filterArrayByProperty } from '../utils';

import { DEFAULT_MONSTER_RARITY } from './monster-generation';
import { getMonsterByDifficulty, getMonsterByID } from './monsters';

jest.mock('../../firebot/firebot', () => ({
    logger: jest.fn(),
}));

describe('getMonsterByID', () => {
    // Regression test for the filterArrayByProperty substring-matching bug (#24).
    // getMonsterByID(id) itself can't detect the bug on this data: ids 1, 11, 21, 31,
    // 41 all exist, so searching for 1 matches all five by substring, but the id-1
    // entry still sorts first in monsterList, so `.filter()[0]` happens to return the
    // right monster anyway -- exactly the ordering coincidence noted when this was
    // found. Assert on the intermediate match set directly instead, which is what
    // actually silently breaks if the list is ever reordered or a colliding id added.
    it('matches exactly one monster by id, not every id containing it as a substring', () => {
        const matches = filterArrayByProperty(monsterList, ['id'], 1);
        expect(matches).toHaveLength(1);
        expect(matches[0].id).toBe(1);
    });

    it.each([1, 11, 21, 31, 41])('returns the monster with id %i', (id) => {
        const result = getMonsterByID(id);
        expect(result.id).toBe(id);
    });

    it('returns undefined for an id that does not exist', () => {
        const nonExistentId = Math.max(...monsterList.map((m) => m.id)) + 1000;
        expect(getMonsterByID(nonExistentId)).toBeUndefined();
    });
});

describe('DEFAULT_MONSTER_RARITY', () => {
    // Regression guard for the guild trial (#10). The trial forces a champion's *class* to a
    // specific tier via generateMonster's separate `forcedClass` parameter. This constant is
    // what every other roll -- weapon, armor, title, offhand -- keeps using, so if it ever
    // grows 'legendary', the untouched `!rpg job` path (rpg-job.ts:274) silently starts
    // handing monsters legendary gear.
    it('stays capped at basic/rare/epic', () => {
        expect(DEFAULT_MONSTER_RARITY).toEqual(['basic', 'rare', 'epic']);
    });
});

describe('getMonsterByDifficulty', () => {
    it.each(['easy', 'medium', 'hard', 'legendary'] as const)(
        'only returns %s-difficulty monsters',
        (difficulty) => {
            // Sample repeatedly since selection is random; every result must be in-tier.
            for (let i = 0; i < 20; i += 1) {
                const result = getMonsterByDifficulty(difficulty);
                expect(result.difficulty).toContain(difficulty);
            }
        }
    );
});
