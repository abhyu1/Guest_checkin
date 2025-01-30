// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Admin Login
function adminLogin() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Show Admin Controls
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("adminControls").style.display = "block";
            loadGuestList();
            loadPendingCheckIns();
        })
        .catch(error => alert(error.message));
}

// Admin Logout
function adminLogout() {
    auth.signOut().then(() => {
        // Show Admin Login Section
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("adminControls").style.display = "none";
    });
}

// Add Guest
function addGuest() {
    const guestName = document.getElementById("guestName").value;
    if (guestName) {
        database.ref("guests/" + guestName).set({ checkedIn: false });
        document.getElementById("guestName").value = "";
        loadGuestList();
    }
}

// Load Guests into Dropdown
function loadGuestList() {
    database.ref("guests").once("value", snapshot => {
        const guestSelect = document.getElementById("guestSelect");
        guestSelect.innerHTML = "";
        snapshot.forEach(child => {
            let option = document.createElement("option");
            option.textContent = child.key;
            guestSelect.appendChild(option);
        });
    });
}

// Request Check-in
function requestCheckIn() {
    const guestName = document.getElementById("guestSelect").value;
    if (guestName) {
        database.ref("checkInRequests/" + guestName).set(true);
    }
}

// Load Pending Check-in Requests
function loadPendingCheckIns() {
    database.ref("checkInRequests").on("value", snapshot => {
        const pendingList = document.getElementById("pendingCheckInList");
        pendingList.innerHTML = "";
        snapshot.forEach(child => {
            let listItem = document.createElement("li");
            listItem.textContent = child.key;
            let approveBtn = document.createElement("button");
            approveBtn.textContent = "Approve";
            approveBtn.onclick = () => approveCheckIn(child.key);
            listItem.appendChild(approveBtn);
            pendingList.appendChild(listItem);
        });
    });
}

// Approve Check-in
function approveCheckIn(guestName) {
    database.ref("guests/" + guestName).update({ checkedIn: true });
    database.ref("checkInRequests/" + guestName).remove();
    loadGuestList();
    loadPendingCheckIns();
}

// Show Admin Container Once Logged In
auth.onAuthStateChanged(user => {
    if (user) {
        // Show admin panel after successful login
        document.getElementById("adminContainer").style.display = "block";
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminControls").style.display = "block";
    } else {
        // Hide admin panel and show login section
        document.getElementById("adminContainer").style.display = "none";
    }
});
