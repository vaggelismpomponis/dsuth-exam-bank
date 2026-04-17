import os
from PIL import Image, ImageDraw, ImageFont

res_dir = r"c:\Projects\DS UTH ΤΡΑΠΕΖΑ ΘΕΜΑΤΩΝ\dsuth-exam-bank\android\app\src\main\res"

print("Starting to replace android assets...")
for root, dirs, files in os.walk(res_dir):
    for file in files:
        if file in ['splash.png', 'ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']:
            path = os.path.join(root, file)
            try:
                # Read size to preserve exact dimensions
                with Image.open(path) as img:
                    w, h = img.size
                
                # Make a solid blue background
                new_img = Image.new('RGBA', (w, h), color='#1a73e8')
                d = ImageDraw.Draw(new_img)
                
                if file == 'splash.png':
                    logo_size = int(min(w, h) * 0.3)
                else:
                    logo_size = int(min(w, h) * 0.8)
                
                try:
                    font_size = int(logo_size * 0.55)
                    font = ImageFont.truetype('arialbd.ttf', font_size)
                except IOError:
                    try:
                        font = ImageFont.truetype('segoeuib.ttf', font_size)
                    except IOError:
                        font = ImageFont.load_default()
                    
                text = "DS"
                bbox = d.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (w - text_width) / 2
                y = (h - text_height) / 2 - bbox[1]
                
                d.text((x, y), text, font=font, fill='white')
                
                new_img.save(path)
                print(f"Updated {file} at {w}x{h} in {os.path.basename(root)}")
            except Exception as e:
                print(f"Failed to update {path}: {e}")

print("Done updating Android assets!")
