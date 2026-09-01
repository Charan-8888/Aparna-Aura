#!/usr/bin/env bash
# build.sh — Render build script for the Aparna Aura Django backend.
# Render calls this script during every deploy.
set -o errexit   # exit on first error

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Apply any pending database migrations
python manage.py migrate --noinput

# 3. Collect static files (WhiteNoise serves them)
python manage.py collectstatic --noinput

# 4. Seed Aura categories & products into the production database.
#    This is idempotent — it skips any records that already exist, so
#    re-deploys do NOT duplicate data or re-upload images unnecessarily.
python manage.py seed_aura_products

# 5. Apply confirmed product prices (safe no-op if already correct)
python manage.py update_aura_prices
