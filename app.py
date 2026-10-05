from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from flask_session import Session
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, firestore
from Detect import detect_trash_yolo

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__)
CORS(app)

# Session configuration
app.config["SECRET_KEY"] = "change-this-secret-key"
app.config["SESSION_TYPE"] = "filesystem"
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
Session(app)

# Firebase Admin SDK
firebase_key = BASE_DIR / "firebase_config.json"
if not firebase_key.exists():
    raise FileNotFoundError(
        f"Firebase service-account file not found: {firebase_key}"
    )

if not firebase_admin._apps:
    cred = credentials.Certificate(str(firebase_key))
    firebase_admin.initialize_app(cred, {"projectId": "trash-detector-58bb6"})

db = firestore.client()
print("✅ Firebase initialized successfully")

UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
DETECTED_FOLDER = BASE_DIR / "static" / "detected"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
(DETECTED_FOLDER / "images").mkdir(parents=True, exist_ok=True)


# -----------------------------
# Authentication / pages
# -----------------------------
@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")


@app.route("/auth-callback", methods=["POST"])
def auth_callback():
    data = request.get_json(silent=True) or {}
    user = data.get("user") or {}
    email = user.get("email")

    if not email:
        return jsonify({"success": False, "error": "Authentication failed"}), 401

    session["logged_in"] = True
    session["user_email"] = email

    return jsonify({
        "success": True,
        "redirect": url_for("index"),
    })


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/index")
def index():
    if not session.get("logged_in"):
        return redirect(url_for("login"))

    return render_template(
        "index.html",
        user_email=session.get("user_email", "")
    )


@app.route("/report")
def report():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return render_template("report.html")


# -----------------------------
# Image upload + YOLO detection
# -----------------------------
@app.route("/upload", methods=["POST"])
def upload_image():
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    file = request.files.get("file")

    if not file or not file.filename:
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"success": False, "error": "Invalid filename"}), 400

    input_path = UPLOAD_FOLDER / filename
    file.save(str(input_path))

    try:
        detections, detected_image_url = detect_trash_yolo(input_path)

        # IMPORTANT: do not create a Firestore document here.
        # Firestore is written exactly once by /submit-report.
        if not detections:
            return jsonify({
                "success": False,
                "error": "No trash detected in the image"
            }), 422

        return jsonify({
            "success": True,
            "filename": filename,
            "detections": detections,
            "detected_image_path": detected_image_url,
        })

    except Exception as exc:
        app.logger.exception("YOLO detection failed")
        return jsonify({
            "success": False,
            "error": str(exc)
        }), 500


# -----------------------------
# Save report to Firestore
# -----------------------------
@app.route("/submit-report", methods=["POST"])
def submit_report():
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}

    try:
        gps = data.get("gps") or {}
        detections = data.get("detections") or []

        if not data.get("block") or not data.get("floor") or not data.get("area"):
            return jsonify({
                "success": False,
                "error": "Block, floor and area are required"
            }), 400

        # A report must come from a successful YOLO detection.
        if not detections:
            return jsonify({
                "success": False,
                "error": "Report rejected because no trash was detected"
            }), 422

        report = {
            "user_email": session.get("user_email", ""),
            "block": data.get("block", ""),
            "floor": data.get("floor", ""),
            "area": data.get("area", ""),
            "details": data.get("details", ""),
            "status": "Pending",
            "latitude": gps.get("latitude"),
            "longitude": gps.get("longitude"),
            "filename": data.get("filename", ""),
            "detected_image": data.get("detected_image_path", ""),
            "detections": detections,
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        # ONE Firestore write. No retry wrapper, preventing accidental duplicates.
        doc_ref = db.collection("trash_reports").add(report)
        print(f"✅ Report saved: {doc_ref[1].id}")

        return jsonify({
            "success": True,
            "message": "Report submitted successfully",
            "report_id": doc_ref[1].id,
        })

    except Exception as exc:
        app.logger.exception("Firestore save failed")
        return jsonify({
            "success": False,
            "error": str(exc)
        }), 500


# -----------------------------
# Admin dashboard
# -----------------------------
@app.route("/admin/dashboard")
def admin_dashboard():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return render_template("dashboard.html")


@app.route("/admin/reports")
def view_reports():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return redirect(url_for("admin_dashboard"))


@app.route("/update-status/<string:report_id>", methods=["POST"])
def update_status(report_id):
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "Pending")

    try:
        db.collection("trash_reports").document(report_id).update({
            "status": new_status
        })
        return jsonify({"success": True, "message": "Status updated"})
    except Exception as exc:
        app.logger.exception("Status update failed")
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/delete-report/<string:report_id>", methods=["DELETE"])
def delete_report(report_id):
    if not session.get("logged_in"):
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    try:
        db.collection("trash_reports").document(report_id).delete()
        return jsonify({"success": True, "message": "Report deleted"})
    except Exception as exc:
        app.logger.exception("Delete failed")
        return jsonify({"success": False, "error": str(exc)}), 500


# /detected/images/foo.jpg -> static/detected/images/foo.jpg
@app.route("/detected/<path:filename>")
def serve_detected_images(filename):
    return send_from_directory(str(DETECTED_FOLDER), filename)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
