import zlib
import struct
from pathlib import Path

def create_png(width, height, color):
    # Color: RGBA tuple (0-255)
    r, g, b, a = color
    raw_data = bytearray()
    for _ in range(height):
        raw_data.append(0)  # filter type none
        for _ in range(width):
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(raw_data)
    
    def chunk(tag, data):
        length = len(data)
        crc = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', length) + tag + data + struct.pack('>I', crc)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    
    return header + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

def main():
    icons_dir = Path(__file__).resolve().parent.parent / "platform/plugin/icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    # Blue color: #1877F2 (24, 119, 242, 255)
    blue = (24, 119, 242, 255)

    for size in [16, 48, 128]:
        png_data = create_png(size, size, blue)
        with open(icons_dir / f"icon{size}.png", "wb") as f:
            f.write(png_data)
        print(f"Generated icon{size}.png")

if __name__ == "__main__":
    main()
