import { titleList } from '../../data/titles';

import { renderTitleProfile } from './title-profile';

describe('renderTitleProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderTitleProfile(titleList)).toMatchSnapshot();
    });
});
