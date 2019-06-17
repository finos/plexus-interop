import { RetryConfig } from '../../RetryConfig';

export const defaultPromiseRetryConfig: RetryConfig = {
    retriesNum: 3,
    retryTimeoutInMillis: 500
};

type CatchHandler<T> = (error: any) => Promise<T>;

export function retriable<T>(
    action: () => Promise<T>,
    { retriesNum, retryTimeoutInMillis, errorHandler }: RetryConfig = defaultPromiseRetryConfig): () => Promise<T> {
    let count = retriesNum;
    const catchHandler: CatchHandler<T> = (error) => {
        if (count === 0) {
            throw error;
        }
        if (errorHandler) {
            errorHandler(error);
        }
        count--;
        return delayed(action, retryTimeoutInMillis)
                .catch(catchHandler);
    };
    return () => action().catch(catchHandler);
}

export function delayed<T>(action: () => Promise<T>, timeoutInMillis: number = defaultPromiseRetryConfig.retryTimeoutInMillis): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            action()
                .then(resolve)
                .catch(reject);
        }, timeoutInMillis);
    });
} 