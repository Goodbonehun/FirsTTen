from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "branding" / "Logo_Firstten_v2.png"
OUTPUTS = {
    32: "firstten-favicon-32-v6.png",
    96: "firstten-app-icon-96-v6.png",
    180: "firstten-apple-touch-icon-v6.png",
    192: "firstten-app-icon-192-v6.png",
    512: "firstten-app-icon-512-v6.png",
}

with Image.open(SOURCE) as original:
    logo = original.convert("RGB")
    for size, filename in OUTPUTS.items():
        icon = logo.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(ROOT / "public" / filename, "PNG", optimize=True)
