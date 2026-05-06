$config = "src\config\apiConfig.js"
$prod   = "https://myesselapi.esselprojects.com/api"
$local  = "http://localhost:57771/api"

Write-Host "Switching to production API URL..." -ForegroundColor Cyan
(Get-Content $config) `
    -replace [regex]::Escape("const API_BASE_URL = '$local';"),  "const API_BASE_URL = '$prod';" `
    -replace [regex]::Escape("// const API_BASE_URL = '$prod';"), "// const API_BASE_URL = '$local';" |
    Set-Content $config

git add $config
git commit -m "switch to production API URL for deployment"
git push origin master

Write-Host "Restoring localhost API URL..." -ForegroundColor Cyan
(Get-Content $config) `
    -replace [regex]::Escape("const API_BASE_URL = '$prod';"),   "const API_BASE_URL = '$local';" `
    -replace [regex]::Escape("// const API_BASE_URL = '$local';"), "// const API_BASE_URL = '$prod';" |
    Set-Content $config

git add $config
git commit -m "restore localhost API URL after push"

Write-Host "Done! Pushed to GitHub and restored to localhost." -ForegroundColor Green
