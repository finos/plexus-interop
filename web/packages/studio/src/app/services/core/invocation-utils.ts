import { MethodType, DiscoveredMethod } from '@plexus-interop/client';
import { Logger, PrefixedLogger } from '@plexus-interop/common';
import { UniqueId } from '@plexus-interop/protocol';

export function createInvocationLogger(type: MethodType, id: number, baseLogger: Logger, target: DiscoveredMethod): Logger {
    const targetPostfix = target ? ` -> ${UniqueId.fromProperties(target.providedMethod.providedService.connectionId).toString()}` : "";
    switch (type) {
        case MethodType.Unary:
            return new PrefixedLogger(baseLogger, `[Unary ${id}${targetPostfix}]`);
        case MethodType.ServerStreaming:
            return new PrefixedLogger(baseLogger, `[ServerStreaming ${id}${targetPostfix}]`);
        case MethodType.ClientStreaming:
            return new PrefixedLogger(baseLogger, `[ClientStreaming ${id}${targetPostfix}]`);
        case MethodType.DuplexStreaming:
            return new PrefixedLogger(baseLogger, `[DuplexStreaming ${id}${targetPostfix}]`);
        default:
            throw new Error('Unknown type');
    }
}   