// Import the necessary Firebase services from your configuration file
import { auth, db } from './firebase-config.js';

// Import the specific functions we need from the Firebase SDKs
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * Handles the user registration process with Firebase.
 * @param {string} email - The user's email for authentication.
 * @param {string} password - The user's password for authentication.
 * @param {object} userProfile - An object containing additional user details to save.
 * @returns {object} - An object indicating success or failure.
 */
export async function registerUser(email, password, userProfile) {
    try {
        // Step 1: Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Firebase Auth user created with UID:", user.uid);

        // Step 2: Save the complete user profile to the Firestore database
        // We use the user's UID as the document ID for easy lookup.
        await setDoc(doc(db, "users", user.uid), {
            ...userProfile, // Spread the profile details (name, role, etc.)
            uid: user.uid, // Store the UID in the document as well
            createdAt: new Date() // Add a timestamp for when the user signed up
        });
        
        console.log("User profile saved to Firestore.");

        // Return a success status
        return { success: true, user: user };

    } catch (error) {
        console.error("Error during Firebase registration:", error);
        
        // Return a failure status with the error message
        return { success: false, error: error.message };
    }
}