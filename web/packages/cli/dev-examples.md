
# Gen Proto files

```
node plexus.js gen-proto -b ../../../samples/greeting/registry -i '*.interop'  -v true
```

# Gen Typescript client

```
node plexus.js gen-ts -b ../../../samples/greeting/registry -i greeting_client.interop
```

# Gen CSharp client

```
node plexus.js gen-csharp -b -b ../../../samples/greeting/registry -i greeting_client.interop
```

# Validate Metadata

```
node plexus.js validate -b ../../../samples/greeting/registry
```

