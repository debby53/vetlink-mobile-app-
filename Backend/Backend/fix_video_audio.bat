@echo off
REM Add silent audio track to MP4 files using FFmpeg
REM This fixes videos that play but have no audio

setlocal enabledelayedexpansion

set VIDEO_DIR=D:\Auca\Psyqode\project\Backend\Backend\uploads\videos
set LOG_FILE=%VIDEO_DIR%\audio_fix.log

echo Processing video files at: %VIDEO_DIR%
echo. > "%LOG_FILE%"
echo Audio Addition Process Started: %date% %time% >> "%LOG_FILE%"

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: FFmpeg is not installed!
    echo Please install FFmpeg from: https://ffmpeg.org/download.html
    echo Or use chocolatey: choco install ffmpeg
    exit /b 1
)

set COUNT=0
set PROCESSED=0

REM Process each MP4 file
for /f "delims=" %%F in ('dir /b "%VIDEO_DIR%\*.mp4" 2^>nul') do (
    set /a COUNT+=1
    set FILEPATH=%VIDEO_DIR%\%%F
    
    echo.
    echo [!COUNT!] Processing: %%F
    echo [!COUNT!] Processing: %%F >> "%LOG_FILE%"
    
    REM Check if file has audio using ffprobe
    ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "!FILEPATH!" >nul 2>&1
    
    if errorlevel 1 (
        echo      - No audio detected, adding silent audio track...
        echo      - No audio detected, adding silent audio track... >> "%LOG_FILE%"
        
        set TEMP_FILE=!FILEPATH!.tmp
        
        REM Use FFmpeg to add silent AAC audio 
        ffmpeg -i "!FILEPATH!" -f lavfi -i anullsrc=r=44100:cl=stereo -c:v copy -c:a aac -shortest "!TEMP_FILE!" -y >nul 2>&1
        
        if errorlevel 1 (
            echo      - ERROR: Failed to process file
            echo      - ERROR: Failed to process file >> "%LOG_FILE%"
        ) else (
            echo      - Replacing original file...
            del "!FILEPATH!"
            ren "!TEMP_FILE!" "%%F"
            echo      - DONE: Added audio track
            echo      - DONE: Added audio track >> "%LOG_FILE%"
            set /a PROCESSED+=1
        )
    ) else (
        echo      - Audio already present, skipping
        echo      - Audio already present, skipping >> "%LOG_FILE%"
    )
)

echo.
echo ==========================================
echo Processed %COUNT% files, %PROCESSED% updated
echo ==========================================
echo Processed %COUNT% files, %PROCESSED% updated >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"
echo Process completed: %date% %time% >> "%LOG_FILE%"

echo.
echo Log file: %LOG_FILE%
pause
