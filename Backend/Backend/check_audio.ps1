# Check if video files have audio tracks
$videoDir = "D:\Auca\Psyqode\project\Backend\Backend\uploads\videos"
$videoFile = Get-ChildItem $videoDir | Where-Object { $_.Name -like "*MSD_Animal_Health*" } | Select-Object -First 1

if ($videoFile) {
    Write-Host "Checking video file: $($videoFile.Name)"
    Write-Host "File size: $($videoFile.Length) bytes"
    
    # Try FFprobe if available
    $ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
    if ($ffprobe) {
        Write-Host "`nRunning FFprobe analysis..."
        Write-Host "======================================"
        & ffprobe -hide_banner -loglevel info -show_streams "$($videoFile.FullName)" 2>&1 | Select-String "codec_type|sample_rate|channels" -Context 2
    } else {
        Write-Host "FFprobe not found. Installing might help: choco install ffmpeg"
    }
    
    # Try MediaInfo if available
    $mediainfo = Get-Command mediainfo -ErrorAction SilentlyContinue
    if ($mediainfo) {
        Write-Host "`nRunning MediaInfo analysis..."
        Write-Host "======================================"
        & mediainfo "$($videoFile.FullName)" | Select-String "Audio|Format|Channels|Sample" -Context 1
    }
} else {
    Write-Host "No video file found matching pattern"
}
