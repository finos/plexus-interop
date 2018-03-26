
import * as path from 'path';
import * as os from 'os';
import { getDirectories } from './files';

export function getJreDownloadUrl(): string {
    const platform = `${os.platform()}-${os.arch()}`;
    return process.env[`PLEXUS_JRE_DOWNLOAD_URL_${platform.toUpperCase()}`]
        || process.env.PLEXUS_JRE_DOWNLOAD_URL
        || getDefaultDownloadUrlPlatform(platform);
}

export function getDefaultDownloadUrlPlatform(platform: string): string {
    switch (platform) {
        case 'win32-x32':
            return 'http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jre-8u161-windows-i586.tar.gz';
        case 'win32-x64':
            return 'http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jre-8u161-windows-x64.tar.gz';
        default:
            throw new Error(`${platform} is not supported`);
    }
}

export function getJreBaseDir(downloadDir: string): string {
    const childs = getDirectories(downloadDir);
    if (childs.length === 0) {
        throw new Error('No JRE found');
    }
    return path.join(downloadDir, childs[0]);
}

export async function getJavaExecPath(): Promise<string> {
    const baseDir = getJreBaseDir(getJreDownloadDir());
    const platform = os.platform();
    switch (platform) {
        case 'win32':
            return path.join(baseDir, 'bin', 'java.exe');
        default:
            throw new Error(`${platform} is not supported`);
    }
}

export const getJreDownloadDir = () => path.join(getDistDir(), 'jre');

export const getJavaGenLibPath = () => path.join(getDistDir(), 'lib', 'plexusgen.jar');

function getDistDir(): string {
    return path.normalize(path.join(__dirname, '..', '..', '..'));
}