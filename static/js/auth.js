const auth = firebase.auth();

function setAuthLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle("btn-loading", loading);
}

function showAuthError(message) {
    const element = document.getElementById("error-message");
    if (element) element.textContent = message;
}

async function finishAuth(user) {
    // Send a signed Firebase ID token; the Flask server verifies it before
    // creating a session. Do not send only the user's email as proof of login.
    const idToken = await user.getIdToken();
    const response = await fetch("/auth-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
    }
    return data;
}

async function login() {
    setAuthLoading("loginBtn", true);
    showAuthError("");
    try {
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;
        if (!email || !password) throw new Error("Please enter email and password.");
        const result = await auth.signInWithEmailAndPassword(email, password);
        const data = await finishAuth(result.user);
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message || "Login failed.");
    } finally {
        setAuthLoading("loginBtn", false);
    }
}

async function signup() {
    setAuthLoading("signupBtn", true);
    showAuthError("");
    try {
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;
        if (!email || !password) throw new Error("Please enter email and password.");
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const data = await finishAuth(result.user);
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message || "Signup failed.");
    } finally {
        setAuthLoading("signupBtn", false);
    }
}

async function googleLogin() {
    setAuthLoading("googleBtn", true);
    showAuthError("");
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const data = await finishAuth(result.user);
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message || "Google login failed.");
    } finally {
        setAuthLoading("googleBtn", false);
    }
}

async function logout() {
    try {
        await auth.signOut();
    } finally {
        window.location.href = "/logout";
    }
}

window.login = login;
window.signup = signup;
window.googleLogin = googleLogin;
window.logout = logout;
