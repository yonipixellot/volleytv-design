#!/usr/bin/env bash
#
# prepare-media.sh — rebuild public/media from the master footage.
#
# The demo videos are tracked in git since 2026-09-10 (licensed client footage,
# 74 MB after encoding) so deploys match a local checkout. This script is how
# they are rebuilt from the masters if the encode settings change.
#
#   ./tools/prepare-media.sh ~/Documents/volleytv-source-footage
#
# Needs ffmpeg (brew install ffmpeg). Output layout is what media-manifest.ts
# expects: media/game/{full-match,highlights}.mp4 and media/reel/clip-N.mp4.
#
# The masters are 1080p at 10-17 Mbps — camera output, not web files. These
# settings target a laptop demo over local dev, not archival quality: 1280-wide
# for the horizontal games, 720-wide for the vertical clips, +faststart so the
# first frame paints before the file finishes arriving.
set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "usage: $0 <path to master footage folder>" >&2
  exit 2
fi

command -v ffmpeg >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)" >&2; exit 3; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/../public/media"
mkdir -p "$OUT/game" "$OUT/reel"

# ── Horizontal: the two match files the VOD player uses ────────────────────
enc_h () {
  ffmpeg -nostdin -y -i "$1" \
    -c:v libx264 -preset slow -crf 26 -maxrate 2500k -bufsize 5000k \
    -vf "scale=1280:-2" -c:a aac -b:a 96k -movflags +faststart "$2"
}
enc_h "$SRC/4min_womens.mp4"                      "$OUT/game/full-match.mp4"
enc_h "$SRC/Girls Horizontal Game Highlights.mp4" "$OUT/game/highlights.mp4"

# ── Vertical: one player's set, in the clip-N order the manifest wraps over ─
# Swap PLAYER to bring in a different athlete's reel; raise REEL_CLIP_COUNT in
# media-manifest.ts if the new folder holds more clips than the old one.
PLAYER="$SRC/Player HL - Vertical/OK KELTEKS/#15PlayerHighlights2"
i=1
while [[ -f "$PLAYER/Clip $i.mp4" ]]; do
  ffmpeg -nostdin -y -i "$PLAYER/Clip $i.mp4" \
    -c:v libx264 -preset slow -crf 28 -maxrate 1200k -bufsize 2400k \
    -vf "scale=720:-2" -c:a aac -b:a 96k -movflags +faststart \
    "$OUT/reel/clip-$i.mp4"
  i=$((i + 1))
done

echo "done — $(du -sh "$OUT" | cut -f1) in $OUT ($((i - 1)) reel clips)"
