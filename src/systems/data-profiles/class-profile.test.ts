import { classList } from '../../data/classes';

import { renderClassProfile } from './class-profile';

describe('renderClassProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderClassProfile(classList)).toMatchSnapshot();
    });
});
