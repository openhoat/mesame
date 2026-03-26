#!/usr/bin/env bash
# Generate CHANGELOG.md from git commit history
# Tags mapping: conventional commit type -> emoji + tag
set -euo pipefail

get_emoji_tag() {
  case "$1" in
    feat)     echo "✨ [FEAT]" ;;
    fix)      echo "🐛 [FIX]" ;;
    refactor) echo "♻️ [REFACTOR]" ;;
    perf)     echo "⚡ [PERF]" ;;
    docs)     echo "📝 [DOCS]" ;;
    style)    echo "🎨 [STYLE]" ;;
    test)     echo "✅ [TEST]" ;;
    chore)    echo "🔧 [CHORE]" ;;
    revert)   echo "⏪ [REVERT]" ;;
    deps)     echo "📦 [DEPS]" ;;
    ci)       echo "👷 [CI]" ;;
    *)        echo "🔧 [CHORE]" ;;
  esac
}

OUTPUT="CHANGELOG.md"

{
  echo "# Changelog"

  current_date=""
  first_date=true

  git log --format="%H %ai %s" | while IFS= read -r line; do
    date_part=$(echo "$line" | cut -d' ' -f2)
    time_part=$(echo "$line" | cut -d' ' -f3)
    subject=$(echo "$line" | cut -d' ' -f5-)

    # Format date DD/MM/YYYY
    formatted_date=$(date -d "$date_part" "+%d/%m/%Y" 2>/dev/null || echo "$date_part")
    # Format time HH:MM:SS
    formatted_time=$(echo "$time_part" | cut -d'+' -f1 | cut -d'-' -f1)

    # Extract type from conventional commit
    if [[ "$subject" =~ ^([a-z]+)(\(.+\))?:\ (.+)$ ]]; then
      type="${BASH_REMATCH[1]}"
      desc="${BASH_REMATCH[3]}"
    else
      type="chore"
      desc="$subject"
    fi

    emoji_tag=$(get_emoji_tag "$type")

    if [ "$formatted_date" != "$current_date" ]; then
      echo ""
      echo "## $formatted_date"
      echo ""
      current_date="$formatted_date"
    fi

    echo "- **[$formatted_time] $emoji_tag** $desc"
  done
} > "$OUTPUT"

echo "CHANGELOG.md generated successfully"
