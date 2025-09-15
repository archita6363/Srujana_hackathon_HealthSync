// This code would be in a file like 'signup.js'

import { db } from './firebase-config.js'; // Import the database connection
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get the form from your signup.html
const signupForm = document.getElementById('signup-form');

// Listen for when the user submits the form
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the page from reloading

  // Get the values the user typed in
  const name = signupForm.name.value;
  const email = signupForm.email.value;

  try {
    // Send the data to a 'users' collection in Firestore
    const docRef = await addDoc(collection(db, "users"), {
      userName: name,
      userEmail: email,
      signupDate: new Date() // Add a timestamp
    });
    console.log("Document written with ID: ", docRef.id);
    alert("Signup successful!");
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error signing up.");
  }
});