import { UniqueId } from "@plexus-interop/transport-common";
import { ReadOnlyCancellationToken } from "@plexus-interop/common";

export class MethodInvocationContext {
    constructor(
        public readonly consumerApplicationId: string,
        public readonly consumerConnectionId: UniqueId,
        public readonly cancellationToken: ReadOnlyCancellationToken
    ) { }
}