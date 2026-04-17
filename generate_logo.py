import os
from PIL import Image, ImageDraw, ImageFont

def create_logo(size, text, filename):
    # Create image with solid background
    img = Image.new('RGB', (size, size), color='#1a73e8')
    d = ImageDraw.Draw(img)
    
    # Try to load a good font, fallback to default
    try:
        # Windows standard font, clear sans-serif
        font_size = int(size * 0.55)
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except IOError:
        try:
            font = ImageFont.truetype("segoeuib.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

    # Get text size
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Needs a small adjustment for visual centering sometimes, but exact math first
    x = (size - text_width) / 2
    # The bounding box might have offset
    y = (size - text_height) / 2 - bbox[1]

    d.text((x, y), text, font=font, fill='white')
    img.save(filename)

# Generate different sizes
public_dir = r"c:\Projects\DS UTH ΤΡΑΠΕΖΑ ΘΕΜΑΤΩΝ\dsuth-exam-bank\public"
create_logo(512, "DS", os.path.join(public_dir, "favicon.png"))
create_logo(192, "DS", os.path.join(public_dir, "pwa-192x192.png"))
create_logo(512, "DS", os.path.join(public_dir, "pwa-512x512.png"))
create_logo(180, "DS", os.path.join(public_dir, "apple-touch-icon-180x180.png"))
create_logo(512, "DS", os.path.join(public_dir, "dsuth-favicon.png"))
create_logo(512, "DS", os.path.join(public_dir, "logo.png"))
create_logo(512, "DS", os.path.join(public_dir, "dsuth-navbar-icon.png"))

print("Logos generated successfully!")
