"""
Extract blue-bordered boxes from Arc_RNAlife.pdf and save as images.
"""
import fitz  # PyMuPDF
import os
from PIL import Image
import io

PDF_PATH = r"D:\workspace\lingang_evaweb\RNAVerse_Web\Arc_RNAlife.pdf"
OUTPUT_DIR = r"D:\workspace\lingang_evaweb\RNAVerse_Web\RNA-Verse\public\eva2"
SCALE = 3.0  # render at 3x for high resolution

os.makedirs(OUTPUT_DIR, exist_ok=True)

def is_blue(color_tuple):
    """Check if a color (r,g,b) in 0-1 range is 'blue'."""
    if color_tuple is None:
        return False
    r, g, b = color_tuple
    # Blue: b is dominant, r and g are lower
    return b > 0.4 and b > r * 1.3 and b > g * 1.1

def rect_area(rect):
    return (rect.x1 - rect.x0) * (rect.y1 - rect.y0)

doc = fitz.open(PDF_PATH)
print(f"PDF has {len(doc)} pages")

saved_count = 0

for page_num in range(len(doc)):
    page = doc[page_num]
    page_rect = page.rect
    print(f"\n--- Page {page_num + 1} ---")

    # Collect candidate blue rectangles from drawings
    blue_rects = []

    drawings = page.get_drawings()
    for drawing in drawings:
        stroke_color = drawing.get("color")
        fill_color = drawing.get("fill")
        rect = drawing.get("rect")
        if rect is None:
            continue
        area = rect_area(rect)
        # Skip tiny or full-page rects
        if area < 5000 or area > rect_area(page_rect) * 0.9:
            continue

        if is_blue(stroke_color) or is_blue(fill_color):
            blue_rects.append(fitz.Rect(rect))
            print(f"  Found blue rect: {rect}, stroke={stroke_color}, fill={fill_color}, area={area:.0f}")

    if not blue_rects:
        print("  No blue rects found on this page.")
        continue

    # Render page at high resolution
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    pw, ph = page_rect.width, page_rect.height

    for i, rect in enumerate(blue_rects):
        # Add padding
        pad = 8
        x0 = max(0, rect.x0 - pad)
        y0 = max(0, rect.y0 - pad)
        x1 = min(pw, rect.x1 + pad)
        y1 = min(ph, rect.y1 + pad)

        # Scale to pixel coords
        px0 = int(x0 * SCALE)
        py0 = int(y0 * SCALE)
        px1 = int(x1 * SCALE)
        py1 = int(y1 * SCALE)

        cropped = img.crop((px0, py0, px1, py1))
        fname = f"module_p{page_num+1}_{i+1}.png"
        fpath = os.path.join(OUTPUT_DIR, fname)
        cropped.save(fpath)
        print(f"  Saved: {fname} ({cropped.width}x{cropped.height})")
        saved_count += 1

doc.close()
print(f"\nDone. Total saved: {saved_count} images -> {OUTPUT_DIR}")
