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
import { AppLauncher } from "./AppLauncher";
import { UrlWebAppLauncher } from "./UrlWebAppLauncher";

export class AppLauncherRegistry {

    public static readonly URL_APP_LAUNCHER: string = "plexus.interop.UrlWebAppLauncher";

    private static registry: Map<string, AppLauncher> = new Map<string, AppLauncher>();

    public static registerAppLauncher(id: string, launcher: AppLauncher): void {
        AppLauncherRegistry.registry.set(id, launcher);
    }

    public static getAppLauncher(launcherId: string): AppLauncher {
        const res = this.registry.get(launcherId);
        if (!res) {
            throw new Error(`App Launcher with [${launcherId}] ID is not found`);
        }
        return res;
    }

}

AppLauncherRegistry.registerAppLauncher(AppLauncherRegistry.URL_APP_LAUNCHER, new UrlWebAppLauncher());
