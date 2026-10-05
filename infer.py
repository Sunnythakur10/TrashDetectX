import argparse
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = BASE_DIR / "runs" / "detect" / "train" / "yolov8s_100epochs" / "weights" / "best.pt"

parser = argparse.ArgumentParser(description="YOLOv8 inference script")
parser.add_argument("--model", type=str, default=str(DEFAULT_MODEL), help="Path to YOLO weights")
parser.add_argument("--source", type=str, required=True, help="Image/video source")
parser.add_argument("--save", action="store_true", help="Save predictions")


if __name__ == "__main__":
    args = parser.parse_args()
    model = YOLO(args.model)
    model.predict(source=args.source, save=args.save)
