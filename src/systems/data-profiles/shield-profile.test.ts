import { shieldList } from '../../data/shields';

import { renderShieldProfile } from './shield-profile';

describe('renderShieldProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderShieldProfile(shieldList)).toMatchSnapshot();
    });
});
