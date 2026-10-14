from pathlib import Path
from ultralytics import YOLO
import cv2

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "best.pt"
OUTPUT_DIR = BASE_DIR / "static" / "detected" / "images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"YOLO model weights not found at {MODEL_PATH}. "
        "Commit model/best.pt or configure a reliable model download."
    )

model = YOLO(str(MODEL_PATH))
print(f"YOLOv8 model loaded from {MODEL_PATH}")


def detect_trash_yolo(image_path):
    """Return detection records and the local URL for the annotated image."""
    image_path = Path(image_path)
    if not image_path.is_file():
        raise FileNotFoundError(f"Input image not found: {image_path}")

    results = model.predict(source=str(image_path), save=False, conf=0.25, verbose=False)
    detections = []

    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            detections.append({
                "class": model.names[class_id],
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, x2, y2],
            })

    if not detections:
        return [], None

    annotated = results[0].plot()
    output_name = f"detected_{image_path.stem}.jpg"
    output_path = OUTPUT_DIR / output_name
    if not cv2.imwrite(str(output_path), annotated):
        raise OSError(f"Could not save annotated detection image: {output_path}")

    return detections, f"/detected/images/{output_name}"
