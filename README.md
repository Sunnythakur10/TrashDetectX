# TrashDetectX

AI-powered trash detection and reporting system built with **Python, Flask, YOLOv8, JavaScript, Firebase Authentication, and Cloud Firestore**.

TrashDetectX allows a user to:

- Sign up or log in using Firebase Authentication.
- Select a building block, floor, and area.
- Upload a photo of suspected trash.
- Automatically detect trash using a trained YOLOv8 model.
- Extract GPS information from image EXIF metadata when available.
- Submit the report to a Flask backend.
- Store report details and status in Cloud Firestore.
- Allow an administrator/operator to view detected images, locations, detected classes, and update a report from **Pending** to **Resolved**.
- Use the interface in English or Hindi and switch between light and dark themes.

> **Important project note:** The current trained model is a general-trash detection model. The project was designed for the e-waste use case, but the available training data used for this implementation was general waste/trash. The model can be retrained on an appropriate e-waste dataset later.

---

## 1. How the project works

The main application flow is:

```text
User
  |
  | Login / Signup
  v
Firebase Authentication
  |
  v
TrashDetectX Web UI
  |
  | Upload image + location/details
  v
Flask Backend
  |
  | /upload
  v
YOLOv8 trained model
  |
  | Detection + bounding boxes
  v
Flask
  |
  | /submit-report
  v
Cloud Firestore
  |
  v
Admin Dashboard
```

### Main components

| Component | Purpose |
|---|---|
| `app.py` | Flask backend, Firebase Admin SDK, sessions, API routes |
| `Detect.py` | Loads `model/best.pt` and performs YOLO detection |
| `model/best.pt` | Trained YOLOv8 weights used by the application |
| `templates/` | Flask/Jinja HTML pages |
| `static/js/` | Frontend logic, authentication, report submission, dashboard |
| `static/css/app.css` | Shared frontend styling |
| `firebase-config.js` | Browser-side Firebase configuration; created locally and ignored by Git |
| `firebase_config.json` | Firebase Admin SDK service-account credential; created locally and ignored by Git |

---

# 2. Prerequisites

Before setting up TrashDetectX, install the following.

### Required

1. **Python 3.10 or newer** is recommended.
2. **Git**.
3. A modern browser such as Chrome or Edge.
4. A Google account for creating a Firebase project.
5. Internet connection for Firebase and the browser-side CDN libraries.

### Optional but recommended

A GPU can make YOLO inference faster, but a CPU can still run the application. Ultralytics documents installation through pip and supports Python environments with PyTorch. See the official documentation: https://docs.ultralytics.com/quickstart

---

# 3. Clone the repository

Open a terminal and run:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd litter-detection-master
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the GitHub repository URL.

Example:

```bash
git clone https://github.com/yourusername/TrashDetectX.git
cd TrashDetectX
```

---

# 4. Create a Python virtual environment

Creating a virtual environment keeps the project's Python packages isolated from the rest of the computer.

## Windows

```bash
python -m venv .venv
```

Activate it:

### Command Prompt

```cmd
.venv\Scripts\activate
```

### PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

After activation, your terminal should show something similar to:

```text
(.venv) C:\...\litter-detection-master>
```

## macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

# 5. Install Python dependencies

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

Install the project dependencies:

```bash
pip install -r requirements.txt
```

The project uses packages required by the Flask backend, Firebase Admin SDK, Flask sessions/CORS, YOLO/Ultralytics and supporting libraries.

If your machine does not have a working Python environment, verify it with:

```bash
python --version
pip --version
```

---

# 6. Firebase setup — create your own Firebase project

Every person using their own copy should create their **own Firebase project**. Do not use somebody else's Firebase service-account file.

Firebase projects can be created from the Firebase Console:

https://console.firebase.google.com/

### Step 1 — Sign in

Open the Firebase Console and sign in with your Google account.

### Step 2 — Create a project

1. Click **Create a project** / **Add project**.
2. Enter a project name, for example:

```text
TrashDetectX-YourName
```

3. Continue through the setup.
4. Google Analytics is optional for this project. It is not required by the application.
5. Finish project creation.

Firebase creates a unique project ID for the project. The project ID is important because it identifies your Firebase project.

Official documentation: https://firebase.google.com/docs/admin/setup

---

