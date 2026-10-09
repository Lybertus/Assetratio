import math
import struct
import zlib

def make_png(width, height, get_pixel_rgba):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_rgba(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    return bytes(png)

def render_icon(size):
    cx = size / 2.0
    cy = size / 2.0
    outer_r = size * 0.42
    inner_r = size * 0.31
    corner_r = size * 0.22

    def sample(x, y, w, h):
        # Round corner box check (squircle)
        dx = max(abs(x - cx) - (cx - corner_r), 0)
        dy = max(abs(y - cy) - (cy - corner_r), 0)
        dist_corner = math.sqrt(dx*dx + dy*dy)
        if dist_corner > corner_r:
            return (0, 0, 0, 0)

        # Distance from center
        dist = math.hypot(x - cx, y - cy)

        # Background base: OLED dark gradient
        base_v = int(14 + (1.0 - (dist / (size * 0.7))) * 12)
        base_v = max(8, min(26, base_v))
        r, g, b = base_v, base_v, int(base_v * 1.1)

        # Ring arc geometry
        if inner_r <= dist <= outer_r:
            angle = (math.atan2(y - cy, x - cx) * 180 / math.pi + 90) % 360
            # 0° to 270° = Invest (75%, green gradient)
            # 270° to 360° = Cash (25%, cyan gradient)
            if 0 <= angle < 265:
                # Green arc
                factor = angle / 265.0
                r = int(16 + factor * 20)
                g = int(185 + factor * 40)
                b = int(120 - factor * 40)
            elif 270 <= angle <= 360:
                # Cyan arc
                factor = (angle - 270) / 90.0
                r = int(14 + factor * 20)
                g = int(180 + factor * 20)
                b = int(240 - factor * 20)
            else:
                # small gap
                r, g, b = 25, 25, 28
        elif dist < inner_r:
            # Subtle center glow
            center_glow = max(0.0, 1.0 - (dist / inner_r))
            v = int(12 + center_glow * 10)
            r, g, b = v, v, int(v * 1.2)
            # Simple % dot in center
            if (abs(x - (cx - size*0.06)) < size*0.035 and abs(y - (cy - size*0.06)) < size*0.035) or \
               (abs(x - (cx + size*0.06)) < size*0.035 and abs(y - (cy + size*0.06)) < size*0.035):
                r, g, b = 240, 240, 250
            # Slash line
            slash_x = (x - cx)
            slash_y = (y - cy)
            if abs(slash_x + slash_y) < size * 0.02 and math.hypot(slash_x, slash_y) < size * 0.12:
                r, g, b = 255, 255, 255

        return (r, g, b, 255)

    return make_png(size, size, sample)

if __name__ == '__main__':
    with open('icon-192.png', 'wb') as f:
        f.write(render_icon(192))
    with open('icon-512.png', 'wb') as f:
        f.write(render_icon(512))
    print("Icons generated successfully!")
