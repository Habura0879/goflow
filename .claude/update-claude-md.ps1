# Auto-updates CLAUDE.md when structural changes are detected
# Called by the Stop hook after each Claude session

$root = "C:\goflow.co.il\goflow.co.il\public_html"
$claudeMd = "$root\CLAUDE.md"

# Check if anything structural changed in this session
$changed = git -C $root diff HEAD~1 --name-only 2>$null
if (-not $changed) { exit 0 }

$structural = $changed | Where-Object {
  $_ -match "^blog/|^assets/|^index\.html|^sitemap\.xml|GoFlow.*\.png"
}
if (-not $structural) { exit 0 }

# Build current blog post list
$posts = Get-ChildItem "$root\blog" -Directory | ForEach-Object {
  "│   ├── $($_.Name)/index.html"
}
$postList = $posts -join "`n"

# Build current assets list
$assets = Get-ChildItem "$root\assets" -File | ForEach-Object {
  "│   ├── $($_.Name)"
}
$assetList = $assets -join "`n"

# Read current CLAUDE.md
$content = Get-Content $claudeMd -Raw

# Replace the file tree block
$newTree = @"
\`\`\`
public_html/
├── index.html                  ← דף הבית (כל CSS+JS inline)
├── assets/
$assetList
├── blog/
│   ├── index.html              ← אינדקס הבלוג
$postList
├── GoFlow_full_logo_black_transparent_1200px.png
├── GoFlow_full_logo_white_transparent_1200px.png
├── GoFlow_icon_transparent_256x256.png
├── sitemap.xml
└── robots.txt
\`\`\`
"@

$content = $content -replace "(?s)```\npublic_html/.*?```", $newTree.Trim()
Set-Content $claudeMd $content -Encoding UTF8

# Auto-commit the update
git -C $root add CLAUDE.md
git -C $root commit -m "Auto-update CLAUDE.md — structural changes detected" 2>$null

Write-Output '{"systemMessage": "✓ CLAUDE.md עודכן אוטומטית"}'