# 7. Register the Firebase Web App

The browser-side application needs a Firebase web app configuration object.

Firebase provides this configuration when you register a web app with the Firebase project. Official documentation:

https://firebase.google.com/docs/web/setup

### Step 1 — Open Project settings

In the Firebase Console:

1. Open your new project.
2. Open **Project settings**.
3. Find **Your apps**.
4. Click the **Web (`</>`)** icon to register a web app.

### Step 2 — Give the app a nickname

For example:

```text
TrashDetectX Web
```

You do not need Firebase Hosting for the current local Flask setup.

### Step 3 — Register the app

Firebase will show a configuration object similar to:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Copy the values from **your own Firebase project**.

> Do not copy another person's configuration. The `apiKey` belongs to the Firebase web app/project you are setting up.

---

# 8. Create `firebase-config.js` locally

The repository intentionally ignores the browser Firebase config file so each developer can connect the project to their own Firebase project.

Create this file:

```text
static/js/firebase-config.js
```

Use the following structure:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
```

Replace every placeholder with the values copied from **Project settings → Your apps → Web app**.

The current frontend uses the Firebase JavaScript SDK through CDN scripts and expects the global `firebase` object, so do not add ES module `export` statements to this file.

The Firebase web configuration is required by:

- Login
- Sign up
- Google Sign-in
- Firestore reads from the dashboard
- Firestore status updates/deletes

Official Firebase Authentication web setup: https://firebase.google.com/docs/auth/web/start

---

# 9. Enable Firebase Authentication

TrashDetectX supports:

- Email + Password
- Google Sign-in

You must enable the providers you want to use.

Open:

**Firebase Console → Authentication → Sign-in method**

## 9.1 Enable Email/Password

1. Open the **Email/Password** provider.
2. Enable **Email/Password**.
3. Save the changes.

The login page uses Firebase email/password sign-in and sign-up.

Official documentation: https://firebase.google.com/docs/auth/web/password-auth

## 9.2 Enable Google Sign-in

1. In the same **Sign-in method** section, open **Google**.
2. Enable Google.
3. Select the required support email if Firebase asks for one.
4. Save.

Official documentation: https://firebase.google.com/docs/auth/web/google-signin

---

# 10. Configure Authorized Domains for local development

Firebase Authentication checks which domains are allowed to use your authentication project.

Because this application normally runs locally at:

```text
http://127.0.0.1:5000
```

and may also be accessed through:

```text
http://localhost:5000
```

open:

**Firebase Console → Authentication → Settings → Authorized domains**

Make sure the local domain you use is authorized.

Recent Firebase projects may require you to manually add `localhost`; Firebase documentation specifically notes that projects created after April 28, 2025 may not automatically include `localhost`. 

Official documentation: https://firebase.google.com/docs/auth/faq-and-troubleshooting

---

# 11. Create the Cloud Firestore database

TrashDetectX stores reports in a Firestore collection named:

```text
trash_reports
```

You must create Cloud Firestore for your Firebase project.

Open:

**Firebase Console → Firestore Database**

Then:

1. Click **Create database**.
2. Choose the Firestore database mode offered for your project.
3. Choose a database location.
4. Finish creation.

Choose the location carefully because Firebase/Google Cloud resources can have location dependencies.

Official documentation: https://firebase.google.com/docs/firestore/quickstart

> You do **not** need to manually create the `trash_reports` collection before running the application. The first successful report submission creates the collection/document automatically.

---

# 12. Configure Firestore Security Rules

The dashboard uses the Firebase Web SDK to directly read, update and delete documents in `trash_reports`.

Therefore, the browser request must be allowed by Firestore Security Rules.

For a **local academic/demo setup**, the simplest rule compatible with the current application is:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /trash_reports/{reportId} {
      allow read, write: if request.auth != null;
    }

  }
}
```

Apply it in:

**Firebase Console → Firestore Database → Rules**

Then publish the rules.

Firebase documents `request.auth != null` as the standard pattern for checking whether a user is authenticated. 

Official documentation:

https://firebase.google.com/docs/firestore/security/rules-conditions

https://firebase.google.com/docs/firestore/security/get-started

### Important security warning

The rule above allows **any authenticated user** to read/write `trash_reports`. That matches the current project's simple academic/demo architecture, but it is not an ideal production authorization model.

