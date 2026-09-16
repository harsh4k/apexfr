#!/bin/sh
# ingest2.sh SHOT — 2x motion-interpolated WebP tiers into .work/frames_new/SHOT/<width>/
# Source: .work/shots/SHOT.mp4, or for "loop" the upscaled stills in .work/loopsrc/
set -e
id=$1; W="X:/Projects/Websites/Webci/.work"; OUT="$W/frames_new/$id"
tmp="$W/tmp2_$id"; rm -rf "$tmp" "$OUT"; mkdir -p "$tmp"
MI="minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
if [ "$id" = loop ]; then
  ffmpeg -v error -y -framerate 24 -i "$W/loopsrc/f%03d.webp" -vf "$MI" -start_number 1 "$tmp/f%03d.png"
  wd=2560; ht=1440
else
  src="$W/shots/$id.mp4"
  wd=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$src")
  ht=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 "$src")
  # minterpolate crashes on portrait frames: rotate to landscape and back
  if [ "$ht" -gt "$wd" ]; then VF="transpose=1,hqdn3d=1.2:1.2:2:2,$MI,transpose=2"; else VF="hqdn3d=1.2:1.2:2:2,$MI"; fi
  ffmpeg -v error -y -i "$src" -vf "$VF" -start_number 1 "$tmp/f%03d.png"
fi
if [ "$wd" -gt "$ht" ]; then tiers="960 1920 2560"; else tiers="540 1080 1440"; fi
for t in $tiers; do
  mkdir -p "$OUT/$t"
  case $t in 960|540) q=70 ;; 1920|1080) q=80 ;; *) q=82 ;; esac
  i=0
  for f in "$tmp"/*.png; do
    b=$(basename "$f" .png)
    ffmpeg -v error -y -i "$f" -vf "scale=$t:-2:flags=lanczos" -c:v libwebp -quality $q -compression_level 4 "$OUT/$t/$b.webp" &
    i=$((i + 1)); if [ $((i % 6)) -eq 0 ]; then wait; fi
  done
  wait
done
n=$(ls "$tmp" | wc -l); rm -rf "$tmp"
echo "$id $n ${wd}x$ht"
