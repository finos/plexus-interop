

export interface Storage {

    get(key: string): Promise<void>;

    set(key: string, payload: any): Promise<void>;

}

