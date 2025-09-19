#!/bin/bash

echo "Fixing all console statement object literals..."

# Find all files with the problematic pattern and fix them
find src scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
  # Check if file has the problematic pattern
  if grep -q "removed: console\." "$file"; then
    # Create temp file
    temp_file="${file}.tmp"
    
    # Process the file line by line
    awk '
      /removed: console\./ {
        # Found a console line, check if next lines are object literal
        print
        in_object = 1
        brace_count = 0
        next
      }
      in_object {
        # Count braces to find the end of the object
        gsub(/[^{}]/, "", $0)
        for (i=1; i<=length($0); i++) {
          c = substr($0, i, 1)
          if (c == "{") brace_count++
          else if (c == "}") brace_count--
        }
        
        # Skip the object literal lines
        if (brace_count == 0 && /\}\)/) {
          in_object = 0
        }
        next
      }
      {print}
    ' "$file" > "$temp_file"
    
    # Only replace if the temp file is different
    if ! cmp -s "$file" "$temp_file"; then
      mv "$temp_file" "$file"
      echo "Fixed: $file"
    else
      rm "$temp_file"
    fi
  fi
done

echo "Console object literals fixed!"