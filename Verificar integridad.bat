@echo off
chcp 65001 >nul
title Verificacion de integridad - GUTIC
echo.
echo ================================================================
echo   GUTIC - VERIFICACION DE INTEGRIDAD DEL ARCHIVO
echo ================================================================
echo.
set "ARCHIVO=%~dp0GUTIC.html"
set "OFICIAL=852767c460892de709a74d93ea81703f532d507c43749f33806a479785a351b9"
if not exist "%ARCHIVO%" (
  echo  [ERROR] No se encuentra GUTIC.html en esta carpeta.
  echo.
  pause
  exit /b 1
)
for /f "skip=1 tokens=1" %%H in ('certutil -hashfile "%ARCHIVO%" SHA256') do (
  if not defined ACTUAL set "ACTUAL=%%H"
)
echo  Huella oficial : %OFICIAL%
echo  Huella actual  : %ACTUAL%
echo.
if /i "%ACTUAL%"=="%OFICIAL%" (
  color 2F
  echo    ARCHIVO INTEGRO. Es la version oficial, sin alteraciones.
) else (
  color 4F
  echo    ATENCION: EL ARCHIVO FUE MODIFICADO. No lo utilice.
)
echo.
pause