For a production deployment, dashboard write/delete permissions should be restricted to authorized administrators rather than every authenticated user. Firebase also recommends narrowing permissions beyond a simple `request.auth != null` rule for production applications.

---

# 13. Create the Firebase Admin SDK service-account credential

The Flask backend does not use the browser Firebase API key to connect to Firestore. It uses the **Firebase Admin SDK** with a service-account credential.

This is a different credential from the web configuration.

Official documentation:

https://firebase.google.com/docs/admin/setup

### Step 1 — Open Project settings

In Firebase Console:

**Project settings → Service accounts**

### Step 2 — Generate a private key

1. Open the **Service accounts** tab.
2. Click **Generate new private key**.
3. Confirm the download.
4. A JSON file will be downloaded.

### Step 3 — Rename it

Rename the downloaded JSON file to:

```text
firebase_config.json
```

### Step 4 — Put it in the project root

Place it here:

```text
litter-detection-master/
├── firebase_config.json
├── app.py
├── Detect.py
└── ...
```

The backend currently loads this file from the project root.

### IMPORTANT

**Never commit `firebase_config.json` to GitHub.**

It contains a private service-account key.

The `.gitignore` file in this repository is configured to ignore it.

Firebase's Admin SDK documentation specifically warns that service-account private keys must be stored securely. 

---

# 14. Important backend configuration change for your own Firebase project

The current version of `app.py` contains a Firebase project ID in the Admin SDK initialization.

Before sharing the repository, the better portable form is:

```python
cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
```

Instead of hard-coding one project's ID.

Why?

Each friend will have a different Firebase project. The service-account JSON already identifies its Firebase/Google Cloud project, so the application should use that credential rather than your project's hard-coded ID.

If you keep the hard-coded version, a friend must manually replace your project ID with theirs in `app.py`.

**Recommended:** remove the hard-coded `projectId` override before the first public commit.

---

# 15. YOLO model setup

The trained model should already be committed to the repository at:

```text
model/best.pt
```

This is the model used by the Flask application.

`Detect.py` must load the model from:

```python
model_path = "model/best.pt"
```

Do not point it back to the old `runs/.../best.pt` path after removing the `runs` directory.

### Do friends need to train the model again?

**No.**

If `model/best.pt` is included in the repository, friends can use the trained weights directly.

Training is only required if they want to create a new model or retrain the model on another dataset.

---

# 16. If `infer.py` is kept in the repository

The standalone inference script should also use the new model path.

Change its default model path to:

```python
default="model/best.pt"
```

Otherwise it may still refer to the old `runs/detect/.../best.pt` path.

This is not required for the main web application, but it is required if someone wants to use `infer.py` directly.

---

# 17. Required project structure

A clean cloned repository should look similar to:

```text
litter-detection-master/
│
├── model/
│   └── best.pt
│
├── static/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── firebase-config.js       # created locally, ignored by Git
│   │   ├── i18n.js
│   │   └── report.js
│   └── logo.svg
│
├── templates/
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   └── report.html
│
├── app.py
├── Detect.py
├── infer.py
├── train.py
├── requirements.txt
├── README.md
├── .gitignore
│
└── firebase_config.json              # created locally, ignored by Git
```

The following directories are generated at runtime and do not need to be committed:

```text
.venv/
__pycache__/
flask_session/
instance/
runs/
node_modules/
static/uploads/
static/detected/
```

---

# 18. Create runtime folders if necessary

The Flask application creates the upload directory automatically when an image is uploaded.

You can also create the directories manually:

```text
static/uploads/
static/detected/
```

These should remain empty in the Git repository because they are generated at runtime.

---

# 19. Run the project

After completing the Firebase setup and creating both local Firebase configuration files, activate the Python virtual environment and run:

```bash
python app.py
```

The Flask server should start at:

```text
http://127.0.0.1:5000
```

The application also opens the browser automatically in the current implementation.

If it does not open automatically, manually visit:

```text
http://127.0.0.1:5000/
```

---

# 20. First-time test

After the server starts, test the complete flow in this order.

## Step 1 — Open login

Go to:

```text
http://127.0.0.1:5000/login
```

## Step 2 — Create an account

Use **Sign Up** with an email address and password.

Firebase Authentication should create the account in your Firebase project.

