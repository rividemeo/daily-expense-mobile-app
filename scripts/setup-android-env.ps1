# Run this ONCE after installing Android Studio to set up environment variables.
# Open PowerShell as Administrator and run: .\scripts\setup-android-env.ps1

$javaHome = "C:\Program Files\Java\jdk-21"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"

[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")

$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$newPaths = @(
    "$androidHome\platform-tools",
    "$androidHome\emulator",
    "$androidHome\tools",
    "$androidHome\tools\bin"
)
foreach ($p in $newPaths) {
    if ($currentPath -notlike "*$p*") {
        $currentPath = "$currentPath;$p"
    }
}
[System.Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")

Write-Host "Done! Restart your terminal, then run: .\scripts\build-apk.ps1"
Write-Host "JAVA_HOME  = $javaHome"
Write-Host "ANDROID_HOME = $androidHome"
