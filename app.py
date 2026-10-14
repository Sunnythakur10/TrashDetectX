import os
import uuid
from datetime import timedelta
from pathlib import Path
from urllib.parse import quote

from flask import (
    Flask, jsonify, redirect, render_template, request,
    send_from_directory, session, url_for,
)
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, firestore, storage

from Detect import detect_trash_yolo

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
DETECTED_FOLDER = BASE_DIR / "static" / "detected"
DETECTED_IMAGES_FOLDER = DETECTED_FOLDER / "images"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp"}

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
DETECTED_IMAGES_FOLDER.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)

is_render = bool(os.getenv("RENDER_SERVICE_NAME"))
secret_key = os.getenv("SECRET_KEY")
if is_render and not secret_key:
    raise RuntimeError("Set SECRET_KEY in the Render environment settings.")

app.config.update(
    SECRET_KEY=secret_key or "local-development-only-change-me",
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.getenv(
        "SESSION_COOKIE_SECURE", "true" if is_render else "false"
    ).lower() == "true",
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
)

# Keep the service-account key out of Git. In Render, add it as a Secret File,
# usually available at /etc/secrets/firebase_config.json.
credential_path = Path(
    os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", str(BASE_DIR / "firebase_config.json"))
)
if not credential_path.is_file():
    raise FileNotFoundError(
        "Firebase service-account JSON was not found. Set FIREBASE_SERVICE_ACCOUNT_FILE "
        "or place firebase_config.json in the project root for local development."
    )

cred = credentials.Certificate(str(credential_path))
firebase_options = {}
project_id = os.getenv("FIREBASE_PROJECT_ID")
storage_bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "").strip()
if project_id:
    firebase_options["projectId"] = project_id
if storage_bucket_name:
    firebase_options["storageBucket"] = storage_bucket_name

if not firebase_admin._apps:
    firebase_app = firebase_admin.initialize_app(cred, firebase_options or None)
else:
    firebase_app = firebase_admin.get_app()

db = firestore.client(app=firebase_app)
app.logger.info("Firebase Admin SDK initialized")

ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", "").split(",")
    if email.strip()
}


def current_user_is_admin():
    """Require an explicit admin allowlist in production."""
    email = str(session.get("user_email", "")).strip().lower()
    if ADMIN_EMAILS:
        return email in ADMIN_EMAILS
    # Convenience for local development only. Render should always have ADMIN_EMAILS.
    return not is_render and bool(session.get("logged_in"))


def admin_required_json():
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Authentication required"}), 401
    if not current_user_is_admin():
        return jsonify({"success": False, "error": "Administrator access required"}), 403
    return None


def allowed_image(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_detected_image(local_image_path: Path) -> str:
    """Upload the annotated image to Firebase Storage if a bucket is configured.

    Local fallback is convenient for development, but its URL will not survive a
    Render redeploy/restart. Configure FIREBASE_STORAGE_BUCKET for durable images.
    """
    if not storage_bucket_name:
        app.logger.warning(
            "FIREBASE_STORAGE_BUCKET is not set; detected images are local and temporary."
        )
        return f"/detected/images/{local_image_path.name}"

    bucket = storage.bucket(app=firebase_app)
    object_name = f"detected/images/{local_image_path.name}"
    blob = bucket.blob(object_name)
    download_token = uuid.uuid4().hex
    blob.metadata = {"firebaseStorageDownloadTokens": download_token}
    blob.upload_from_filename(str(local_image_path), content_type="image/jpeg")

    encoded_object = quote(object_name, safe="")
    return (
        f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/"
        f"{encoded_object}?alt=media&token={download_token}"
    )


@app.route("/health")
def health():
    return jsonify({"ok": True, "service": "TrashDetectX"})


@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")


@app.route("/auth-callback", methods=["POST"])
def auth_callback():
    """Exchange a Firebase client ID token for a verified Flask session."""
    data = request.get_json(silent=True) or {}
    id_token = data.get("idToken")
    if not id_token:
        return jsonify({"success": False, "error": "Missing Firebase ID token"}), 401

    try:
        decoded = firebase_auth.verify_id_token(id_token, app=firebase_app)
        email = decoded.get("email")
        uid = decoded.get("uid")
        if not email or not uid:
            return jsonify({"success": False, "error": "Firebase account has no email"}), 401

        session.clear()
        session["logged_in"] = True
        session["user_email"] = email
        session["uid"] = uid
        session.permanent = True

        return jsonify({"success": True, "redirect": url_for("index")})
    except Exception:
        app.logger.exception("Firebase ID token verification failed")
        return jsonify({"success": False, "error": "Firebase authentication could not be verified"}), 401


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/index")
def index():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return render_template("index.html", user_email=session.get("user_email", ""))


@app.route("/report")
def report():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return render_template("report.html")


@app.route("/upload", methods=["POST"])
def upload_image():
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Authentication required"}), 401

    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"success": False, "error": "No image uploaded"}), 400
    if not allowed_image(file.filename):
        return jsonify({"success": False, "error": "Unsupported image format"}), 400

    safe_name = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{safe_name}"
    input_path = UPLOAD_FOLDER / unique_filename
    file.save(str(input_path))

    try:
        detections, local_image_url = detect_trash_yolo(input_path)
        if not detections or not local_image_url:
            return jsonify({"success": False, "error": "No trash detected in the image"}), 422

        local_detected_path = DETECTED_IMAGES_FOLDER / Path(local_image_url).name
        if not local_detected_path.is_file():
            app.logger.error("Annotated image was not created: %s", local_detected_path)
            return jsonify({"success": False, "error": "Detection image could not be generated"}), 500

        detected_image_path = upload_detected_image(local_detected_path)
        return jsonify({
            "success": True,
            "filename": unique_filename,
            "detections": detections,
            "detected_image_path": detected_image_path,
        })
    except Exception as exc:
        app.logger.exception("YOLO detection/image upload failed")
        return jsonify({"success": False, "error": "Image processing failed. Check server logs."}), 500


