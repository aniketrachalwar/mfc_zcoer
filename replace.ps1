$files = Get-ChildItem -Path "." -Recurse -Include *.tsx, *.ts, *.html, *.json | Where-Object { $_.FullName -notmatch "node_modules|\\\.git|dist" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -cmatch 'Mozilla Firefox Club ZCOER|MFC ZCOER|MFCZCOER') {
        $newContent = $content -creplace 'Mozilla Firefox Club ZCOER', 'MFC Open Web' -creplace 'MFC ZCOER', 'MFC Open Web' -creplace 'MFCZCOER', 'MFC Open Web'
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}
