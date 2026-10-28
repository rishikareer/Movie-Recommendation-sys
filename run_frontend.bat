@echo off
chcp 65001 >nul
title CineMatch Modern Web Frontend

echo ========================================================
echo     Starting CineMatch Modern Web UI (Vite + React)
echo ========================================================

cd /d "%~dp0"
npm run dev