You can verify it in:

**Firebase Console → Authentication → Users**

## Step 3 — Test Google login

Click **Sign in with Google**.

This works only after the Google authentication provider has been enabled and the local domain is authorized.

## Step 4 — Open the report page

After logging in, open:

```text
http://127.0.0.1:5000/report
```

## Step 5 — Select the location

Select:

```text
Block
→ Floor
→ Area
```

Then optionally enter additional details.

## Step 6 — Upload an image

Upload a clear image containing the suspected trash.

The frontend attempts to read GPS coordinates from the image's EXIF metadata when GPS information exists.

Images without EXIF GPS data can still be submitted; the location field can remain empty.

## Step 7 — YOLO detection

The image is sent to:

```text
POST /upload
```

Flask passes the image to `Detect.py`, which loads `model/best.pt` and runs YOLO inference.

The processed image with detection boxes is saved under the runtime detected-image directory.

## Step 8 — Submit the report

The report is sent to:

```text
POST /submit-report
```

The backend stores the report in:

```text
Firestore
└── trash_reports
    └── <document ID>
```

Every new report starts with:

```text
status = Pending
```

## Step 9 — Open the admin dashboard

Visit:

```text
http://127.0.0.1:5000/admin/dashboard
```

The dashboard reads the Firestore `trash_reports` collection and displays:

- Block
- Floor
- Area
- Details
- Status
- Detected image
- Location
- Detected classes
- Resolve action
- Delete action
- Total / Pending / Resolved statistics

---

# 21. Firebase configuration checklist

Before saying "Firebase is not working", verify every item below.

### Web app

- [ ] Firebase project created.
- [ ] Web app registered.
- [ ] `static/js/firebase-config.js` created locally.
- [ ] Correct `apiKey` copied from the web app configuration.
- [ ] Correct `authDomain` copied.
- [ ] Correct `projectId` copied.
- [ ] Correct `storageBucket` copied.
- [ ] Correct `messagingSenderId` copied.
- [ ] Correct `appId` copied.

### Authentication

- [ ] Email/Password enabled.
- [ ] Google enabled if Google login is required.
- [ ] Local development domain authorized.

### Firestore

- [ ] Firestore database created.
- [ ] Firestore rules allow the authenticated access required by the current dashboard.
- [ ] First test report successfully creates `trash_reports`.

### Backend

- [ ] `firebase_config.json` exists in the project root.
- [ ] Service-account JSON belongs to the same Firebase project as `firebase-config.js`.
- [ ] `app.py` does not contain another person's hard-coded project ID, or the ID has been replaced correctly.

### Model

- [ ] `model/best.pt` exists.
- [ ] `Detect.py` points to `model/best.pt`.

---

# 22. API endpoints used by the project

The current application exposes these Flask routes.

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | Redirects to login |
| `/login` | GET/POST | Login page |
| `/auth-callback` | POST | Creates the Flask session after Firebase browser authentication |
| `/logout` | GET | Logs the user out of the Flask session |
| `/index` | GET | Home page after login |
| `/report` | GET | Report submission page |
| `/upload` | POST | Uploads image and runs YOLO detection |
| `/submit-report` | POST | Saves report data to Firestore |
| `/admin/reports` | GET | Server-side report retrieval route |
| `/admin/dashboard` | GET | Admin dashboard page |
| `/update-status/<report_id>` | POST | Updates a report's status |
| `/delete-report/<report_id>` | DELETE | Deletes a report |
| `/detected/<path:filename>` | GET | Serves detected images |

---

# 23. Firestore report structure

A report currently contains fields similar to:

```json
{
  "block": "M Block",
  "floor": "1st Floor",
  "area": "M101",
  "details": "Near entrance",
  "status": "Pending",
  "latitude": 19.000000,
  "longitude": 72.000000,
  "filename": "trash.jpg",
  "detected_image": "/detected/images/trash.jpg",
  "detections": [
    "plastic bottle",
    "drink can"
  ]
}
```

The exact detection classes depend on the classes learned by the trained YOLO model.

---

# 24. Common errors and fixes

## Error: `API key not valid`

Check:

1. `static/js/firebase-config.js` uses the API key from **your own** Firebase project's web app configuration.
2. You did not accidentally copy an old/incorrect key.
3. The `projectId`, `authDomain`, and `apiKey` all belong to the same Firebase project.
4. Hard-refresh the browser after changing the configuration.

