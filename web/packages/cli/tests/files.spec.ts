
import { getDistDir } from '../src/common/files';

describe('File utilities', () => {

    it('Returns dist folder', () => {
        expect(getDistDir()).toMatch(/.+[\\\/]{1}dist/g);
    });

});