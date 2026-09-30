$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "SAMUEL WORK'S.lnk"
$launcherPath = Join-Path $projectPath 'launch-samuel-works.vbs'
$iconPath = Join-Path $projectPath 'samuel-works.ico'

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcherPath
$shortcut.WorkingDirectory = $projectPath
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = "Ouvrir SAMUEL WORK'S"
$shortcut.Save()

Write-Output "Application: $projectPath\index.html"
Write-Output "Raccourci: $shortcutPath"