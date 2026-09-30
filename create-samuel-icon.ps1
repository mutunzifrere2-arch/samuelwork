$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outputPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'samuel-works.ico'
$sizes = @(16, 24, 32, 48, 64, 128, 256)
$streams = New-Object System.Collections.Generic.List[System.IO.MemoryStream]

try {
    foreach ($size in $sizes) {
        $bitmap = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $graphics.Clear([System.Drawing.Color]::FromArgb(22, 77, 66))
        $fontSize = [single]($size * 0.62)
        $font = New-Object System.Drawing.Font 'Segoe UI', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $graphics.DrawString('S', $font, $brush, (New-Object System.Drawing.RectangleF 0, 0, $size, $size), $format)
        $stream = New-Object System.IO.MemoryStream
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        $stream.Position = 0
        $streams.Add($stream)
        $graphics.Dispose()
        $font.Dispose()
        $brush.Dispose()
        $format.Dispose()
        $bitmap.Dispose()
    }

    $file = New-Object System.IO.FileStream $outputPath, ([System.IO.FileMode]::Create)
    $writer = New-Object System.IO.BinaryWriter $file
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$sizes.Count)
    $offset = 6 + (16 * $sizes.Count)
    for ($index = 0; $index -lt $sizes.Count; $index++) {
        $size = $sizes[$index]
        $bytes = $streams[$index].ToArray()
        $writer.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
        $writer.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$bytes.Length)
        $writer.Write([uint32]$offset)
        $offset += $bytes.Length
    }
    foreach ($stream in $streams) { $writer.Write($stream.ToArray()) }
    $writer.Dispose()
    $file.Dispose()
}
finally {
    foreach ($stream in $streams) { $stream.Dispose() }
}