@app.route("/submit-report", methods=["POST"])
def submit_report():
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Authentication required"}), 401

    data = request.get_json(silent=True) or {}
    block, floor, area = data.get("block"), data.get("floor"), data.get("area")
    if not all(isinstance(value, str) and value.strip() for value in (block, floor, area)):
        return jsonify({"success": False, "error": "Block, floor and area are required"}), 400

    gps = data.get("gps") or {}
    detections = data.get("detections") or []
    if not isinstance(detections, list) or not detections:
        return jsonify({"success": False, "error": "Report rejected because no trash was detected"}), 422

    report_data = {
        "user_email": session.get("user_email", ""),
        "block": block.strip(),
        "floor": floor.strip(),
        "area": area.strip(),
        "details": str(data.get("details", "")).strip(),
        "status": "Pending",
        "latitude": gps.get("latitude"),
        "longitude": gps.get("longitude"),
        "filename": str(data.get("filename", "")),
        "detected_image": str(data.get("detected_image_path", "")),
        "detections": detections,
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    try:
        # One Firestore write per report.
        _, doc_ref = db.collection("trash_reports").add(report_data)
        app.logger.info("Saved trash report %s", doc_ref.id)
        return jsonify({"success": True, "message": "Report submitted successfully", "report_id": doc_ref.id})
    except Exception:
        app.logger.exception("Firestore save failed")
        return jsonify({"success": False, "error": "Could not save report to Firestore"}), 500


@app.route("/admin/dashboard")
def admin_dashboard():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    if not current_user_is_admin():
        return redirect(url_for("index"))
    return render_template("dashboard.html")


@app.route("/admin/reports")
def view_reports():
    return redirect(url_for("admin_dashboard"))


@app.route("/update-status/<string:report_id>", methods=["POST"])
def update_status(report_id):
    denied = admin_required_json()
    if denied:
        return denied
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in {"Pending", "Resolved"}:
        return jsonify({"success": False, "error": "Invalid status"}), 400
    try:
        db.collection("trash_reports").document(report_id).update({"status": new_status})
        return jsonify({"success": True, "message": "Status updated"})
    except Exception:
        app.logger.exception("Status update failed")
        return jsonify({"success": False, "error": "Could not update report status"}), 500


@app.route("/delete-report/<string:report_id>", methods=["DELETE"])
def delete_report(report_id):
    denied = admin_required_json()
    if denied:
        return denied
    try:
        db.collection("trash_reports").document(report_id).delete()
        return jsonify({"success": True, "message": "Report deleted"})
    except Exception:
        app.logger.exception("Report deletion failed")
        return jsonify({"success": False, "error": "Could not delete report"}), 500


@app.route("/detected/<path:filename>")
def serve_detected_images(filename):
    return send_from_directory(str(DETECTED_FOLDER), filename)


if __name__ == "__main__":
    app.run(debug=not is_render, port=int(os.getenv("PORT", "5000")))
