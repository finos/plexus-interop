/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using IMsLoggerFactory = Microsoft.Extensions.Logging.ILoggerFactory;

    internal sealed class WebSocketServer
    {        
        private static readonly ILogger Log = LogManager.GetLogger<WebSocketServer>();

        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
        private readonly IWebSocketHandler _handler;

        public WebSocketServer(IWebSocketHandler handler)
        {
            _handler = handler;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            Log.Debug("ConfigureServices");
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IMsLoggerFactory loggerFactory, IApplicationLifetime lifetime)
        {
            Log.Debug("Configure");

            LogManager.ConfigureLogging(loggerFactory);

            lifetime.ApplicationStarted.Register(_handler.OnListeningStarted);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseWebSockets(new WebSocketOptions { KeepAliveInterval = TimeSpan.FromSeconds(5)});

            app.Use(async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    try
                    {
                        Log.Trace("Websocket connection received");
                        var connectionTask = await AcceptWebsocketConnectionAsync(context).ConfigureAwait(false);
                        await connectionTask.ConfigureAwait(false);
                        Log.Trace("Websocket connection completed");
                    }
                    catch (Exception ex)
                    {
                        Log.Trace("Websocket connection terminated with exception: {0}", ex.FormatTypeAndMessage());
                        throw;
                    }
                }
                else
                {
                    Log.Trace("Non-websocket request received");
                    await next().ConfigureAwait(false);
                }
            });
        }

        private async Task<Task> AcceptWebsocketConnectionAsync(HttpContext context)
        {
            Task connectionTask;
            await _semaphore.WaitAsync().ConfigureAwait(false);
            try
            {
                Log.Trace("Accepting websocket connection");
                var webSocket = await context.WebSockets.AcceptWebSocketAsync().ConfigureAwait(false);                
                connectionTask = await _handler.StartConnectionAsync(webSocket).ConfigureAwait(false);
                Log.Trace("Websocket connection accepted");
            }
            finally
            {
                _semaphore.Release();
            }
            return connectionTask;
        }
    }
}