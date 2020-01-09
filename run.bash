#!/bin/bash
set -Eeuo pipefail

traperr() {
  echo "ERROR: ${BASH_SOURCE[1]} at about line ${BASH_LINENO[0]}"
}

set -o errtrace
trap traperr ERR

command_exists() {
	command -v "$@" > /dev/null 2>&1
}

install_deps () {
    echo "Installing dependencies"
    yarn install
}

run_jsonserver () {
    echo "Lifting json-server"
    yarn json-server &
}

run_app () {
    echo "Starting the application"
    yarn start
}

command_exists yarn ; install_deps ; run_jsonserver ; run_app