Useful browser shortcut on Windows:

```text
Ctrl + Shift + R
```

---

## Error: `Firebase initialization failed` in Flask

Check that:

```text
firebase_config.json
```

exists in the project root.

Also check that the file is the **service-account private key**, not the browser Firebase config.

The two files have different purposes:

```text
firebase-config.js
→ Browser / Firebase Web SDK

firebase_config.json
→ Python / Firebase Admin SDK
```

---

## Error: `No module named ...`

Make sure your virtual environment is activated and run:

```bash
pip install -r requirements.txt
```

If necessary:

```bash
python -m pip install --upgrade pip
```

---

## Error: model file not found

Verify:

```text
model/
└── best.pt
```

and that `Detect.py` contains:

```python
model_path = "model/best.pt"
```

Do not delete/move `best.pt` without changing the path in code.

---

## Error: dashboard shows zero Firestore reports

Check:

1. You are logged in.
2. Firestore exists.
3. `trash_reports` contains at least one document.
4. Firestore rules allow the authenticated browser to read the collection.
5. The browser console does not show a Firestore `permission-denied` error.

---

## Error: `permission-denied` from Firestore

The browser-side Firestore request is being blocked by Security Rules.

For a local demo, verify the `trash_reports` rule:

```text
match /trash_reports/{reportId} {
  allow read, write: if request.auth != null;
}
```

For production, use narrower rules.

---

## Error: Google Sign-in popup fails

Check:

1. Google provider is enabled.
2. Your local domain is in Firebase Authentication's Authorized Domains.
3. You are actually running the app through the Flask server rather than opening the HTML file directly with `file:///...`.

Run:

```bash
python app.py
```

Then use:

```text
http://127.0.0.1:5000
```

or

```text
http://localhost:5000
```

---

## Error: detected image does not appear on the dashboard

Make sure:

1. YOLO successfully detected trash.
2. The detected image was generated under the Flask runtime detected-image directory.
3. `Detect.py` returns a browser-accessible detected-image path.
4. Flask is still serving `/detected/<path:filename>`.
5. You did not accidentally commit/restore old `runs` paths into the Firestore document format.

---

# 25. Do not open the HTML files directly

Do **not** run the project by double-clicking:

```text
login.html
index.html
report.html
```

This project is a Flask application and must be served by Flask.

Correct:

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

---

# 26. Do not commit private files

These files/directories should stay local and should be ignored by Git:

```text
firebase_config.json
.venv/
__pycache__/
flask_session/
instance/
runs/
node_modules/
static/uploads/
static/detected/
```

Your local test images can also remain on your laptop without being committed.

The trained model is intentionally different:

```text
model/best.pt
```

This **should be committed** so that another developer can clone the project and run the application without retraining.

---

# 27. Development workflow for teammates

A recommended workflow is:

```bash
git clone <REPO_URL>
cd litter-detection-master
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Then each developer creates their own:

```text
static/js/firebase-config.js
firebase_config.json
```

and uses their own Firebase project.

After setup:

```bash
python app.py
```

Each teammate can keep their own local uploads, test images, Flask session data and YOLO generated outputs without pushing them to GitHub.

---

# 28. Suggested team roles

For a three-person academic project, the codebase can be divided approximately as:

### Backend / AI / Firebase

- Flask APIs
- Firebase Admin SDK
- Firestore integration
- YOLO model integration
- Authentication integration

### Frontend / UI

- HTML
- CSS
- JavaScript
- Responsive design
- Hindi/English interface
- Dashboard presentation

### Testing / Documentation

- Test cases
- Firebase setup verification
- Model testing
- README/documentation
- Presentation/demo preparation

---

# 29. Model training

`train.py` can be used for model training/retraining when a suitable YOLO dataset is available.

The trained result used by the application is:

```text
model/best.pt
```

The application itself does **not** need the original training runs once `best.pt` has been copied to the `model/` directory.

Therefore this directory can remain local:

```text
runs/
```

and does not need to be uploaded to GitHub.

---

# 30. GitHub pre-commit checklist

Before the first public commit, run:

```bash
git status
```

Confirm that the repository contains the application source, but does **not** contain:

```text
firebase_config.json
.venv/
node_modules/
runs/
static/uploads/
static/detected/
__pycache__/
instance/
flask_session/
```

Confirm that this file **is** tracked:

```text
model/best.pt
```

Also verify that `Detect.py` uses:

```python
model_path = "model/best.pt"
```

---

# 31. First Git commit

After the project is clean:

```bash
git add .
git status
git commit -m "Initial TrashDetectX project setup"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

