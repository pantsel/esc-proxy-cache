# ESC Proxy cache

A reverse proxy with caching and traffic management capabilities.

## Used libraries

### Framework & proxy

- [HapiJS](https://github.com/hapijs/hapi)
- [H2o2](https://github.com/hapijs/h2o2)

### Logging

- [Winston](https://github.com/winstonjs/winston)

### Testing

- [typicode/json-server](https://github.com/typicode/json-server)
- [@hapi/lab](https://hapi.dev/family/lab)
- [@hapi/code](https://hapi.dev/family/code)

### Other

- [Lodash](https://github.com/winstonjs/winston)
- [dotenv](https://github.com/winstonjs/winston)

#### Queue
- [Bull](https://github.com/OptimalBits/bull)

## Flow Charts

- [Request Flow](./docs/flow-charts/request-flow.html)
- [Response Flow](./docs/flow-charts/response-flow.html)

## Run it

To initialize the environment in a **pipeline** or **locally**, check the variables defined in [env.bash](./env.bash) and then execute [init_env.bash](./init_env.bash)  as follow:

```bash
chmod +x ./init_env.bash ; ./init_env.bash
```

Once the .env file is correctly generated, you can run the application locally by executing the following commands in your shell of choice:

```bash
chmod +x run.bash ; ./run.bash
```

The command will install all the necessary dependencies, execute a instance of json-server in background, and the application in foreground.
