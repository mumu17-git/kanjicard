const $=(id)=>{return document.getElementById(id)}
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function onClick_Card(elem) {
    var parentID = elem.getAttribute("id");
    var childID = parentID.replace("back","front");
    var parentElem = $(parentID);
    var childElem = $(childID);
    parentElem.classList.add("img-rev1");
    childElem.classList.add("img-rev2");
    parentElem.classList.add("img-hidden");
    await sleep(500);
    childElem.classList.remove("img-hidden");
    
}