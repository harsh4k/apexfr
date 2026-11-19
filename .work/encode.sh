#!/bin/sh
# encode.sh NNN OUTDIR  — blend AI upscale with a touch of the original, sharpen, write 2560 + 1920 WebP
n=$1; out=$2
W=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ffmpeg -v error -y -i "$W/up/c$n.png" -i "$W/clean/c$n.png" -filter_complex \
"[0]scale=2560:1440:flags=lanczos,format=gbrp[a];[1]scale=2560:1440:flags=lanczos,format=gbrp[b];[a][b]blend=all_expr='A*0.82+B*0.18',cas=0.3,split[o1][o2];[o2]scale=1920:1080:flags=lanczos[o3]" \
-map "[o1]" -c:v libwebp -quality 92 -compression_level 6 -preset photo "$out/2560/f$n.webp" \
-map "[o3]" -c:v libwebp -quality 92 -compression_level 6 -preset photo "$out/1920/f$n.webp"
