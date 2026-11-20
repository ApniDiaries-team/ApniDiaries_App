Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot '..\assets\AD.png'
$targetPath = Join-Path $PSScriptRoot '..\assets\notification-icon.png'
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)

try {
  $minX = $source.Width
  $minY = $source.Height
  $maxX = 0
  $maxY = 0
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $maximum = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
      $minimum = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
      $saturation = if ($maximum -eq 0) { 0 } else { ($maximum - $minimum) / $maximum }
      if ($saturation -gt 0.18 -and $maximum -lt 253) {
        $minX = [Math]::Min($minX, $x)
        $minY = [Math]::Min($minY, $y)
        $maxX = [Math]::Max($maxX, $x)
        $maxY = [Math]::Max($maxY, $y)
      }
    }
  }

  $width = $maxX - $minX + 1
  $height = $maxY - $minY + 1
  $scale = [Math]::Min(84 / $width, 84 / $height)
  $drawWidth = [int][Math]::Round($width * $scale)
  $drawHeight = [int][Math]::Round($height * $scale)
  $offsetX = [int][Math]::Floor((96 - $drawWidth) / 2)
  $offsetY = [int][Math]::Floor((96 - $drawHeight) / 2)
  $output = [System.Drawing.Bitmap]::new(96, 96, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    for ($y = 0; $y -lt $drawHeight; $y++) {
      for ($x = 0; $x -lt $drawWidth; $x++) {
        $sourceX = $minX + [int][Math]::Floor($x / $scale)
        $sourceY = $minY + [int][Math]::Floor($y / $scale)
        $pixel = $source.GetPixel($sourceX, $sourceY)
        $alpha = 255 - [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
        if ($alpha -gt 8) {
          $output.SetPixel($offsetX + $x, $offsetY + $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
        }
      }
    }
    $output.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $output.Dispose()
  }
} finally {
  $source.Dispose()
}

Write-Output "Created $targetPath"
