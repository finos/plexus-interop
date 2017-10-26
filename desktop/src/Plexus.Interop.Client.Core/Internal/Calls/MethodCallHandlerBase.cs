namespace Plexus.Interop.Internal.Calls
{
    using Plexus.Channels;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Interop.Transport;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    internal abstract class MethodCallHandlerBase<TRequest, TResponse> : IMethodCallHandler
    {
        private readonly IIncomingInvocationFactory _incomingInvocationFactory;

        protected MethodCallHandlerBase(IIncomingInvocationFactory incomingInvocationFactory)
        {
            _incomingInvocationFactory = incomingInvocationFactory;
        }

        public async Task HandleAsync(IncomingInvocationDescriptor info, ITransportChannel channel)
        {
            var invocation = _incomingInvocationFactory.CreateAsync<TRequest, TResponse>(info, channel);
            var cancellation = new CancellationTokenSource();
            invocation.Completion
                .ContinueWithSynchronously(_ => cancellation.Cancel(), CancellationToken.None)
                .IgnoreAwait();
            try
            {
                await invocation.StartCompletion.ConfigureAwait(false);
                var context = new MethodCallContext(info.Source.ApplicationId, info.Source.ConnectionId, cancellation.Token);
                await HandleCoreAsync(invocation, context).ConfigureAwait(false);
                invocation.Out.TryCompleteWriting();
            }
            catch (Exception ex)
            {
                invocation.Out.TryTerminateWriting(ex);
                invocation.In.ConsumeBufferedItems(x => { });
                throw;
            }
            finally
            {                
                await invocation.Completion.ConfigureAwait(false);
            }
        }

        protected abstract Task HandleCoreAsync(
            IIncomingInvocation<TRequest, TResponse> invocation,
            MethodCallContext context);
    }
}
