#!/bin/bash
set -e

echo "Running npm audit..."
npm audit --audit-level=moderate

echo "Running OWASP ZAP baseline scan..."
docker run -v "$(pwd)":/zap/wrk -t owasp/zap2docker-stable \
    zap-baseline.py -t http://host.docker.internal:3001 -r zap_report.html

echo "✅ Security checks completed"
