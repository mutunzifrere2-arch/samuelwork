$title = "SAMUEL WORK'S"
$message = "C’est le moment de compléter tes dossiers et ton application."
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
$notifyIcon.BalloonTipTitle = $title
$notifyIcon.BalloonTipText = $message
$notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notifyIcon.Visible = $true
$notifyIcon.ShowBalloonTip(10000)
Start-Sleep -Seconds 11
$notifyIcon.Dispose()