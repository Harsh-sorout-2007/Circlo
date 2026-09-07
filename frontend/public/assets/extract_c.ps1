Add-Type -AssemblyName System.Drawing

$src = "d:\DEV\Circlo\frontend\public\assets\circlo-logo.png"
$bmp = [System.Drawing.Bitmap]::new($src)

$w = $bmp.Width
$h = $bmp.Height

$bg = $bmp.GetPixel(0, 0)

$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
$targetR = 0; $targetG = 0; $targetB = 0; $maxDiff = 0

# Find bounds and the most prominent foreground color (ignoring the bottom-right watermark)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        # Skip the bottom-right corner where the Gemini watermark is (e.g. last 10% of image)
        if ($x -gt ($w * 0.85) -and $y -gt ($h * 0.85)) {
            continue
        }

        $p = $bmp.GetPixel($x, $y)
        $diff = [Math]::Abs($p.R - $bg.R) + [Math]::Abs($p.G - $bg.G) + [Math]::Abs($p.B - $bg.B)
        
        # Also filter out purely grayscale pixels if any exist in the bounding box phase
        $isGrayscale = [Math]::Abs($p.R - $p.G) -lt 10 -and [Math]::Abs($p.G - $p.B) -lt 10

        if ($diff -gt 25 -and -not $isGrayscale) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            
            if ($diff -gt $maxDiff) {
                $maxDiff = $diff
                $targetR = $p.R
                $targetG = $p.G
                $targetB = $p.B
            }
        }
    }
}

$boxW = $maxX - $minX + 1
$boxH = $maxY - $minY + 1
$size = [Math]::Max($boxW, $boxH)
$centerX = $minX + $boxW / 2
$centerY = $minY + $boxH / 2

$cropped = [System.Drawing.Bitmap]::new($size, $size)

for ($y = 0; $y -lt $size; $y++) {
    for ($x = 0; $x -lt $size; $x++) {
        $srcX = [int]($centerX - $size / 2) + $x
        $srcY = [int]($centerY - $size / 2) + $y
        
        # Make sure we don't accidentally copy the watermark during extraction
        if ($srcX -ge 0 -and $srcX -lt $w -and $srcY -ge 0 -and $srcY -lt $h -and -not ($srcX -gt ($w * 0.85) -and $srcY -gt ($h * 0.85))) {
            $p = $bmp.GetPixel($srcX, $srcY)
            $diff = [Math]::Abs($p.R - $bg.R) + [Math]::Abs($p.G - $bg.G) + [Math]::Abs($p.B - $bg.B)
            
            if ($diff -lt 15) {
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                $alpha = [int](($diff - 15) / ($maxDiff - 15) * 255)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                
                $fgR = [Math]::Min(255, [Math]::Max(0, [int]((($p.R - $bg.R) * 255 / ($alpha + 1)) + $bg.R)))
                $fgG = [Math]::Min(255, [Math]::Max(0, [int]((($p.G - $bg.G) * 255 / ($alpha + 1)) + $bg.G)))
                $fgB = [Math]::Min(255, [Math]::Max(0, [int]((($p.B - $bg.B) * 255 / ($alpha + 1)) + $bg.B)))
                
                $color = [System.Drawing.Color]::FromArgb($alpha, $fgR, $fgG, $fgB)
                $cropped.SetPixel($x, $y, $color)
            }
        } else {
            $cropped.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}

$dest = "d:\DEV\Circlo\frontend\public\assets\circlo-icon.png"
$cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$bmp.Dispose()

Write-Host "Extraction complete: Saved to circlo-icon.png without watermark."
