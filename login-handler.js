import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCL1crs6TFPLZLZR607kBU1UHkYrGaCxmU",
    authDomain: "healthsync-7263e.firebaseapp.com",
    projectId: "healthsync-7263e",
    storageBucket: "healthsync-7263e.appspot.com",
    messagingSenderId: "769113656753",
    appId: "1:769113656753:web:f80edc9673615912d44190"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById('loginForm');
const errorMessageDiv = document.getElementById('loginErrorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessageDiv.classList.add('hidden'); // Hide error message on new attempt

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // After successful authentication, check user's role and onboarding status in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // FIXED: Handle both patients and doctors
            if (userData.role === 'patient') {
                // Store patient session
                sessionStorage.setItem('loggedInPatientUid', user.uid);
                sessionStorage.setItem('userRole', 'patient');
                
                // Check if they have completed the onboarding process
                if (userData.onboardingComplete) {
                    window.location.href = 'patient.html'; // Go to the main dashboard
                } else {
                    window.location.href = 'patient-onboarding.html'; // Go to the onboarding form
                }
            } else if (userData.role === 'doctor') {
                // FIXED: Handle doctor login properly
                // Store doctor session
                sessionStorage.setItem('loggedInDoctorUid', user.uid);
                sessionStorage.setItem('userRole', 'doctor');
                
                // Check if they have completed the onboarding process
                if (userData.onboardingComplete) {
                    window.location.href = 'doctor.html'; // Go to doctor dashboard
                } else {
                    window.location.href = 'doctor-onboarding.html'; // Go to doctor onboarding if needed
                }
            } else {
                // Handle unknown roles
                showError("Invalid user role. Please contact support.");
                auth.signOut();
            }
        } else {
            showError("User data not found. Please contact support.");
            auth.signOut();
        }

    } catch (error) {
        // Handle authentication errors
        console.error("Login failed:", error.code);
        let errorMessage = "Login failed. Please try again.";

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "No account found with this email address.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Incorrect password. Please try again.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            case 'auth/user-disabled':
                errorMessage = "This account has been disabled. Please contact support.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Too many failed login attempts. Please try again later.";
                break;
            case 'auth/network-request-failed':
                errorMessage = "Network error. Please check your connection and try again.";
                break;
            default:
                errorMessage = `Login failed: ${error.message}`;
        }

        showError(errorMessage);
    }
});

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
}
