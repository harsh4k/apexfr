#!/bin/sh
# ingest.sh SHOT  — .work/shots/SHOT.mp4 → WebP tiers in site/frames/SHOT/<width>/
set -e
id=$1; W="X:/Projects/Websites/Webci/.work"; OUT="X:/Projects/Websites/Webci/site/frames/$id"
src="$W/shots/$id.mp4"
wd=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$src")
ht=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 "$src")
if [ "$wd" -gt "$ht" ]; then tiers="960 1920 2560"; else tiers="540 1080 1440"; fi
rm -rf "$OUT"; tmp="$W/tmp_$id"; rm -rf "$tmp"; mkdir -p "$tmp"
ffmpeg -v error -y -i "$src" -vf "hqdn3d=1.2:1.2:2:2" -start_number 1 "$tmp/f%03d.png"
for t in $tiers; do
  mkdir -p "$OUT/$t"
  q=90
  if [ "$t" = 960 ] || [ "$t" = 540 ]; then q=76; fi
  # one ffmpeg per frame, 8 in parallel; file names come from the loop, not xargs
  i=0
  for f in "$tmp"/*.png; do
    b=$(basename "$f" .png)
    ffmpeg -v error -y -i "$f" -vf "scale=$t:-2:flags=lanczos" -c:v libwebp -quality $q -compression_level 5 "$OUT/$t/$b.webp" &
    i=$((i + 1))
    if [ $((i % 8)) -eq 0 ]; then wait; fi
  done
  wait
done
n=$(ls "$tmp" | wc -l); rm -rf "$tmp"
echo "$id $n ${wd}x$ht tiers: $tiers"
