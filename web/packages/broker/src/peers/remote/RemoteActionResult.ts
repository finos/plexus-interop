import { RemoteActionStatus } from "./RemoteActionStatus";
import { ClientError } from "@plexus-interop/protocol";

export interface RemoteActionResult {

    status: RemoteActionStatus;

    payload?: any;

    error?: ClientError;

}

export function isFailed(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.FAILURE;
}

export function isSucceded(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.SUCCESS;
}

export function isCompleted(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.SUCCESS;
}

export function successResult(payload: any): RemoteActionResult {
    return {
        status: RemoteActionStatus.SUCCESS,
        payload
    };
}

export function completedResult(payload?: any): RemoteActionResult {
    return {
        status: RemoteActionStatus.COMPLETED,
        payload
    };
}

export function errorResult(error?: ClientError): RemoteActionResult {
    return {
        error,
        status: RemoteActionStatus.FAILURE
    };
}