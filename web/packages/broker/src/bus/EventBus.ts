

export interface EventBus {

    subscribe(key: string, listener: (payload: any) => void): Promise<void>;

    publish(key: string, payload: any): void;

}