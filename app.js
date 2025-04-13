// Firebase config - استبدله بمعلومات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBoPJbx5v6EkOqxOJkbhzHqIJdAByh79Rg",
  authDomain: "hhhhhh-d4fb8.firebaseapp.com",
  projectId: "hhhhhh-d4fb8",
  storageBucket: "hhhhhh-d4fb8.appspot.com",
  messagingSenderId: "24512338206",
  appId: "1:24512338206:web:dfe045db59bd3434a2110f",
  measurementId: "G-HD4R7GNQ5H"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("password-form");
const userInfo = document.getElementById("user-info");
const list = document.getElementById("password-list");

let currentUser;

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = "none";
    form.style.display = "block";
    userInfo.style.display = "block";
    loadPasswords();
  } else {
    currentUser = null;
    loginBtn.style.display = "block";
    form.style.display = "none";
    userInfo.style.display = "none";
    list.innerHTML = "";
  }
});

form.onsubmit = async (e) => {
  e.preventDefault();
  const site = form.site.value;
  const email = form.email.value;
  const password = form.password.value;

  await db.collection("passwords").add({
    uid: currentUser.uid,
    site,
    email,
    password
  });

  form.reset();
  loadPasswords();
};

async function loadPasswords() {
  const query = await db.collection("passwords").where("uid", "==", currentUser.uid).get();
  list.innerHTML = "";

  query.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "bg-gray-800 p-4 rounded space-y-2";

    div.innerHTML = `
      <div>
        <p><strong>${data.site}</strong></p>
        <p>${data.email}</p>
        <p id="pass-${doc.id}" class="text-green-400">******</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button onclick="togglePass('${doc.id}', '${data.password}')" class="bg-gray-700 px-2 py-1 rounded text-sm">Show</button>
        <button onclick="copyPass('${data.password}')" class="bg-gray-600 px-2 py-1 rounded text-sm">Copy</button>
        <button onclick="editPass('${doc.id}', '${data.site}', '${data.email}', '${data.password}')" class="bg-yellow-500 px-2 py-1 rounded text-sm">Edit</button>
        <button onclick="deletePass('${doc.id}')" class="bg-red-600 px-2 py-1 rounded text-sm">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function togglePass(id, realPass) {
  const p = document.getElementById(`pass-${id}`);
  if (p.innerText === "******") {
    p.innerText = realPass;
  } else {
    p.innerText = "******";
  }
}

function copyPass(pass) {
  navigator.clipboard.writeText(pass).then(() => alert("Password copied!"));
}

function deletePass(id) {
  if (confirm("Are you sure you want to delete this password?")) {
    db.collection("passwords").doc(id).delete().then(() => loadPasswords());
  }
}

function editPass(id, oldSite, oldEmail, oldPass) {
  const site = prompt("Enter new site:", oldSite);
  const email = prompt("Enter new email:", oldEmail);
  const password = prompt("Enter new password:", oldPass);

  if (site && email && password) {
    db.collection("passwords").doc(id).update({
      site,
      email,
      password
    }).then(() => loadPasswords());
  }
}
