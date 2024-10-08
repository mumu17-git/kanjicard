import {app} from './firebaseApp.js'
import { getFirestore, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"

const di =(id)=>{return document.getElementById(id)}
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
const cardsElem = di("table-cards");
var levelNumber = 1;
const levelStringList = [null,"1st","2nd","3rd","4th","5th","6th"];
const NumberOfCards = 52; // < 80
var AllKanjiList = [null];
var selectedCardsNumber = [0,0];
var NumberOfReversedCards = 0;
var playerData = [];
var gameData = null;
var maxplayer = 0;
var turn = 1;
const roomID = String(new Date().getTime());


window.onClick_Card = async(elem) =>{
//async function onClick_Card(elem) {
    var parentID = elem.getAttribute("id");
    var childID = parentID.replace("back","front");
    var parentElem = di(parentID);
    var childElem = di(childID);
    //if(selectedCardsNumber[NumberOfReversedCards] == 0) Restore_Card(di("card"+String(selectedCardsNumber[0])+"-front"));
    //selectedCardsNumber[0] = Number.parseInt(parentID.replace("card","").replace("-back",""));
    selectedCardsNumber[NumberOfReversedCards] = Number.parseInt(parentID.replace("card","").replace("-back",""));
    NumberOfReversedCards++;
    parentElem.classList.add("img-rev1");
    childElem.classList.add("img-rev2");
    parentElem.classList.add("img-hidden");
    await sleep(500);
    childElem.classList.remove("img-hidden");

    console.log(selectedCardsNumber);
    if(!selectedCardsNumber.includes(0)) twoCardsReversed();
}

async function Restore_Card(selectedCardNumber_tmp) {
    
    var elem = di("card"+selectedCardNumber_tmp+"-front");
    var childID = elem.getAttribute("id");
    var parentID = childID.replace("front","back");
    var parentElem = di(parentID);
    var childElem = di(childID);
    parentElem.classList.remove("img-rev1");
    childElem.classList.remove("img-rev2");
    parentElem.classList.remove("img-hidden");
    await sleep(500);
    childElem.style.display = "none";
    await sleep(1000);
    childElem.classList.add("img-hidden");
    childElem.style.display = "block";
    childElem.setAttribute("src",childElem.getAttribute("src").replace("new","common"));
    
}

async function Hidden_Card(selectedCardNumber_tmp) {
    
    var elem = di("card"+selectedCardNumber_tmp+"-front");
    var childID = elem.getAttribute("id");
    var parentID = childID.replace("front","back");
    var parentElem = di(parentID);
    var childElem = di(childID);
    parentElem.classList.add("img-hidden");
    childElem.classList.add("img-hidden");
    
}

function setNextTurn() {
    turn++;
    if(turn > playerData.length) turn = 1;
    db_save(roomID, "players","turn", turn);
}

async function twoCardsReversed() {
    var twoCardsKanjiList = ["",""];
    for(var i = 0;i < selectedCardsNumber.length;i++) {
        twoCardsKanjiList[i] = di("card"+selectedCardsNumber[i]+"-front").getAttribute("name");
    }

    if(twoCardsKanjiList[0] !== twoCardsKanjiList[1]) {
        for(var i = 0;i < selectedCardsNumber.length;i++) {
            setTimeout(Restore_Card,2500,selectedCardsNumber[i]);
        }
        await sleep(2500);
        setNextTurn();
    }else {
        for(var i = 0;i < playerData.length;i++) {
            if(playerData[i]["turn"] != turn) continue;
            playerData[i]["NumberOfGotCards"] = playerData[i]["NumberOfGotCards"] + 2;
            for(var j = 0;j < selectedCardsNumber.length;j++) {
                setTimeout(Hidden_Card,2500,selectedCardsNumber[j]);
            }
            await sleep(2500);
            console.log(playerData);
            db_save(roomID, playerData[i]["playerName"],"NumberOfGotCards", playerData[i]["NumberOfGotCards"]);
        }
    }

    selectedCardsNumber[0] = 0;
    selectedCardsNumber[1] = 0;
    NumberOfReversedCards = 0;
}

async function db_save(collection,document,key,value) {
    var db = getFirestore(app);
    var userRef = doc(db, collection, document);
    key = String(key);
    await updateDoc(userRef, {
        [key]:value
    });
}

function parseCsv(data) {
    AllKanjiList.push($.csv.toArrays(data));
}

const shuffleArray = (array) => {
    const cloneArray = [...array];
    const result = cloneArray.reduce((_,cur,idx) => {
      let rand = Math.floor(Math.random() * (idx + 1));
      cloneArray[idx] = cloneArray[rand]
      cloneArray[rand] = cur;
      return cloneArray
    })  
    return result;
}

function addCard(cardNumber,kanji,tr) {
    di("tableCards_tr"+String(tr)).insertAdjacentHTML("beforeend",'<td style="position: relative;"><img src="img/card_back/back.png" id="card'+String(cardNumber)+'-back" onclick="onClick_Card(this)" class="img-def"></img><img src="img/card_front/'+levelStringList[levelNumber]+'/new/'+String(kanji)+'.png" id="card'+String(cardNumber)+'-front" name="'+String(kanji)+'" class="img-front img-def img-hidden"></img></td>');
}

function placeCards(kanjiList) {
    for(var i = 0;i < kanjiList.length;i++) {
        if(i == 0||i % 13 == 0) {
            var elem = document.createElement("tr");
            elem.setAttribute("id","tableCards_tr"+String((i/13)+1));
            cardsElem.appendChild(elem);
        }
        addCard(i+1,kanjiList[i],Math.floor(i/13)+1);
    }
}

function getRandomCards() {
    return shuffleArray(AllKanjiList[levelNumber]);
}

function getAllKanji() {
    for(var l = 1;l < levelStringList.length;l++) {
        $.ajaxSetup({ async: false });
        $.get('./csv/'+levelStringList[l]+'.csv', parseCsv, 'text');
        $.ajaxSetup({ async: true });
    }
}


async function db_initPlayerData() {
    const db = getFirestore(app);
    const nameList = [];
    for(var i = 0;i < playerData.length;i++) 
        nameList.push(playerData[i]["playerName"]);
    await setDoc(doc(db, roomID, "players"), {
        turn: turn,
        maxplayer: maxplayer,
        level: levelNumber,
        nameList: nameList,
    });

    for(var i = 0;i < playerData.length;i++) {
        const list = ["NumberOfGotCards","turn"];
        await setDoc(doc(db, roomID, playerData[i]["playerName"]), {
            [String(list[0])]: playerData[i][list[0]],
            [String(list[1])]: playerData[i][list[1]]
        });
    }
    db_save("0","nowgameid", "collection", roomID);
}

function inputPlayerData() {
    var description = {
        "レベル": "ゲームのレベルを入力してください（１～６）",
        "人数": "ゲームをプレイする人数を入力してください",
        "名前": "人目のプレイヤーの名前を入力してください"
    };
    gameData = {
        "レベル": window.prompt(description["レベル"], "1"),
        "人数": window.prompt(description["人数"], "4"),
    };

    if(1 <= parseInt(gameData["レベル"]) && parseInt(gameData["レベル"]) <= 6) levelNumber = parseInt(gameData["レベル"]);
    maxplayer = parseInt(gameData["人数"]);
    for(var i = 0;i < parseInt(gameData["人数"]);i++) {
        playerData.push({"playerName": window.prompt(String(i+1)+description["名前"],"player"+String(i+1)),"NumberOfGotCards": 0, "turn": i+1});
    }
}


function setup() {
    inputPlayerData();
    db_initPlayerData();
    getAllKanji();
    const shuffledKanjiList = getRandomCards();
    const selectedKanjiList = shuffledKanjiList.slice(0,Math.floor(NumberOfCards/2));
    const shuffledSelectedKanjiList = shuffleArray([...selectedKanjiList,...selectedKanjiList]);
    placeCards(shuffledSelectedKanjiList);
    console.log(shuffledSelectedKanjiList);
}

setup();