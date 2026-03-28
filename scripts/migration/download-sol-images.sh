#!/bin/bash

# Sol de Invierno - Image Download Script
# Downloads all images from the old website for migration

set -e

BASE_URL="https://www.inviernotangomarathon.com"
OUTPUT_DIR="./sol-de-invierno-assets"

mkdir -p "$OUTPUT_DIR/logo"
mkdir -p "$OUTPUT_DIR/hotel"
mkdir -p "$OUTPUT_DIR/djs"
mkdir -p "$OUTPUT_DIR/photographers"

echo "Downloading Sol de Invierno assets..."

# Logo
echo "Downloading logos..."
curl -s -o "$OUTPUT_DIR/logo/logo.png" "$BASE_URL/assets/images/logo.png"
curl -s -o "$OUTPUT_DIR/logo/logo-sol.png" "$BASE_URL/assets/images/logo-sol.png" 2>/dev/null || true

# Hotel gallery
echo "Downloading hotel images..."
for i in {1..8}; do
  curl -s -o "$OUTPUT_DIR/hotel/$i.jpg" "$BASE_URL/assets/hotel/$i.jpg"
done

# DJ photos
echo "Downloading DJ photos..."
curl -s -o "$OUTPUT_DIR/djs/irene-mahno.png" "$BASE_URL/image/alan/_67e3e0a192f86.png"
curl -s -o "$OUTPUT_DIR/djs/david-mancini.png" "$BASE_URL/image/alan/_67e3e39d02966.png"
curl -s -o "$OUTPUT_DIR/djs/ugur-akar.png" "$BASE_URL/image/alan/_67e3e1a80b7ba.png"
curl -s -o "$OUTPUT_DIR/djs/ricardo-ferreira.png" "$BASE_URL/image/alan/_67e3e24a45d53.png"
curl -s -o "$OUTPUT_DIR/djs/agi-porvai.png" "$BASE_URL/image/alan/_67e3e32024682.png"
curl -s -o "$OUTPUT_DIR/djs/orkun-boragan.png" "$BASE_URL/image/alan/_67e3e22b28c91.png"
curl -s -o "$OUTPUT_DIR/djs/dj-efe.png" "$BASE_URL/image/alan/_67e54162b7378.png"

# Photographer photos
echo "Downloading photographer photos..."
curl -s -o "$OUTPUT_DIR/photographers/oykum-cayir.png" "$BASE_URL/image/alan/_67e3e513db8b1.png"
curl -s -o "$OUTPUT_DIR/photographers/ozcan-ozkan.png" "$BASE_URL/image/alan/_67e3e5409f94e.png"
curl -s -o "$OUTPUT_DIR/photographers/maria-traskovskaya.png" "$BASE_URL/image/alan/_67e3f461047df.png"
curl -s -o "$OUTPUT_DIR/photographers/veronika-korchak.jpeg" "$BASE_URL/image/alan/_688a25f09fd45.jpeg"

echo ""
echo "✅ Download complete!"
echo ""
echo "Files saved to: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*
