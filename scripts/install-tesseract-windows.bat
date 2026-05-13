@echo off
REM Tesseract OCR Installation Script for Windows

echo Installing Tesseract OCR for Windows...
echo.

REM Check if Tesseract is already installed
tesseract --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Tesseract is already installed!
    tesseract --version
    pause
    exit /b 0
)

REM Try installing via Chocolatey
choco --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Installing Tesseract via Chocolatey...
    choco install tesseract -y
    echo Installation complete! Please restart your command prompt.
    pause
    exit /b 0
)

echo.
echo Tesseract not found and Chocolatey not available.
echo Please download and install from: https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo After installation, update app.ocr.tessdata-path in application.yml
echo with your Tesseract installation path (typically C:\Program Files\Tesseract-OCR\tessdata)
pause
