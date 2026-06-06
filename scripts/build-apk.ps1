# Builds a debug APK locally (no signing required, installs directly on Android).
# Run from the project root: .\scripts\build-apk.ps1

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "C:\Users\Rividemeo\AppData\Roaming\nvm\v22.11.0;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:PATH"

Write-Host "==> Installing npm dependencies..."
npm install --legacy-peer-deps

Write-Host "==> Running expo prebuild (generates android/ folder)..."
npx expo prebuild --platform android --clean

Write-Host "==> Building APK..."
Set-Location android
.\gradlew.bat assembleDebug

Set-Location ..

$apk = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $size = [math]::Round((Get-Item $apk).Length / 1MB, 1)
    Write-Host ""
    Write-Host "Build successful! APK is at:" -ForegroundColor Green
    Write-Host "  $((Resolve-Path $apk).Path)" -ForegroundColor Cyan
    Write-Host "  Size: ${size} MB"
    Write-Host ""
    Write-Host "Transfer to your phone and tap to install."
    Write-Host "(Enable 'Install from unknown sources' in Android Settings > Security if prompted.)"
} else {
    Write-Host "Build failed — check the Gradle output above." -ForegroundColor Red
}
