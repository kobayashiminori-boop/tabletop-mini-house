"""Generate an original asymmetric marker and ARToolKit pattern (4 rotations, BGR)."""
from pathlib import Path
from PIL import Image, ImageDraw

assets = Path(__file__).resolve().parents[1] / 'assets'
assets.mkdir(exist_ok=True)
inner = Image.new('RGB', (400, 400), 'white')
d = ImageDraw.Draw(inner)
d.polygon([(40, 190), (180, 45), (320, 190)], fill='black')
d.rectangle((80, 180, 280, 350), fill='black')
d.rectangle((150, 250, 210, 350), fill='white')
d.rectangle((105, 210, 140, 245), fill='white')
d.rectangle((315, 35, 375, 95), fill='black')
inner.save(assets / 'mini-house-symbol.png')
marker = Image.new('RGB', (1000, 1000), 'white')
ImageDraw.Draw(marker).rectangle((100, 100, 899, 899), fill='black')
marker.paste(inner, (300, 300))  # patternRatio = 400 / 800 = 0.5
marker.save(assets / 'mini-house-marker.png')
blocks = []
for angle in (0, 90, 180, 270):  # Canvas negative angle = PIL counterclockwise
    sample = inner.rotate(angle).resize((16, 16), Image.Resampling.BILINEAR)
    rows = []
    for channel in (2, 1, 0):
        for y in range(16):
            rows.append(' '.join(f'{sample.getpixel((x, y))[channel]:3d}' for x in range(16)))
    blocks.append('\n'.join(rows))
(assets / 'mini-house.patt').write_text('\n\n'.join(blocks) + '\n', encoding='ascii')
print('Created original marker PNG, source symbol and .patt')
