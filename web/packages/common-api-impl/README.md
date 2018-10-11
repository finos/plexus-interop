# Implementation for Common API Draft Proposal

Partial implementation for [Common Interop API](https://github.com/finos-plexus/finos-plexus.github.io/blob/master/client-api/client-api.ts). 

## Metadata Setup

Plexus Interop based on Metadata, so each application interracting via Common API should still be defined in metatada. 

* All Methods/Streams/Messages must be defined as regular Plexus Messages and Services
* Method/Stream names, used from client code, should refer to aliases of provided actions. E.g. method, used like below:

```javascript
peer.invoke('close-market-order', { orderId });
```
should be defined in metadata by action provider as following:
```
application ProviderApplication {
    provides OrderService { 
        CloseMarketOrder [(provided_method_alias) = "close-market-order" ]; 
    }
}
```
* All apps should be also marked with aliases in metadata to be discovered by Common API, e.g.:
application connecting to Plexus using
```javascript
const peer = await window.platform.connect('web-trader-client');
```
should be mapped via custom option like this:
```
application WebTraderClient {
    option (app_alias) = "web-trader-client";
}
```

## Implemented methods

API is implemented partially, here is the list of supported features:

  - InvokeMethod

  - SubscribeStream

  - RegisterMethodOnConnect

  - RegisterStreamOnConnect

  - DiscoverMethods

  - DiscoverStreams