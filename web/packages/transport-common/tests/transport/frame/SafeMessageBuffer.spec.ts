import { SafeMessageBuffer } from "../../../src";

describe("SafeMessagesBuffer", () => {

    it("Performs sync buffer increase if limit not reached", () => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);

        const safeBuffer = new SafeMessageBuffer(() => {});
        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, false);

        expect(new Uint32Array(safeBuffer.getCurrentBuffer()))
            .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7]));
            
    });

    it("Adds chunks to queue if reached the limit and concatenate after timeout", done => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);

        const safeBuffer = new SafeMessageBuffer(() => {}, () => {}, 1, 10);

        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, false);
        expect(safeBuffer.getCurrentBuffer().byteLength).toEqual(0);

        setTimeout(() => {
            expect(new Uint32Array(safeBuffer.getCurrentBuffer()))
                .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7]));
            done();
        }, 50);
            
    });

    it("Forces message and buffer flush if last chunk received", done => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);

        const safeBuffer = new SafeMessageBuffer(message => {
            expect(new Uint32Array(message))
                .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7]));
            done();
        }, () => {}, 1, 10);

        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, true);
            
    });

});