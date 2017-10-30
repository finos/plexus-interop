
import { clientProtocol as plexus, SuccessCompletion } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { Completion } from "@plexus-interop/client";
import { Observable } from "rxjs/Observable";
import { RegistryService } from "../metadata/RegistryService";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportChannel } from "@plexus-interop/transport-common";
import { LoggerFactory, Logger } from "@plexus-interop/common";
import { ConsumedMethodReference } from "../metadata/ConsumedMethodReference";

export class InvocationRequestHandler {

    private readonly log: Logger = LoggerFactory.getLogger("InvocationRequestHandler");

    constructor(
        private readonly registryService: RegistryService,
        private readonly appLifeCycleManager: AppLifeCycleManager) {}

    public async handleRequest(
        $inMessages: Observable<ArrayBuffer>,
        invocationRequest: plexus.interop.protocol.IInvocationStartRequest, 
        sourceChannel: TransportChannel,
        sourceConnectionDescriptor: ApplicationConnectionDescriptor): Promise<Completion> {

        const sourceChannelId = sourceChannel.uuid().toString();
        const sourceConnectionId = sourceConnectionDescriptor.connectionId.toString();

        if (this.log.isDebugEnabled()) {
            this.log.debug(`Hanling start invocation request [${sourceChannelId}] from [${sourceConnectionId}]`);
        }

        

        return new SuccessCompletion();
    }

    // private async resolveTargetConnection(methodReference: ConsumedMethodReference, source: ApplicationConnectionDescriptor) {
    //     const targetMethods = this.registryService.getMatchingProvidedMethods()
    // }

}