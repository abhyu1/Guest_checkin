import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB48zrln_P9SEIngjf58Yopkpstsac6uFM",
    authDomain: "guest-list-8ee99.firebaseapp.com",
    projectId: "guest-list-8ee99",
    storageBucket: "guest-list-8ee99.firebasestorage.app",
    messagingSenderId: "907423161396",
    appId: "1:907423161396:web:52b2733d12a89a4cdfbe61",
    measurementId: "G-2199LVL65J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Admin Login
window.adminLogin = function () {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById("adminContainer").style.display = "block";
            loadGuestList();
            loadPendingCheckIns();
        })
        .catch(error => alert(error.message));
};

// Admin Logout
window.adminLogout = function () {
    signOut(auth).then(() => {
        document.getElementById("adminContainer").style.display = "none";
    });
};

// Add Guest
window.addGuest = function () {
    const guestName = document.getElementById("guestName").value;
    if (guestName) {
        set(ref(database, "guests/" + guestName), { checkedIn: false });
        document.getElementById("guestName").value = "";
        loadGuestList();
    }
};

// Load Guests into Dropdown
window.loadGuestList = function () {
    const guestSelect = document.getElementById("guestSelect");
    get(ref(database, "guests"))
        .then(snapshot => {
            guestSelect.innerHTML = "";
            snapshot.forEach(child => {
                let option = document.createElement("option");
                option.textContent = child.key;
                guestSelect.appendChild(option);
            });
        });
};

// Request Check-in
window.requestCheckIn = function () {
    const guestName = document.getElementById("guestSelect").value;
    if (guestName) {
        set(ref(database, "checkInRequests/" + guestName), true);
    }
};

// Load Pending Check-in Requests
window.loadPendingCheckIns = function () {
    onValue(ref(database, "checkInRequests"), snapshot => {
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
};

// Approve Check-in
window.approveCheckIn = function (guestName) {
    set(ref(database, "guests/" + guestName), { checkedIn: true });
    set(ref(database, "checkInRequests/" + guestName), null);
    loadGuestList();
    loadPendingCheckIns();
};
