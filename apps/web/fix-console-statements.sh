#!/bin/bash

# Fix all malformed console statements in the codebase
# These were incorrectly changed from console.log to "removedlog"

echo "Fixing malformed console statements..."

# Find and replace all instances of "removedlog(" with proper comments
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' 's/removedlog(/removed: console.log(/g' {} +

# Also fix any "removederror(" statements
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' 's/removederror(/removed: console.error(/g' {} +

# Fix any "removedwarn(" statements
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' 's/removedwarn(/removed: console.warn(/g' {} +

# Also fix scripts directory
find scripts -type f \( -name "*.js" \) -exec sed -i '' 's/removedlog(/removed: console.log(/g' {} +

echo "Console statements fixed!"