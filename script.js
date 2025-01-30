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
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Show admin panel after successful login
      console.log("Admin login successful!");  // Check if login is successful
      document.getElementById("adminContainer").style.display = "block";  
      loadGuestList();
      loadPendingCheckIns();
    })
    .catch(error => {
      console.log(error.message);  // Log error message for debugging
      alert(error.message);
    });
}
// Admin Logout
function adminLogout() {
  signOut(auth).then(() => {
    document.getElementById("adminContainer").style.display = "none";
  });
}

// Add Guest
function addGuest() {
  const guestName = document.getElementById("guestName").value;
  if (guestName) {
    set(ref(database, "guests/" + guestName), { checkedIn: false });
    document.getElementById("guestName").value = "";
    loadGuestList();
  }
}

// Load Guests into Dropdown
function loadGuestList() {
  const guestSelect = document.getElementById("guestSelect");
  get(ref(database, "guests"))
    .then((snapshot) => {
      guestSelect.innerHTML = "";
      snapshot.forEach(childSnapshot => {
        let option = document.createElement("option");
        option.textContent = childSnapshot.key;
        guestSelect.appendChild(option);
      });
    });
}

// Request Check-in
function requestCheckIn() {
  const guestName = document.getElementById("guestSelect").value;
  if (guestName) {
    set(ref(database, "checkInRequests/" + guestName), true);
  }
}

// Load Pending Check-in Requests
function loadPendingCheckIns() {
  const pendingList = document.getElementById("pendingCheckInList");
  onValue(ref(database, "checkInRequests"), (snapshot) => {
    pendingList.innerHTML = "";
    snapshot.forEach(childSnapshot => {
      let listItem = document.createElement("li");
      listItem.textContent = childSnapshot.key;
      let approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveCheckIn(childSnapshot.key);
      listItem.appendChild(approveBtn);
      pendingList.appendChild(listItem);
    });
  });
}

// Approve Check-in
function approveCheckIn(guestName) {
  update(ref(database, "guests/" + guestName), { checkedIn: true });
  remove(ref(database, "checkInRequests/" + guestName));
  loadGuestList();
  loadPendingCheckIns();
}
