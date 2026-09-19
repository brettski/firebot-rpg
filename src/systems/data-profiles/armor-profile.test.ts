import { armorList } from '../../data/armor';

import { renderArmorProfile } from './armor-profile';

describe('renderArmorProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderArmorProfile(armorList)).toMatchSnapshot();
    });
});
