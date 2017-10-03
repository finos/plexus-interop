
// tag::interop-create[]
const plexusClient = plexus.interop.create({ id: "Web.Acme.Search" });
// end::interop-create[]

// tag::point-to-point-handle[]
plexusClient.provide("com.acme.SearchService.Search", (request) => {
    console.log("Interop API was called with an argument", request);
    return {
        result: ["Search", "Results"]
    };
});
// end::point-to-point-handle[]

// tag::interop-connect[]
plexusClient.connect()
    .then((plexusClient) => {
        console.log("Client has connected to Broker and is ready to invoke remote calls");
    }, error => {
        console.error("Connection to Broker failed: ", error);
    });
// end::interop-connect[]

// tag::point-to-point-call[]
const targetComponent = "Web.Acme.Search";
const targetServiceMethod = "com.acme.SearchService.Search";
const params = {query: "Plexus"};

plexusClient.invoke[targetComponent][targetServiceMethod](params).then(() => {
    console.log("Action was successfully executed");
}, (error) => {
    console.error("Remote invocation failed: ", error);
});
// end::point-to-point-call[]

// tag::discovery[]
const query: DiscoveryQuery = {
    /* query parameters, all optional, see details below */
};
plexusClient.discover(query).then((remoteHandlers: InvocationMetadata[]) => {
    // use one of possible handlers to invoke action
    const remoteHandler = remoteHandlers[0];
    plexusClient.invokeDiscovered(remoteHandler, {param: "value"})
        .subscribe((data) => {
        console.log(`Data received ${data}`);
    }, (error) => {
        console.error("Remote invocation failed: ", error);
    }, () => {
        console.log("Invocation completed");
    });
}, (discoveryError) => {
    console.error(`Discovery query failed ${discoveryError}`);
});
// end::discovery[]

// tag::discovery-query[]
interface DiscoveryQuery {
    application?: ServiceRef;
    action?: ActionRef;
    input?: MessageRef;
    output?: MessageRef;
    broker?: string;
    machineName: string;
    mode?: string;
    location?: string;
}
interface InvocationMetadata {
    application: ServiceRef;
    instance: number;
    action: ActionRef;
    input: MessageRef;
    output: MessageRef;
    stream: boolean;
    timeout: number;
    broker: string;
    machineName: string;
}

interface ServiceRef {
    name: string;
}

interface MessageRef {
    name: string;
}

export interface ActionRef {
    name: string;
}
// end::discovery-query[]

// tag::close[]
plexusClient.disconnect().then(() => {
    console.log("Client has disconnected");
});
// end::close[]
