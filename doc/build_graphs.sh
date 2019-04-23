#!/usr/bin/env bash

set -eo pipefail

for graph in graphs/*.dot; do
    OUTPUT=$(dirname $graph)/$(basename -s .dot $graph).png
    dot -Tpng $graph > $OUTPUT
    optipng $OUTPUT
done
