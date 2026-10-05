Add-Type -AssemblyName System.Drawing

$pngPath = "c:\Users\asus\Downloads\personal-finance\logo.png"
$icoPath = "c:\Users\asus\Downloads\personal-finance\public\logo.ico"

if (Test-Path $pngPath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
    $resized = New-Object System.Drawing.Bitmap(256, 256)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($bmp, 0, 0, 256, 256)
    $g.Dispose()

    $hIcon = $resized.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()
    $resized.Dispose()
    $bmp.Dispose()

    Write-Host "Created high-quality Windows ICO icon at: $icoPath"
}
