$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) { $ScriptDir = Get-Location }

# Remove unwanted extra icons if present
$Unwanted = Join-Path -Path $DesktopPath -ChildPath "Finance Flow.lnk"
if (Test-Path $Unwanted) {
    Remove-Item -Path $Unwanted -Force -ErrorAction SilentlyContinue
}

# Native Desktop App Shortcut for Public Build
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "FinanceCalc Public.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$ElectronExe = Join-Path $ScriptDir "node_modules\electron\dist\electron.exe"
$IconFile = Join-Path $ScriptDir "public\logo.ico"

if (Test-Path $ElectronExe) {
    # Direct Native GUI Subsystem execution (NO CMD PROMPT, NO BROWSER, NO WEB SERVER)
    $Shortcut.TargetPath = $ElectronExe
    $Shortcut.Arguments = "`"$ScriptDir`""
} else {
    $Shortcut.TargetPath = Join-Path $ScriptDir "Launch App.vbs"
}

$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "FinanceCalc Public • Native Desktop App"
if (Test-Path $IconFile) {
    $Shortcut.IconLocation = "$IconFile,0"
}
$Shortcut.WindowStyle = 1
$Shortcut.Save()
Write-Host "Native Desktop Shortcut created: $ShortcutPath"
