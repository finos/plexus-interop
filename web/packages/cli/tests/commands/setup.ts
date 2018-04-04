
import * as path from 'path';
import { getBaseDir } from '../../src/common/files';
import * as approvals from 'approvals';
import { mkdirsSync } from 'fs-extra';

approvals.configure({
    reporters: ['gitdiff'],
    errorOnStaleApprovedFiles: false
});

export function getTestBaseDir(): string {
    return path.resolve(getBaseDir(), '../../../samples/greeting/registry');
}

export function getTestClientInput(): string {
    return 'greeting_client.interop';
}

export function getApprovalsBaseDir(): string {
    return path.join(getBaseDir(), 'tests/approved');
}

export function prepareOutDir(testName: string): string {
    const outDir = path.join(getBaseDir(), 'dist/gen', testName);
    mkdirsSync(outDir);
    return outDir;
}