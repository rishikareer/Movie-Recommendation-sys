@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title CineMatch Java 17 Backend Server

echo ========================================================
echo     Starting CineMatch Core Java 17 API Server
echo ========================================================

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

if not exist "bin" mkdir bin

echo Compiling Java sources using "!JAVAC_CMD!"...
"!JAVAC_CMD!" -encoding UTF-8 -d bin src\com\cinematch\config\*.java src\com\cinematch\model\*.java src\com\cinematch\service\*.java src\com\cinematch\server\*.java src\com\cinematch\Main.java
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo Starting Server on http://localhost:8080 using "!JAVA_CMD!"...
"!JAVA_CMD!" -cp bin com.cinematch.Main
