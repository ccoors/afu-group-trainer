#!/usr/bin/env bash

set -e
lowres_sizes=(16 24 32 48)
sizes=(64 128 144 180 192 256 512 1024)
input="favicon"

for size in "${lowres_sizes[@]}"; do
    inkscape -z -e ${input}_${size}.png -w $size -h $size ${input}_lowres.svg
done

for size in "${sizes[@]}"; do
    inkscape -z -e ${input}_${size}.png -w $size -h $size $input.svg
done

exiftool -all= *.png
rm *_original
optipng *.png
icotool -c -o $input.ico ${input}_16.png ${input}_32.png ${input}_48.png
