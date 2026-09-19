import { weaponList } from '../../data/weapons';

import { renderWeaponProfile } from './weapon-profile';

describe('renderWeaponProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderWeaponProfile(weaponList)).toMatchSnapshot();
    });
});
