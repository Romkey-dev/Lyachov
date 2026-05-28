#!/bin/bash
set -e
echo "Manual deploy placeholder"
echo "Build backend image"
cd backend
docker build -t book-api:latest .
echo "Done."
