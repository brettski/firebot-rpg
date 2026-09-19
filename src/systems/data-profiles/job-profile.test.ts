import { jobList } from '../../data/jobs';

import { renderJobProfile, renderWorldTendencyTable } from './job-profile';

describe('renderJobProfile', () => {
    it('matches the recorded profile', () => {
        expect(renderJobProfile('all', jobList)).toMatchSnapshot();
    });

    it.each(['fight', 'safe'] as const)(
        'world tendency table matches the recorded snapshot for bucket=%s',
        (bucket) => {
            expect(renderWorldTendencyTable(jobList, bucket)).toMatchSnapshot();
        }
    );
});
