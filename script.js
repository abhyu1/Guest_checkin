// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, get, child, onValue, update, remove } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB48zrln_P9SEIngjf58Yopkpstsac6uFM",
  authDomain: "guest-list-8ee99.firebaseapp.com",
  projectId: "guest-list-8ee99",
  storageBucket: "guest-list-8ee99.firebasestorage.app",
  messagingSenderId: "907423161396",
  appId: "1:907423161396:web:52b2733d12a89a4cdfbe61",
  measurementId: "G-2199LVL65J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Admin Login
function adminLogin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  console.log("Attempting to log in with email:", email);  // Debugging log

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("Login successful");  // If login is successful, this will show
      document.getElementById("loginContainer").style.display = "none";  // Hide login form
      document.getElementById("adminContainer").style.display = "block";  // Show admin panel
      loadGuestList();  // Load the guest list after login
    })
    .catch(error => {
      console.log("Login error:", error.message);  // Log error if login fails
      alert(error.message);  // Show alert for errors
    });
}


// Admin Logout
function adminLogout() {
  signOut(auth).then(() => {
    document.getElementById("loginContainer").style.display = "block"; // Show login form
    document.getElementById("adminContainer").style.display = "none"; // Hide admin panel
  });
}

// Add Guest
function addGuest() {
  const guestName = document.getElementById("guestName").value;
  if (guestName) {
    set(ref(database, "guests/" + guestName), {
      checkedIn: false
    });
    document.getElementById("guestName").value = ""; // Clear input field
    loadGuestList(); // Reload the guest list
  }
}

// Load Guests into List
function loadGuestList() {
  const guestList = document.getElementById("guestList");
  get(ref(database, "guests")).then(snapshot => {
    guestList.innerHTML = ""; // Clear current list
    snapshot.forEach(childSnapshot => {
      const guestName = childSnapshot.key;
      const listItem = document.createElement("li");
      listItem.textContent = guestName;
      guestList.appendChild(listItem);
    });
  });
}

// Load Pending Check-ins (if any)
function loadPendingCheckIns() {
  const pendingList = document.getElementById("pendingCheckInList");
  onValue(ref(database, "checkInRequests"), snapshot => {
    pendingList.innerHTML = ""; // Clear current pending list
    snapshot.forEach(childSnapshot => {
      const guestName = childSnapshot.key;
      const listItem = document.createElement("li");
      listItem.textContent = guestName;
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveCheckIn(guestName);
      listItem.appendChild(approveBtn);
      pendingList.appendChild(listItem);
    });
  });
}

// Approve Check-in
function approveCheckIn(guestName) {
  set(ref(database, "guests/" + guestName), {
    checkedIn: true
  });
  // Remove from pending check-ins
  set(ref(database, "checkInRequests/" + guestName), null);
  loadGuestList();
  loadPendingCheckIns();
}
