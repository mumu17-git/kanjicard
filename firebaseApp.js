import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
        
const firebaseConfig = {
    apiKey: "AIzaSyDtkso4sa0vR9Q_C2MBU_Q-w6Lr01Uktp4",
    authDomain: "kanjicard-1baef.firebaseapp.com",
    projectId: "kanjicard-1baef",
    storageBucket: "kanjicard-1baef.appspot.com",
    messagingSenderId: "781414108474",
    appId: "1:781414108474:web:f88f0bad4e6302f7309403"
};

var app = initializeApp(firebaseConfig);

export {app};