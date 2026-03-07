@echo off
setlocal EnableDelayedExpansion

set input=Aadu2.mkv
set duration=5
set i=1

del clip*.mkv 2>nul
del list.txt 2>nul
del final_video.mkv 2>nul

for /f %%a in (timestamps.txt) do (
    set clip=clip!i!.mkv
    echo Creating !clip!
    ffmpeg -y -ss %%a -t %duration% -i "%input%" -c copy "!clip!"
    echo file '!clip!' >> list.txt
    set /a i+=1
)

echo Combining clips...
ffmpeg -y -f concat -safe 0 -i list.txt -c copy final_video.mkv

echo Done!
pause