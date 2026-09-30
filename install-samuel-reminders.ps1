$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$reminderPath = Join-Path $projectPath 'samuel-works-reminder.ps1'
$taskName = "SAMUEL WORK'S - Rappels"
$powershell = (Get-Command powershell.exe).Source
$argument = "-NoProfile -ExecutionPolicy Bypass -File `"$reminderPath`""

$action = New-ScheduledTaskAction -Execute $powershell -Argument $argument
$triggerMorning = New-ScheduledTaskTrigger -Daily -At '08:00'
$triggerEvening = New-ScheduledTaskTrigger -Daily -At '22:00'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerMorning,$triggerEvening -Settings $settings -Principal $principal -Force | Out-Null
Write-Output "Rappels Windows installés pour 08:00 et 22:00."
Write-Output "Le rattrapage au démarrage est activé si l’ordinateur était éteint à l’heure prévue."