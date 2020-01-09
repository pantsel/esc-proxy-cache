#!/bin/bash
set -Eeuo pipefail

traperr() {
  echo "ERROR: ${BASH_SOURCE[1]} at about line ${BASH_LINENO[0]}"
}

set -o errtrace
trap traperr ERR

if [[ ! -f $(pwd)/env.bash ]]; then
	cat >&2 <<-'EOF'

The env settings file env.bash is missing:
I cannot continue.

	EOF

  exit 1
fi

### source the env.bash file:
# it defines all the variables
# used in the current script
source $(pwd)/env.bash

### generate the TLS certs
generate_tls_certificate () {

  mkdir -p $tls_dir || :

  if [[ ! -f $(pwd)/$tls_dir/$tls_key_file ]] || [[ ! -f $(pwd)/$tls_dir/$tls_crt_file ]]; then
    echo "TLS certificate setup"

    openssl req -new -newkey rsa:$tls_key_bits -days $tls_expiry -nodes -x509 \
        -subj "/C=$tls_c/ST=$tls_l/L=$tls_l/O=$tls_org/CN=$tls_cn" \
        -keyout $tls_dir/$tls_key_file -out $tls_dir/$tls_crt_file

    chmod 400 $(pwd)/$tls_dir/$tls_key_file
    chmod 400 $(pwd)/$tls_dir/$tls_crt_file
  fi

}

### generate the .env file
# reading the vars defined in env.bash
generate_environment () {
  if [[ ! -f $(pwd)/.env ]]; then
    echo ".env configuration"

    cat >$(pwd)/.env <<EOL
# SERVER
SERVER_OPTIONS_PORT=${server_options_port}
SERVER_OPTIONS_HOST=${server_options_host}
SERVER_OPTIONS_TLS=${server_options_tls}
SERVER_TLS_KEY_PATH=./${tls_dir}/${tls_key_file}
SERVER_TLS_CRT_PATH=./${tls_dir}/${tls_crt_file}

# PROXY
PROXY_H202_UPSTREAMS=${proxy_h202_upstreams}
PROXY_H202_UPSTREAM_REQUEST_PROTOCOL=${proxy_h202_request_protocol}
PROXY_H202_XFORWARD=${proxy_h202_xforward}
PROXY_H202_DOWNSTREAM_RESPONSE_TIME=${proxy_h202_downstream_response_time}
PROXY_H202_PASSTHROUGH=${proxy_h202_passthrough}
PROXY_RETRY_POLICY_RETRIES=${proxy_h202_retry_policy_retries}

# CACHING
CACHE_STRATEGY=${cache_strategy}
CACHE_TTL=${cache_ttl}
CACHE_ENDPOINTS_JSON_FILE_PATH=${cache_endpoints_json_file_path}

# PUBSUB
PUBSUB_STRATEGY=${pubsub_strategy}
SUBSCRIPTION_TIMEOUT=${pubsub_subscription_timeout}
EOL
  fi
}

report () {
	cat >&2 <<-'EOF'

I've successfully initialized the proxy environment.
Check the settings before starting the app:

	EOF

  cat $(pwd)/.env

}

generate_tls_certificate ; generate_environment ; report
