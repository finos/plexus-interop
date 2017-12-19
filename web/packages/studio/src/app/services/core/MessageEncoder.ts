
export interface MessageEncoder {
    encode(s: string): ArrayBuffer;
    decode(b: ArrayBuffer): string;
}