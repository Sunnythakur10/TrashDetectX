from pathlib import Path
from ultralytics import YOLO
import cv2

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = "model/best.pt"
OUTPUT_DIR = BASE_DIR / "static" / "detected" / "images"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

model = YOLO(str(MODEL_PATH))
print(f"✅ YOLOv8 model loaded from {MODEL_PATH}")


def detect_trash_yolo(image_path):
    """Run YOLO on one image and save an annotated copy for the dashboard.

    Returns:
        (detections, url_path)
        detections = list of {class, confidence, bbox}
        url_path   = browser path served by Flask, e.g. /detected/images/foo.jpg
    """
    image_path = Path(image_path)

    if not image_path.exists():
        print(f"❌ File not found: {image_path}")
        return [], None

    results = model.predict(
        source=str(image_path),
        save=False,
        conf=0.25,
        verbose=False,
    )

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
        print("⚠️ No trash detected")
        return [], None

    # Let Ultralytics draw the bounding boxes and labels.
    annotated = results[0].plot()

    output_name = f"detected_{image_path.stem}.jpg"
    output_path = OUTPUT_DIR / output_name
    cv2.imwrite(str(output_path), annotated)

    # This is a URL, NOT a Windows filesystem path.
    url_path = f"/detected/images/{output_name}"

    print(f"✅ Saved detected image: {output_path}")
    print(f"✅ Dashboard image URL: {url_path}")
    print(f"✅ Detections: {detections}")

    return detections, url_path
