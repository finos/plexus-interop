

export interface StreamingInvocationClient<T> {

    next(value: T): Promise<void>;

    complete(): Promise<void>;

    error(e: any): void;

}