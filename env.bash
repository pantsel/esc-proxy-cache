#!/bin/bash

### variables definition to initialize the app locally
# or in a pipeline

### TLS
tls_dir=secrets/tls
tls_crt_file=esc.crt
tls_key_file=esc.key
tls_key_bits=4096
tls_expiry=365
tls_cn=esc.hyperd.sh
tls_org=esc.hyperd
tls_l=Amsterdam
tls_c=NL

### Server
server_options_port=3000
server_options_host=0.0.0.0
server_options_tls=true

### Proxy
proxy_h202_upstreams=localhost:3001
proxy_h202_request_protocol=http
proxy_h202_xforward=true
proxy_h202_downstream_response_time=true
proxy_h202_passthrough=true
proxy_h202_retry_policy_retries=3

### Caching
cache_strategy=memory
cache_ttl=10000
cache_rolling_ttl=true
cache_endpoints_json_file_path=$(pwd)/test/upstream-server/cacheable-endpoints.json

### pubsub
pubsub_strategy=memory
pubsub_subscription_timeout=30000

### queue
queue_strategy=memory
queue_name=queue