# PowerShell script to remove console.log statements from JavaScript/TypeScript files

$files = Get-ChildItem -Path . -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.next\*" }

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace console.log, console.error, console.warn, console.info, console.debug statements
    $newContent = $content -replace '\s*console\.(log|error|warn|info|debug)\([^;]*\);?', ''
    
    # Write back if changes were made
    if ($content -ne $newContent) {
        Write-Host "Removing console statements from $($file.FullName)"
        Set-Content -Path $file.FullName -Value $newContent
    }
}

Write-Host "Completed removing console statements from all JavaScript/TypeScript files."