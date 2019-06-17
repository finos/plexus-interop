
import { delayed, retriable, defaultPromiseRetryConfig } from '../../src/util/async/promises';
import { RetryConfig } from '../../src/RetryConfig';

const expectedResult = 1;
const expectedError = new Error('Error');
const plainAction = async () => expectedResult;
const errorAction = async () => { throw expectedError; };

describe('Retriable invocation', () => {

    it('Should make N retries if action is failing', async () => {
        const retriesNum = 3;
        let retriesCount = retriesNum;
        // fail on N - 1 invocations and return res on last try
        const actionMock = jest.fn(() => {
            if (retriesCount > 1) {
                retriesCount--;
                throw expectedError;
            } else {
                return plainAction();
            }
        });
        const retryConfig: RetryConfig = {...defaultPromiseRetryConfig, retriesNum};
        const retriableAction = retriable(async () => actionMock(), retryConfig);
        const result = await retriableAction();
        expect(result).toBe(expectedResult);
        expect(actionMock.mock.calls.length).toBe(retriesNum);
        expect(actionMock.mock.results.filter(r => r.isThrow).length).toBe(retriesNum - 1);
    });

    it('Should fail if all retries failed', async () => {
        const retriesNum = 3;
        const actionMock = jest.fn(errorAction);
        const retryConfig: RetryConfig = {...defaultPromiseRetryConfig, retriesNum};
        const retriableAction = retriable(actionMock, retryConfig);
        try {
            await retriableAction();            
            fail('Should fail');
        } catch (error) {
            expect(error).toBe(expectedError);
            expect(actionMock.mock.calls.length).toBe(retriesNum + 1);
        }
    });

    it('Should call error handler if provided', async () => {
        const retriesNum = 3;
        const actionMock = jest.fn(errorAction);
        const errorHandler = jest.fn();
        const retryConfig: RetryConfig = {...defaultPromiseRetryConfig, retriesNum, errorHandler};
        const retriableAction = retriable(actionMock, retryConfig);
        try {
            await retriableAction();            
            fail('Should fail');
        } catch (error) {
            expect(errorHandler.mock.calls.length).toBe(retriesNum);
            errorHandler.mock.calls.forEach(call => expect(call[0]).toBe(expectedError));
        }
    });

});

describe('Delayed promise invocation', () => {

    it('Should invoke action after delay', async () => {
        const actionMock = jest.fn(plainAction);
        const delayedAction = delayed(actionMock, 5);
        expect(actionMock.mock.calls.length).toBe(0);
        const result = await delayedAction;
        expect(result).toBe(expectedResult);
        expect(actionMock.mock.calls.length).toBe(1);
    });

    it('Should fail with target action\'s error if raised', async () => {
        const actionMock = jest.fn(errorAction);
        const delayedAction = delayed(actionMock, 5);
        expect(actionMock.mock.calls.length).toBe(0);
        try {
            await delayedAction;
            fail('Should raise error');
        } catch (error) {
            expect(actionMock.mock.calls.length).toBe(1);
            expect(error).toBe(expectedError);
        }
    });

});