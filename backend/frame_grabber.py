import cv2
import os
from moviepy import VideoFileClip

# ========= SETTINGS =========

VIDEO_1 = r"D:\Mov\Aadu 2015.mkv"
TXT_1 = "script_auto/timestamps1.txt"

VIDEO_2 = r"D:\Mov\Aadu 2 2017.mkv"
TXT_2 = "script_auto/timestamps2.txt"

OUTPUT_DIR = "screenshots"

# ============================

os.makedirs(OUTPUT_DIR, exist_ok=True)


import re

def time_to_seconds(t):

    # extract only numbers
    parts = re.findall(r'\d+', t)

    if len(parts) >= 3:
        return int(parts[0])*3600 + int(parts[1])*60 + int(parts[2])
    elif len(parts) == 2:
        return int(parts[0])*60 + int(parts[1])
    elif len(parts) == 1:
        return int(parts[0])
    else:
        return 0


def read_timestamps(file, limit):

    data = []

    with open(file, "r", encoding="utf-8") as f:
        for line in f:

            line = line.strip()
            if not line:
                continue

            # ✅ extract timestamp safely
            match = re.search(r'\d{2}:\d{2}:\d{2}', line)

            if not match:
                continue

            ts = match.group()
            sec = time_to_seconds(ts)

            data.append(sec)

            if len(data) == limit:
                break

    return data


# ---------- CAPTURE ----------
def capture(video, sec, index):

    try:
        clip = VideoFileClip(video)
        frame = clip.get_frame(sec)
        clip.close()

        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        out = f"{OUTPUT_DIR}/frame_{index}.png"
        cv2.imwrite(out, frame)

        print("Saved:", out)

    except Exception as e:
        print("ERROR:", e)


# ---------- MAIN ----------
def process():

    # first video → 6
    t1 = read_timestamps(TXT_1, 6)

    # second video → 6
    t2 = read_timestamps(TXT_2, 6)

    print("Video1:", len(t1))
    print("Video2:", len(t2))

    i = 0

    for sec in t1:
        capture(VIDEO_1, sec, i)
        i += 1

    for sec in t2:
        capture(VIDEO_2, sec, i)
        i += 1


if __name__ == "__main__":
    process()