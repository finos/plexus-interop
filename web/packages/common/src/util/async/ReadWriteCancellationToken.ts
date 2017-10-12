import { CancellationToken } from "./CancellationToken";

export class ReadWriteCancellationToken {

    constructor(
        private readonly readToken: CancellationToken = new CancellationToken(),
        private readonly writeToken: CancellationToken = new CancellationToken()
    ) {}

    public cancelRead(reason: string = "Read cancelled") {
        this.readToken.cancel(reason);
    }

    public cancelWrite(reason: string = "Write cancelled") {
        this.writeToken.cancel(reason)
    }

    public isCancelled(): boolean {
        return this.readToken.isCancelled() && this.writeToken.isCancelled();
    } 

    public cancel(reason: string = "Cancelled") {
        this.cancelRead(reason);
        this.cancelWrite(reason);
    }

    public isReadCancelled(): boolean {
        return this.readToken.isCancelled();
    }

    public isWriteCancelled(): boolean {
        return this.writeToken.isCancelled();
    }

    public getReadToken(): CancellationToken {
        return this.readToken;
    }

    public getWriteToken(): CancellationToken {
        return this.writeToken;
    }

}