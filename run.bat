@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title CineMatch 2.0 Launcher

echo ========================================================
echo        Starting CineMatch 2.0 (Java + Modern Web UI)
echo ========================================================
echo.

cd /d "%~dp0"

:: Auto-detect JDK 17+
set "JAVA_CMD=java"
set "JAVAC_CMD=javac"

if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot\bin\java.exe" (
    set "JAVA_CMD=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot\bin\java.exe"
    set "JAVAC_CMD=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot\bin\javac.exe"
) else (
    for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*" "C:\Program Files\Eclipse Adoptium\jdk-2*" "C:\Program Files\Java\jdk-17*" "C:\Program Files\Java\jdk-2*") do (
        if exist "%%~D\bin\java.exe" (
            set "JAVA_CMD=%%~D\bin\java.exe"
            set "JAVAC_CMD=%%~D\bin\javac.exe"
        )
    )
)

:: 1. Compile Java 17 Core Backend
if not exist "bin" mkdir bin
echo [1/3] Compiling Java 17 backend sources using "!JAVAC_CMD!"...
"!JAVAC_CMD!" -encoding UTF-8 -d bin src\com\cinematch\config\*.java src\com\cinematch\model\*.java src\com\cinematch\service\*.java src\com\cinematch\server\*.java src\com\cinematch\Main.java
if %errorlevel% neq 0 (
    echo [ERROR] Java compilation failed.
    pause
    exit /b 1
)

:: 2. Launch Java Backend in background window
echo [2/3] Launching CineMatch Java REST API (http://localhost:8080)...
start "CineMatch Java API Server" cmd /k "title CineMatch Java 17 Server && "!JAVA_CMD!" -cp bin com.cinematch.Main"

:: 3. Launch Modern Web UI
echo [3/3] Launching Modern Web Frontend (http://localhost:3000)...
timeout /t 2 /nobreak >nul
npm run dev
