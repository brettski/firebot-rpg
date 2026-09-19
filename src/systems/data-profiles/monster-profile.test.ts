import { monsterList } from '../../data/monsters';

import { renderMonsterProfile } from './monster-profile';

describe('renderMonsterProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderMonsterProfile(monsterList)).toMatchSnapshot();
    });
});
