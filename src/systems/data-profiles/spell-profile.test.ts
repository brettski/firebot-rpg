import { spellList } from '../../data/spells';

import { renderSpellProfile } from './spell-profile';

describe('renderSpellProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderSpellProfile(spellList)).toMatchSnapshot();
    });
});
