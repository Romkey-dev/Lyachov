#!/bin/bash
set -e
echo "Testing local sanity checks..."
echo "Backend requirements:"
sed -n '1,120p' backend/requirements.txt
echo "Done."
