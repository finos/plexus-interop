import { CcyPairRateViewerClientBuilder, CcyPairRateViewerClient } from "./gen/CcyPairRateViewerGeneratedClient";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";

// Read launch arguments, provided by Electron Launcher
declare var window: any;
const electron = window.require("electron")
const remote = electron.remote;
const webSocketUrl = remote.getCurrentWindow().plexusBrokerWsUrl;
const instanceId = remote.getCurrentWindow().plexusAppInstanceId;

new CcyPairRateViewerClientBuilder()
    // App's ID and Instance ID received from Launcher
    .withClientDetails({
        applicationId: "CcyPairRateViewer",
        applicationInstanceId: instanceId
    })
    // Pass Transport to be used for connecting to Broker
    .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(webSocketUrl)).connect())
    .connect()
    .then((rateViewerClient: CcyPairRateViewerClient) => {
        // Client connected, we can use generated Proxy Service to perform invocation
        rateViewerClient.getCcyPairRateServiceProxy()
            .getRate({ccyPairName: "EURUSD"})
            .then(rateResponse => {
                document.body.innerText = `Received rate ${rateResponse.ccyPairName}-${rateResponse.rate}`;
            })
            .catch(e => console.log("Failed to receive rate", e))
    });
