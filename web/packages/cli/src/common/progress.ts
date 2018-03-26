
import * as ProgressBar from 'progress';

export function printProgress(response: any, text: string): void {
    text = text || 'Downloading';
    const length = parseInt(response.headers['content-length'], 10);
    const progress = new ProgressBar(`${text} [:bar] :percent :etas`, {
        complete: '=',
        incomplete: '.',
        width: 80,
        total: length
    });
    response.on('data', (chunk: any) => progress.tick(chunk.length));
}
