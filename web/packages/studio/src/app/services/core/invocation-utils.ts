import { MethodType } from '@plexus-interop/client';
import { Logger, PrefixedLogger } from '@plexus-interop/common';

export function createInvocationLogger(type: MethodType, id: number, baseLogger: Logger): Logger {
    switch (type) {
        case MethodType.Unary:
            return new PrefixedLogger(baseLogger, `[Unary ${id}]`);
        case MethodType.ServerStreaming:
            return new PrefixedLogger(baseLogger, `[ServerStreaming ${id}]`);
        case MethodType.ClientStreaming:
            return new PrefixedLogger(baseLogger, `[ClientStreaming ${id}]`);
        case MethodType.DuplexStreaming:
            return new PrefixedLogger(baseLogger, `[DuplexStreaming ${id}]`);
        default:
            throw new Error('Unknown type');
    }
}   