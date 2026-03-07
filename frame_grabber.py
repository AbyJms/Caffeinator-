import cv2
from PIL import Image, ImageDraw, ImageFont
import os

# ========= SETTINGS =========

VIDEO_PATH = r"D:\Mov\Aadu 2 (2017) Malayalam DVDRip x264 400MB ESub.mkv"
OUTPUT_DIR = "screenshots"

print("Using video:", VIDEO_PATH)
print("Exists:", os.path.exists(VIDEO_PATH))

timestamps = [
    (30, "Shaji Pappan enters the scene"),
    (120, "The tug-of-war chaos begins"),
    (240, "The gang faces danger"),
]

# ============================

os.makedirs(OUTPUT_DIR, exist_ok=True)


from moviepy import VideoFileClip

def capture_frame(video_path, second):

    try:
        clip = VideoFileClip(video_path)
        frame = clip.get_frame(second)
        clip.close()

        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        return frame

    except Exception as e:
        print("ERROR:", e)
        return None


def add_caption(image_path, caption):

    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    width, height = img.size

    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except:
        font = ImageFont.load_default()

    # NEW SAFE WAY
    bbox = draw.textbbox((0, 0), caption, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    new_img = Image.new("RGB", (width, height + text_height + 20), (0, 0, 0))
    new_img.paste(img, (0, 0))

    draw = ImageDraw.Draw(new_img)

    draw.text(
        ((width - text_width) // 2, height + 10),
        caption,
        font=font,
        fill=(255, 255, 255),
    )

    return new_img


def process_video():

    for i, (sec, caption) in enumerate(timestamps):

        frame = capture_frame(VIDEO_PATH, sec)

        if frame is None:
            print(f"❌ Failed at {sec}s")
            continue

        temp_path = f"{OUTPUT_DIR}/frame_{i}.png"
        cv2.imwrite(temp_path, frame)

        final_img = add_caption(temp_path, caption)
        final_img.save(f"{OUTPUT_DIR}/final_{i}.png")

        print(f"✅ Saved {sec}s")


if __name__ == "__main__":
    process_video()