Before pushing, always inspect the output of:

```bash
git status
```

and make sure no private credentials are staged.

---

# 32. About `best.pt` and GitHub file size

GitHub has file-size limitations for normal Git repositories. If `model/best.pt` is too large for normal Git, use **Git LFS** rather than deleting the trained model from the project.

Git LFS can be initialized with:

```bash
git lfs install
git lfs track "model/best.pt"
git add .gitattributes
```

Then commit normally.

---

# 33. Project limitations

The current version is intentionally a practical academic project and has some limitations:

1. The trained model detects the classes represented in its training dataset; it should not be described as an e-waste-specific model unless retrained on e-waste data.
2. EXIF GPS works only when the uploaded image actually contains GPS metadata.
3. The current Firestore dashboard permissions are suitable for a simple authenticated demo, not a fully role-based production admin system.
4. Uploaded and detected images are handled locally by Flask in the current implementation rather than being stored in Firebase Storage.
5. Flask is run locally with the development server during normal project use.

---

# 34. Future improvements

Possible improvements include:

- Browser Geolocation fallback when EXIF GPS is missing.
- Firebase Storage for uploaded/detected images.
- Proper admin roles/custom claims.
- Production deployment using a production WSGI server.
- Better report ownership and user-specific permissions.
- E-waste-specific model retraining.
- Automatic cleanup of old uploaded/detected images.
- More detailed YOLO confidence/bounding-box analytics.

---

# 35. Technology stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Firebase Web SDK
- EXIF.js

### Backend

- Python
- Flask
- Flask-CORS
- Flask-Session
- Firebase Admin SDK

### AI / Computer Vision

- Ultralytics YOLOv8
- PyTorch through the Ultralytics stack

### Database / Authentication

- Firebase Authentication
- Cloud Firestore

### Development

- Git / GitHub
- Python virtual environment

---

# 36. Official documentation

Firebase project and web app setup:

https://firebase.google.com/docs/web/setup

Firebase Authentication for Web:

https://firebase.google.com/docs/auth/web/start

Email/password authentication:

https://firebase.google.com/docs/auth/web/password-auth

Google authentication:

https://firebase.google.com/docs/auth/web/google-signin

Firebase Authentication troubleshooting / authorized domains:

https://firebase.google.com/docs/auth/faq-and-troubleshooting

Cloud Firestore quickstart:

https://firebase.google.com/docs/firestore/quickstart

Firestore Security Rules:

https://firebase.google.com/docs/firestore/security/get-started

Firestore Security Rules conditions:

https://firebase.google.com/docs/firestore/security/rules-conditions

Firebase Admin SDK / service accounts:

https://firebase.google.com/docs/admin/setup

Ultralytics installation:

https://docs.ultralytics.com/quickstart

---

# 37. Quick setup summary

For someone who already knows the basics and just wants the checklist:

```text
1. Clone repository
2. Install Python
3. Create .venv
4. Activate .venv
5. pip install -r requirements.txt
6. Create Firebase project
7. Register Web App
8. Create static/js/firebase-config.js
9. Enable Email/Password Authentication
10. Enable Google Authentication
11. Add localhost / 127.0.0.1 to Authorized Domains if needed
12. Create Firestore Database
13. Set Firestore rules for authenticated access to trash_reports
14. Generate Firebase Admin private key
15. Rename it to firebase_config.json
16. Put firebase_config.json in project root
17. Make sure app.py uses the current Firebase project correctly
18. Make sure Detect.py uses model/best.pt
19. Run: python app.py
20. Create account
21. Upload a trash image
22. Confirm YOLO detection
23. Confirm trash_reports appears in Firestore
24. Open /admin/dashboard
25. Test Resolve/Delete
```

---

# TrashDetectX

**Detect. Report. Resolve.**

A practical AI-powered workflow for identifying trash and turning a photo into an actionable cleanup report.
