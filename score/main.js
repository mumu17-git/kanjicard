import {app} from '../firebaseApp.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"

var nowgameid = null;
var playerData = [];
var gameData = null;

async function db_load() {
    var db = getFirestore(app);
    console.log(gameData);
    for(var i = 0;i < gameData["maxplayer"];i++) {
        const userRef = doc(db, nowgameid, "player"+i);
        const docSnap = await getDoc(userRef);
        playerData.push(docSnap.data());
    }
}

async function db_loadInit() {
    var db = getFirestore(app);
    const userRef = doc(db, "0", "nowgameid");
    const docSnap = await getDoc(userRef);
    var data = null;
    if (docSnap.exists()) {
        data = docSnap.data();
        console.log(data["collection"]);
        nowgameid = String(data["collection"]);
        const userRef2 = doc(db, nowgameid, "players");
        const docSnap2 = await getDoc(userRef2);
        if (docSnap2.exists()) gameData = docSnap2.data();
        db_load();
    }
}

function setup() {
    db_loadInit();
}


setup();