
export interface AsyncHandler<Req, Res> {
    handle(input: Req): Promise<Res>;
}