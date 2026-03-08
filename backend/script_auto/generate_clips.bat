@echo off
setlocal EnableDelayedExpansion

set duration=5

echo Cleaning previous files...
del aadu1_clip*.mkv 2>nul
del aadu2_clip*.mkv 2>nul
del list1.txt 2>nul
del list2.txt 2>nul
del aadu1_combo.mkv 2>nul
del aadu2_combo.mkv 2>nul
del final_video.mkv 2>nul

echo.
echo ===== Processing Aadu1 =====

set input=Aadu.mkv
set timestamps=timestamps1.txt
set prefix=aadu1_clip
set list=list1.txt
set i=1

for /f %%a in (%timestamps%) do (
    set clip=!prefix!!i!.mkv
    echo Creating !clip! from %%a
    ffmpeg -y -ss %%a -t %duration% -i "%input%" -c copy "!clip!"
    echo file '!clip!' >> !list!
    set /a i+=1
)

echo Combining Aadu1 clips...
ffmpeg -y -f concat -safe 0 -i !list! -c copy aadu1_combo.mkv


echo.
echo ===== Processing Aadu2 =====

set input=Aadu2.mkv
set timestamps=timestamps2.txt
set prefix=aadu2_clip
set list=list2.txt
set i=1

for /f %%a in (%timestamps%) do (
    set clip=!prefix!!i!.mkv
    echo Creating !clip! from %%a
    ffmpeg -y -ss %%a -t %duration% -i "%input%" -c copy "!clip!"
    echo file '!clip!' >> !list!
    set /a i+=1
)

echo Combining Aadu2 clips...
ffmpeg -y -f concat -safe 0 -i !list! -c copy aadu2_combo.mkv


echo.
echo ===== Combining both movies =====

echo file 'aadu1_combo.mkv' > combine_movies.txt
echo file 'aadu2_combo.mkv' >> combine_movies.txt

ffmpeg -y -f concat -safe 0 -i combine_movies.txt -c copy final_video.mkv

echo.
echo FINAL VIDEO CREATED: final_video.mkv
pause