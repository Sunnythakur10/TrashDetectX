"""Utility for creating a test JPEG with EXIF GPS metadata.

This is a testing utility only. The website does not use this file directly.
"""
from pathlib import Path
import piexif
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent


def to_deg(value, refs):
    ref = refs[1] if value >= 0 else refs[0]
    value = abs(value)
    degrees = int(value)
    minutes_float = (value - degrees) * 60
    minutes = int(minutes_float)
    seconds = round((minutes_float - minutes) * 60, 6)
    return ((degrees, 1), (minutes, 1), (int(seconds * 1000000), 1000000)), ref


def add_gps(image_name, latitude, longitude, output_name="image_with_gps.jpg"):
    image_path = BASE_DIR / image_name
    output_path = BASE_DIR / output_name

    image = Image.open(image_path)

    lat_dms, lat_ref = to_deg(latitude, ("S", "N"))
    lon_dms, lon_ref = to_deg(longitude, ("W", "E"))

    exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
    exif_dict["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat_ref.encode()
    exif_dict["GPS"][piexif.GPSIFD.GPSLatitude] = lat_dms
    exif_dict["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lon_ref.encode()
    exif_dict["GPS"][piexif.GPSIFD.GPSLongitude] = lon_dms

    image.save(output_path, exif=piexif.dump(exif_dict))
    print(f"Created: {output_path}")


if __name__ == "__main__":
    add_gps("IMG20250415123359.jpg", 19.021507, 72.870742)
