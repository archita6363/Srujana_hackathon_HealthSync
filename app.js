// Import the registration function from our handler file
import { registerUser } from './signup-handler.js';

// --- Element Selectors ---
const roleSelection = document.getElementById('roleSelection');
const patientFormContainer = document.getElementById('patientForm');
const doctorFormContainer = document.getElementById('doctorForm');
const doctorStep1 = document.getElementById('doctorStep1');
const doctorStep2 = document.getElementById('doctorStep2');

// Buttons
const selectPatientBtn = document.getElementById('selectPatientBtn');
const selectDoctorBtn = document.getElementById('selectDoctorBtn');
const doctorNextBtn = document.getElementById('doctorNextBtn');

// --- ADD THIS CODE TO YOUR APP.JS FILE ---

// Back Buttons
const patientBackBtn = document.getElementById('patientBackBtn');
const doctorBackBtn1 = document.getElementById('doctorBackBtn1');
const doctorBackBtn2 = document.getElementById('doctorBackBtn2');

// --- UI Logic: Back Button Event Listeners ---

function showRoleSelection() {
    roleSelection.classList.remove('hidden');
    patientFormContainer.classList.add('hidden');
    doctorFormContainer.classList.add('hidden');
}

function showDoctorStep1() {
    doctorStep1.classList.remove('hidden');
    doctorStep2.classList.add('hidden');
}

patientBackBtn.addEventListener('click', showRoleSelection);
doctorBackBtn1.addEventListener('click', showRoleSelection);
doctorBackBtn2.addEventListener('click', showDoctorStep1);

// --- END OF NEW CODE ---

// Forms
const patientForm = patientFormContainer.querySelector('form');
const doctorForm = document.getElementById('doctorStep2').querySelector('form');

// --- State Management ---
let selectedRole = ''; // To keep track of whether 'patient' or 'doctor' is chosen

// --- UI Logic: Event Listeners ---

// Show Patient Form
selectPatientBtn.addEventListener('click', () => {
    selectedRole = 'patient';
    roleSelection.classList.add('hidden');
    patientFormContainer.classList.remove('hidden');
});

// Show Doctor Form
selectDoctorBtn.addEventListener('click', () => {
    selectedRole = 'doctor';
    roleSelection.classList.add('hidden');
    doctorFormContainer.classList.remove('hidden');
    doctorStep1.classList.remove('hidden');
    doctorStep2.classList.add('hidden');
});

// Navigate to Doctor Step 2
doctorNextBtn.addEventListener('click', () => {
    doctorStep1.classList.add('hidden');
    doctorStep2.classList.remove('hidden');
});


// --- Form Submission Logic ---

// Listen for the patient form submission
patientForm.addEventListener('submit', (event) => {
    handleSubmit(event, 'patient');
});

// Listen for the final doctor form submission
doctorForm.addEventListener('submit', (event) => {
    handleSubmit(event, 'doctor');
});

/**
 * Main function to handle form submissions for both roles.
 * @param {Event} event - The form submission event.
 * @param {string} role - The role of the user ('patient' or 'doctor').
 */
async function handleSubmit(event, role) {
    event.preventDefault(); // Prevent the page from reloading

    let email, password, userProfile;

    // 1. Collect form data based on the role
    if (role === 'patient') {
        email = document.getElementById('p-username').value;
        password = document.getElementById('p-password').value;
        userProfile = {
            name: document.getElementById('p-name').value,
            country: document.getElementById('p-country').value,
            phone: document.getElementById('p-phone').value,
            email: email,
            role: 'patient'
        };
    } else if (role === 'doctor') {
        // Collect data from both steps of the doctor form
        email = document.getElementById('d-username').value;
        password = document.getElementById('d-password').value;
        userProfile = {
            name: document.getElementById('d-name').value,
            country: document.getElementById('d-country').value,
            phone: document.getElementById('d-phone').value,
            hospital: document.getElementById('d-hospital').value,
            specialization: document.getElementById('d-specialization').value,
            email: email,
            role: 'doctor'
        };
    } else {
        console.error("Invalid role specified.");
        return;
    }

    // 2. Call the registration function from the handler
    const result = await registerUser(email, password, userProfile);

    // 3. Handle the result
    if (result.success) {
        alert("Registration successful!");
        
        // --- MODIFICATION HERE ---
        if (role === 'patient') {
            // Redirect patient to the onboarding form
            window.location.href = "patient-onboarding.html";
        } else {
            // Keep the doctor redirection as is
            window.location.href = "login.html";
        }
    } else {
        // Show a more user-friendly error
        alert("Registration failed: " + result.error);
    }
}

// NOTE: This part is for the Google Sign-in functionality.
// It remains the same