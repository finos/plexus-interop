import { AppLauncher } from "./AppLauncher";


export class AppLauncherRegistry {

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