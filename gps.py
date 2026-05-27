import piexif
from PIL import Image

# Convert decimal degrees to DMS (degrees, minutes, seconds)
def to_deg(value, loc):
    if value < 0:
        value = -value
        loc_value = loc[0]
    else:
        loc_value = loc[1]
    deg = int(value)
    min_ = int((value - deg) * 60)
    sec = int((value - deg - min_ / 60) * 3600)
    return ((deg, 1), (min_, 1), (sec, 1)), loc_value

# Your image path and coordinates
image_path = "IMG20250415123359.jpg"
lat = 19.021507      # Latitude: 19.021507 | Longitude: 72.870742
lon = 72.870742

# Convert
lat_dms, lat_ref = to_deg(lat, ['S', 'N'])
lon_dms, lon_ref = to_deg(lon, ['W', 'E'])

# Load image
img = Image.open(image_path)

# Create EXIF data
exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
exif_dict['GPS'][piexif.GPSIFD.GPSLatitudeRef] = lat_ref.encode()
exif_dict['GPS'][piexif.GPSIFD.GPSLatitude] = lat_dms
exif_dict['GPS'][piexif.GPSIFD.GPSLongitudeRef] = lon_ref.encode()
exif_dict['GPS'][piexif.GPSIFD.GPSLongitude] = lon_dms

# Insert EXIF and save
exif_bytes = piexif.dump(exif_dict)
img.save("image_with_gps.jpg", exif=exif_bytes)
