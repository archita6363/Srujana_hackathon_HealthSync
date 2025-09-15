/**
 * @file doctor-dashboard-handler.js
 * @description Handles data population and core logic for the doctor's dashboard.
 */

// Import necessary functions from the Firebase v10 SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration from your login page
const firebaseConfig = {
    apiKey: "AIzaSyCL1crs6TFPLZLZR607kBU1UHkYrGaCxmU",
    authDomain: "healthsync-7263e.firebaseapp.com",
    projectId: "healthsync-7263e",
    storageBucket: "healthsync-7263e.appspot.com",
    messagingSenderId: "769113656753",
    appId: "1:769113656753:web:f80edc9673615912d44190",
};

// Initialize Firebase and its services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =================================================================
// AUTHENTICATION CHECK & DATA LOADING
// =================================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, proceed to load the dashboard with their data
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Initialize all dashboard components with the user's specific data
                initializeDashboard(userData);
            } else {
                console.error("User document not found in Firestore!");
                alert("Could not find your user profile. Logging out.");
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("An error occurred while fetching your data.");
            window.location.href = 'login.html';
        }
    } else {
        // No user is signed in. Redirect them to the login page.
        console.log("No user signed in, redirecting to login.");
        window.location.href = 'login.html';
    }
});

/**
 * Main function to initialize all dashboard components after user data is fetched.
 * @param {object} userData - The logged-in user's data from Firestore.
 */
function initializeDashboard(userData) {
    populateDoctorInfo(userData);
    setupEventListeners();
    fetchAndDisplayPatients();
}

/**
 * Populates the profile section with dynamic data from the logged-in user.
 * @param {object} user - The user's data object from Firestore.
 */
function populateDoctorInfo(user) {
    // Dynamically create a short name like "Dr. Smith" from a full name "John Smith"
    const shortName = user.fullName ? `Dr. ${user.fullName.split(' ').pop()}` : 'Doctor';

    document.getElementById('doctorNameSidebar').textContent = shortName;
    document.getElementById('profileName').textContent = user.fullName || 'N/A';
    document.getElementById('profileEmail').textContent = user.email || 'N/A';
    document.getElementById('profilePhone').textContent = user.phone || 'Not Provided';
    document.getElementById('profileCountry').textContent = user.country || 'Not Provided';
    document.getElementById('profileHospital').textContent = user.hospital || 'Not Provided';
    document.getElementById('profileSpecialization').textContent = user.specialization || 'Not Provided';
}


/**
 * Handles navigation and the corrected logout functionality.
 */
function setupEventListeners() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const mainTitle = document.getElementById('main-title');
    const logoutBtn = document.getElementById('logoutBtn');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.section;

            sidebarItems.forEach(btn => btn.classList.remove('bg-[#283857]'));
            item.classList.add('bg-[#283857]');

            sections.forEach(section => {
                section.id === targetSectionId ? section.classList.remove('hidden') : section.classList.add('hidden');
            });

            mainTitle.textContent = item.querySelector('span').textContent;
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout Error:', error);
                alert('Failed to log out. Please try again.');
            }
        });
    }
}

/**
 * Fetches patient data using the modern Firestore SDK.
 */
async function fetchAndDisplayPatients() {
    const tableBody = document.getElementById('patient-list-body');
    if (!tableBody) return;

    try {
        const snapshot = await getDocs(collection(db, "patients"));
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center px-6 py-4 text-gray-400">No patients found.</td></tr>`;
            return;
        }

        snapshot.forEach(doc => {
            const patient = doc.data();
            const row = document.createElement('tr');
            row.className = "border-b border-gray-700 hover:bg-[#3a4c6e]";
            
            row.innerHTML = `
                <td class="px-6 py-4">${patient.name || 'N/A'}</td>
                <td class="px-6 py-4">${patient.age || 'N/A'}</td>
                <td class="px-6 py-4">${patient.gender || 'N/A'}</td>
                <td class="px-6 py-4">${patient.condition || 'N/A'}</td>
                <td class="px-6 py-4 text-center">
                    <button class="text-blue-400 hover:underline" data-id="${doc.id}">View Profile</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching patients: ", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center px-6 py-4 text-red-400">Error fetching data.</td></tr>`;
    }
}