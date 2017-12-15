import { TransportConnection } from "@plexus-interop/transport-common";

export type TransportConnectionProvider = () => Promise<TransportConnection>;


