@echo off
REM Add audio to MP4 files that don't have audio
REM This script uses FFmpeg to add a silent AAC audio track

setlocal enabledelayedexpansion

set VIDEO_DIR=D:\Auca\Psyqode\project\Backend\Backend\uploads\videos
set TEMP_DIR=%VIDEO_DIR%\temp

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: FFmpeg is not installed or not in PATH
    echo Please install FFmpeg: https://ffmpeg.org/download.html
    exit /b 1
)

REM Create temp directory
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo Processing video files to add audio...
echo.

REM Process each MP4 file
for %%F in (%VIDEO_DIR%\*.mp4) do (
    echo Processing: %%~nF
    
    REM Check if file already has audio
    ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "%%F" >nul 2>&1
    
    if errorlevel 1 (
        echo  - No audio detected, adding silent audio track...
        
        REM Create a temporary output file
        set OUTPUT=%TEMP_DIR%\%%~nF
        
        REM Add silent AAC audio to the video
        ffmpeg -i "%%F" -f lavfi -i anullsrc=r=44100:cl=stereo -c:v copy -c:a aac -shortest "!OUTPUT!" -y >nul 2>&1
        
        if errorlevel 1 (
            echo  - ERROR processing file
        ) else (
            echo  - Adding audio completed
            REM Replace original with new file
            move /Y "!OUTPUT!" "%%F" >nul
            echo  - File updated with audio
        )
    ) else (
        echo  - Audio already present, skipping
    )
    echo.
)

REM Clean up temp directory
if exist "%TEMP_DIR%" rmdir /S /Q "%TEMP_DIR%"

echo Done! Videos have been updated with audio tracks.
