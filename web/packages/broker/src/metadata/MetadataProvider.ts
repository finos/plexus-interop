import { InteropMetadata } from "./InteropMetadata";

export interface MetadataProvider {
    getMetadata(): Promise<InteropMetadata>;
}