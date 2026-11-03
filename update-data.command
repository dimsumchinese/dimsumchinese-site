#!/bin/bash
# 雙擊此檔：更新網站資料，然後打開網站。
# 1. 如果在「下載」或本資料夾找到比 resources.csv 新的 Notion 匯出 CSV（檔名以 DimSumChinese 開頭），
#    會先備份舊檔，再用它取代 resources.csv。
# 2. 把 resources.csv 複製成 data.js（本機打開網站時用）。
cd "$(dirname "$0")" || exit 1

latest=$(find . "$HOME/Downloads" -maxdepth 3 -type f -name 'DimSumChinese*.csv' -newer resources.csv 2>/dev/null \
  | while read -r f; do echo "$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f") $f"; done \
  | sort -rn | head -1 | cut -d' ' -f2-)
# 如有 _all.csv（包含全部資料列）就優先用它
case "$latest" in *_all.csv) ;; ?*) [ -f "${latest%.csv}_all.csv" ] && latest="${latest%.csv}_all.csv" ;; esac

if [ -n "$latest" ]; then
  cp resources.csv "resources-backup-$(date +%Y%m%d-%H%M%S).csv"
  cp "$latest" resources.csv
  echo "✅ 已用 Notion 匯出檔更新 resources.csv：$latest"
else
  echo "ℹ️ 沒有找到新的 Notion 匯出檔，沿用現有 resources.csv"
fi

{
  echo '// 由 update-data.command 從 resources.csv 自動產生，請勿直接修改。'
  printf 'window.RESOURCES_CSV = `'
  sed -e 's/\\/\\\\/g' -e 's/`/\\`/g' -e 's/\${/\\${/g' resources.csv
  echo '`;'
} > data.js && echo "✅ data.js 已更新 / updated" && open index.html
