/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
namespace Plexus.Channels
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Shouldly;
    using Xunit;

    public sealed class BufferedChannelTests : TestsSuite
    {
        [Fact]
        public void TryWriteReturnsFalseWhenBufferIsFull()
        {
            var sut = new BufferedChannel<int>(0);
            sut.TryWrite(1).ShouldBe(false);
        }

        [Fact]
        public void TryWriteReturnsTrueWhenBufferIsNotFull()
        {
            var sut = new BufferedChannel<int>(1);
            sut.TryWrite(1).ShouldBe(true);
        }

        [Fact]
        public void TryReadReturnsFalseWhenBufferIsEmpty()
        {
            var sut = new BufferedChannel<int>(1);
            sut.TryRead(out int _).ShouldBe(false);
        }

        [Fact]
        public void TryReadReturnsTrueWhenBufferIsNotEmpty()
        {
            var sut = new BufferedChannel<int>(1);
            sut.TryWrite(1).ShouldBe(true);
            sut.TryRead(out int _).ShouldBe(true);
        }

        [Fact]
        public void WritesSynchronouslyWhenBufferHasSpace()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryWrite(1).ShouldBe(true);
            sut.TryWrite(2).ShouldBe(true);
            sut.TryWrite(3).ShouldBe(false);
            sut.TryRead(out int item).ShouldBe(true);
            item.ShouldBe(1);
            sut.TryWrite(4).ShouldBe(true);
        }

        [Fact]
        public void WriteAsyncCompletesWhenThereIsBufferSpaceAvailable()
        {
            var sut = new BufferedChannel<int>(1);
            Should.CompleteIn(sut.WriteAsync(1), Timeout1Sec);
            var writeTask = sut.WriteAsync(2);
            writeTask.IsCompleted.ShouldBe(false);
            sut.TryRead(out var item).ShouldBe(true);
            item.ShouldBe(1);
            Should.CompleteIn(writeTask, Timeout1Sec);
            sut.TryRead(out item).ShouldBe(true);
            item.ShouldBe(2);
        }

        [Fact]
        public void TryCompleteReturnsFalseIfChannelIsAlreadyCompleted()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryComplete().ShouldBe(true);
            sut.TryComplete().ShouldBe(false);
        }

        [Fact]
        public void CompleteThrowsExceptionIfChannelIsAlreadyCompleted()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryComplete().ShouldBe(true);
            Should.Throw<OperationCanceledException>(() => sut.Complete());
        }

        [Fact]
        public void CompletionSuccessfulAfterCompleteCalledWithoutException()
        {
            var sut = new BufferedChannel<int>(2);
            sut.Complete();
            sut.Completion.Status.ShouldBe(TaskStatus.RanToCompletion);
        }

        [Fact]
        public void CompletionSuccessfulAfterTryCompleteCalledWithoutException()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryComplete();
            sut.Completion.Status.ShouldBe(TaskStatus.RanToCompletion);
        }

        [Fact]
        public void CompletionHasErrorAfterCompleteCalledWithException()
        {
            var sut = new BufferedChannel<int>(2);
            var exception = new ArgumentOutOfRangeException();
            sut.Terminate(exception);
            sut.Completion.IsFaulted.ShouldBe(true);
            sut.Completion.Exception.ShouldNotBe(null);
            sut.Completion.Exception.InnerException.ShouldBe(exception);
        }

        [Fact]
        public void CompletionHasErrorAfterFail()
        {
            var sut = new BufferedChannel<int>(2);
            var exception = new ArgumentOutOfRangeException();
            sut.Terminate(exception);
            sut.Completion.IsFaulted.ShouldBe(true);
            sut.Completion.Exception.ShouldNotBe(null);
            sut.Completion.Exception.InnerException.ShouldBe(exception);
        }

        [Fact]
        public void CompletionIsCanceledAfterCancellation()
        {
            var sut = new BufferedChannel<int>(2);
            sut.Terminate();
            sut.Completion.IsCanceled.ShouldBe(true);
            sut.Completion.Exception.ShouldBeNull();
        }

        [Fact]
        public void CannotWriteAfterCompletion()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryWrite(1);
            sut.Complete();
            sut.TryWrite(2).ShouldBe(false);
            Should.Throw<OperationCanceledException>(() => sut.WriteAsync(2));
        }

        [Fact]
        public void CanReadAfterCompletionUntilBufferIsEmpty()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryWrite(1);
            sut.TryWrite(2);
            sut.TryComplete();
            sut.Completion.IsCompleted.ShouldBe(false);
            sut.TryRead(out int _).ShouldBe(true);
            sut.Completion.IsCompleted.ShouldBe(false);
            sut.TryRead(out int _).ShouldBe(true);
            sut.Completion.IsCompleted.ShouldBe(true);
            sut.TryRead(out int _).ShouldBe(false);
            Should.Throw<TaskCanceledException>(() => sut.ReadAsync().AsTask());
        }

        [Fact]
        public void CompleteAbortsPendingWriteTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var writeTask1 = sut.WriteAsync(1);
            var writeTask2 = sut.WriteAsync(2);
            sut.Complete();
            Should.Throw<TaskCanceledException>(() => writeTask1, Timeout1Sec);
            Should.Throw<TaskCanceledException>(() => writeTask2, Timeout1Sec);
        }

        [Fact]
        public void CompleteAbortsPendingReadTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var readTask1 = sut.ReadAsync();
            var readTask2 = sut.ReadAsync();
            sut.Complete();
            Should.Throw<TaskCanceledException>(() => readTask1.AsTask(), Timeout1Sec);
            Should.Throw<TaskCanceledException>(() => readTask2.AsTask(), Timeout1Sec);
        }

        [Fact]
        public void CancellationCancelsReadTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var task1 = sut.TryReadAsync();
            var task2 = sut.TryReadAsync();
            sut.Terminate();
            Should.Throw<OperationCanceledException>(task1.AsTask(), Timeout1Sec);
            Should.Throw<OperationCanceledException>(task2.AsTask(), Timeout1Sec);
        }

        [Fact]
        public void CancellationCancelsWriteTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var task1 = sut.TryWriteAsync(1);
            var task2 = sut.TryWriteAsync(1);
            sut.Terminate();
            Should.Throw<OperationCanceledException>(task1, Timeout1Sec);
            Should.Throw<OperationCanceledException>(task2, Timeout1Sec);
        }

        [Fact]
        public void FailCancelsReadTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var task1 = sut.TryReadAsync();
            var task2 = sut.TryReadAsync();
            sut.Terminate(new InvalidOperationException());
            Should.Throw<InvalidOperationException>(task1.AsTask(), Timeout1Sec);
            Should.Throw<InvalidOperationException>(task2.AsTask(), Timeout1Sec);
        }

        [Fact]
        public void FailCancelsWriteTasks()
        {
            var sut = new BufferedChannel<int>(0);
            var task1 = sut.TryWriteAsync(1);
            var task2 = sut.TryWriteAsync(1);
            sut.Terminate(new InvalidOperationException());
            Should.Throw<InvalidOperationException>(task1, Timeout1Sec);
            Should.Throw<InvalidOperationException>(task2, Timeout1Sec);
        }

        [Fact]
        public void CancellationCompletesChannel()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryWrite(1);
            sut.TryWrite(2);
            sut.Terminate();
            sut.Completion.IsCompleted.ShouldBe(false);
            sut.TryRead(out int _).ShouldBe(true);
            sut.TryRead(out int _).ShouldBe(true);
            Should.Throw<TaskCanceledException>(sut.TryReadAsync().AsTask(), Timeout1Sec);
            sut.Completion.IsCanceled.ShouldBeTrue();
        }

        [Fact]
        public void TerminationCompletesChannelWithException()
        {
            var sut = new BufferedChannel<int>(2);
            sut.TryWrite(1);
            sut.TryWrite(2);
            sut.Terminate(new InvalidOperationException());
            sut.Completion.IsCompleted.ShouldBe(false);
            sut.TryRead(out int _).ShouldBe(true);
            sut.TryRead(out int _).ShouldBe(true);
            Should.Throw<InvalidOperationException>(() => sut.TryReadAsync().AsTask(), Timeout1Sec);
            sut.Completion.IsFaulted.ShouldBeTrue();
        }

        [Fact]
        public void ThrowsExceptionIfNegativeBufferSizeSpecified()
        {
            // ReSharper disable once ObjectCreationAsStatement
            Should.Throw<ArgumentOutOfRangeException>(() => new BufferedChannel<int>(-1));
        }

        [Fact]
        public void TerminatesOnWriteTimeout()
        {
            var sut = new BufferedChannel<int>(1, Timeout100Ms);
            Should.NotThrow(sut.WriteAsync(1), Timeout1Sec);
            sut.TryWrite(1).ShouldBe(false);
            Should.Throw<ChannelWriteTimeoutException>(sut.WaitWriteAvailableAsync(), Timeout1Sec);
            Should.Throw<ChannelWriteTimeoutException>(sut.Out.Completion, Timeout1Sec);
            sut.TryRead(out _).ShouldBe(true);
            Should.Throw<Exception>(sut.Completion, Timeout1Sec);
        }

        [Fact]
        public async Task SlidesWriteTimeoutAfterWriteAvailable()
        {
            var sut = new BufferedChannel<int>(1, Timeout50Ms);
            sut.TryWrite(1).ShouldBe(true);
            await Task.Delay(Timeout10Ms).ConfigureAwait(false);
            sut.TryRead(out _).ShouldBe(true);
            await Task.Delay(Timeout100Ms).ConfigureAwait(false);
            sut.Out.Completion.IsCompleted.ShouldBeFalse();
            Should.NotThrow(() => sut.WriteAsync(1), Timeout1Sec);
            await Task.Delay(Timeout10Ms).ConfigureAwait(false);
            sut.TryRead(out _).ShouldBe(true);
        }

        [Theory]
        [InlineData(1, 1, 1)]
        [InlineData(1, 1, 3)]
        [InlineData(1, 1, 10)]
        [InlineData(2, 1, 1)]
        [InlineData(2, 1, 3)]
        [InlineData(2, 1, 10)]
        [InlineData(1, 2, 1)]
        [InlineData(1, 2, 3)]
        [InlineData(1, 2, 10)]
        [InlineData(2, 2, 1)]
        [InlineData(2, 2, 3)]
        [InlineData(2, 2, 10)]
        [InlineData(4, 4, 1)]
        [InlineData(4, 4, 3)]
        [InlineData(4, 4, 10)]
        [InlineData(7, 3, 1)]
        [InlineData(7, 3, 3)]
        [InlineData(7, 3, 10)]
        [InlineData(3, 7, 1)]
        [InlineData(3, 7, 3)]
        [InlineData(3, 7, 10)]
#pragma warning disable xUnit1026 // Theory methods should use all of their parameters
        public void CanWriteAndReadFromSeveralThreadsConcurrently(int writeThreads, int readThreads, int bufferSize)
#pragma warning restore xUnit1026 // Theory methods should use all of their parameters
        {
            var writeCount = readThreads * 100;
            var readCount = writeThreads * 100;
            var sut = new BufferedChannel<int>(bufferSize);

            async Task WriteWorker()
            {
                for (var i = 0; i < writeCount; i++)
                {
                    await sut.WriteAsync(i).ConfigureAwait(false);
                }
            }

            async Task ReadWorker()
            {
                for (var i = 0; i < readCount; i++)
                {
                    await sut.ReadAsync().ConfigureAwait(false);
                }
            }

            var writeTasks = Enumerable.Range(0, writeThreads).Select(_ => Task.Run(WriteWorker));
            var readTasks = Enumerable.Range(0, readThreads).Select(_ => Task.Run(ReadWorker));
            var allTasks = writeTasks.Concat(readTasks).ToArray();

            Task.WhenAll(allTasks).ShouldCompleteIn(Timeout10Sec);

            sut.TryRead(out int _).ShouldBe(false);
            sut.TryComplete().ShouldBe(true);
        }
    }
}