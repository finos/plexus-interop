
export interface RetryConfig {
    retriesNum: number;
    retryTimeoutInMillis: number;
    errorHandler?: (e: any) => void;
}