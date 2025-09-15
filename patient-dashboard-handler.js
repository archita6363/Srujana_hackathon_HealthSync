import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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

const categoryButtons = document.querySelectorAll('.category-btn');
const categoryContents = document.querySelectorAll('.category-content');
const themeToggleBtn = document.getElementById('theme-toggle');
const logoutBtn = document.getElementById('logoutBtn');
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 18a8 8 0 100-16 8 8 0 000 16zM12 4a8 8 0 00-6.928 3.928A8.01 8.01 0 0112 4z"/></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

async function loadPatientData(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const patientDataRef = doc(db, "patientData", user.uid);

        const [userDocSnap, patientDataSnap] = await Promise.all([getDoc(userDocRef), getDoc(patientDataRef)]);

        if (!userDocSnap.exists() || !patientDataSnap.exists()) {
            window.location.href = 'patient-onboarding.html';
            return;
        }

        const userData = userDocSnap.data();
        const patientData = patientDataSnap.data();
        populateDashboard(userData, patientData);

    } catch (error) {
        console.error("Error loading patient data:", error);
    }
}

function populateDashboard(userData, patientData) {
    const patientName = userData.name || 'Patient';
    const patientId = `P-${userData.uid.substring(0, 6).toUpperCase()}`;
    const getInitials = (name) => (name.split(' ').map(n => n[0]).join('')).substring(0,2);
    const getAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // --- Sidebar and Header ---
    setText('patientNameSidebar', patientName);
    setText('patientNameHeader', `Welcome back, ${patientName}!`);
    setText('welcomeMessage', `Here's your health overview for today.`);
    setText('patientInitials', getInitials(patientName).toUpperCase());
    
    // --- Dashboard ---
    const appointmentsArray = splitString(patientData.appointments);
    setText('appointmentsCount', appointmentsArray.length);
    setText('medicationsCount', patientData.medications?.length || 0);
    populateList('recentActivity', [patientData.vitals, patientData.testResults], 'No recent activity.');

    // --- My Profile ---
    setText('profileName', patientName);
    setText('profilePatientId', patientId);
    setText('profileDob', patientData.dob || 'N/A');
    setText('profilePhone', userData.phone || 'N/A');

    // --- Health Summary ---
    setText('summaryPatientAge', getAge(patientData.dob));
    setText('summaryPatientId', patientId);
    populateListAsUL('summaryDiagnoses', [patientData.disease], 'No diagnoses listed.');
    const vitalsSummaryData = splitString(patientData.vitals);
    populateListAsUL('summaryVitals', vitalsSummaryData, 'No recent vitals recorded.');
    setText('summaryLabResults', patientData.testResults || 'No recent test results.');


    // --- Medications ---
    populateList('medicationsList', patientData.medications, 'No medications listed.');

    // --- Vitals & Tracking ---
    const vitalsLogData = splitString(patientData.vitals);
    const vitalsContainer = document.getElementById('vitalsLog');
    if(vitalsContainer) {
        if(vitalsLogData.length > 0 && vitalsLogData[0]) {
            const vitalsHtml = vitalsLogData.map(vital => {
                let [key, ...value] = vital.split(':');
                value = value.join(':').trim();
                let color = 'text-green-600 dark:text-green-400'; // default good
                if(key && value) {
                     if(key.toLowerCase().includes('pressure') && (parseInt(value.split('/')[0]) > 130 || parseInt(value.split('/')[1]) > 85)) {
                        color = 'text-orange-600 dark:text-orange-400'; // high
                    }
                    if(key.toLowerCase().includes('glucose') && parseInt(value) > 125) {
                        color = 'text-orange-600 dark:text-orange-400'; // high
                    }
                }

                return `<div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-100">${key || 'Vital'}</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Reading of <span class="font-medium ${color}">${value || 'N/A'}</span></p>
                        </div>`;
            }).join('');
            vitalsContainer.innerHTML = vitalsHtml;
        } else {
            vitalsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400">No recent vitals recorded.</p>`;
        }
    }


    // --- Test Results ---
    populateList('testResultsList', splitString(patientData.testResults), 'No recent test results.');

    // --- Emergency ---
    setText('emergencyBloodGroup', patientData.bloodType || 'N/A');
    setText('emergencyAllergies', patientData.allergies?.join(', ') || 'None');
    setText('emergencyConditions', patientData.disease || 'N/A');
}

// --- Helper Functions ---
const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

const splitString = (str) => (str ? str.split(',').map(s => s.trim()).filter(Boolean) : []);

function populateList(elementId, items, emptyMessage) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    if (items && items.length > 0 && items[0]) {
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg';
            div.textContent = item;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = `<p class="text-gray-500 dark:text-gray-400">${emptyMessage}</p>`;
    }
}

function populateListAsUL(elementId, items, emptyMessage) {
    const list = document.getElementById(elementId);
    if (!list) return;
    list.innerHTML = '';
    if (items && items.length > 0 && items[0]) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = emptyMessage;
        list.appendChild(li);
    }
}

// --- Event Listeners & Initializers ---
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryContents.forEach(content => content.classList.add('hidden'));
        categoryButtons.forEach(btn => btn.classList.remove('active', 'bg-sky-100', 'dark:bg-sky-800'));
        const targetId = button.dataset.target;
        document.getElementById(targetId).classList.remove('hidden');
        button.classList.add('active', 'bg-sky-100', 'dark:bg-sky-800');
    });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Sign out error:", error);
        alert("Could not sign out. Please try again.");
    });
});

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    updateThemeIcon();
});

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark');
    themeToggleBtn.innerHTML = isDark ? sunIcon : moonIcon;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
    }
    updateThemeIcon();
    onAuthStateChanged(auth, user => {
        if (user) loadPatientData(user);
        else window.location.href = 'login.html';
    });
    document.querySelector('[data-target="dashboardContent"]').click();
});

