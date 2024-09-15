import {app} from '../firebaseApp.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"

const di =(id)=>{return document.getElementById(id)}
var nowgameid = null;
var playerData = null;
var gameData = null;
var first = true;

function reloadPoint(pd) {
    
    for(var i = 0;i < pd.length;i++) {
        di("player"+String(i+1)+"_name").textContent = gameData["nameList"][i];
        di("player"+String(i+1)+"_point").textContent = String(pd[i]["NumberOfGotCards"]);
        if(pd[i]["turn"] == gameData["turn"]) di("playerTurn").textContent = "　　　　　"+gameData["nameList"][i]+"のターンです。"
    }

    
    setTimeout(db_loadInit,6000);
}

function initScreen(i) {
    var num1 = Math.floor((i)/3)+1;
    var num2 = (i) % 3;
    if(num2 == 0) num2 = 3;

    di("bm-td"+String(num1)+"-"+String(num2)).insertAdjacentHTML("beforeend",'<div class="box-010"><span id="player'+String(i+1)+'_name"></span><p>取ったカードの枚数　　<strong id="player'+String(i+1)+'_point"></strong></p></div>')
}

async function db_load() {
    var db = getFirestore(app);
    playerData = [];
    for(var i = 0;i < gameData["maxplayer"];i++) {
        const userRef = doc(db, nowgameid, gameData["nameList"][i]);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            playerData.push(docSnap.data());
            if(first) {
                initScreen(i);
            }
            if(i == gameData["maxplayer"]-1) reloadPoint(playerData);
        }
    }
    first = false;
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