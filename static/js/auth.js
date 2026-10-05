const auth = firebase.auth();

function setAuthLoading(buttonId, loading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle("btn-loading", loading);
}

function showAuthError(message) {
    const el = document.getElementById("error-message");
    if (el) el.textContent = message;
}

function finishAuth(user) {
    return fetch("/auth-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email: user.email } })
    }).then(response => response.json());
}

async function login() {
    setAuthLoading("loginBtn", true);
    showAuthError("");

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAuthError("Please enter email and password.");
            return;
        }

        const result = await auth.signInWithEmailAndPassword(email, password);
        const data = await finishAuth(result.user);

        if (!data.success) throw new Error(data.error || "Login failed.");
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message);
    } finally {
        setAuthLoading("loginBtn", false);
    }
}

async function signup() {
    setAuthLoading("signupBtn", true);
    showAuthError("");

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAuthError("Please enter email and password.");
            return;
        }

        const result = await auth.createUserWithEmailAndPassword(email, password);
        const data = await finishAuth(result.user);

        if (!data.success) throw new Error(data.error || "Signup failed.");
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message);
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

        if (!data.success) throw new Error(data.error || "Google login failed.");
        window.location.href = data.redirect || "/index";
    } catch (error) {
        showAuthError(error.message);
    } finally {
        setAuthLoading("googleBtn", false);
    }
}

function logout() {
    auth.signOut().finally(() => {
        window.location.href = "/logout";
    });
}

window.login = login;
window.signup = signup;
window.googleLogin = googleLogin;
window.logout = logout;
