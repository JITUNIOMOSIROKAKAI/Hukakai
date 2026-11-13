let db,
    store,
    yarareta = false;
function dbload() {
    const request = window.indexedDB.open("sheets", 4);
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore("sheet", {
            keyPath: "title",
            multientry: true,
            unique: false
        });
    }
    request.onsuccess = (event) => {
        db = event.target.result;
        open(true);
    }
}
$(function () {
    dbload();
});
function reset() {
    indexedDB.deleteDatabase("sheets");
}
let saveindex = null;
async function check(handle) {
    saveindex = result.length;
}
function savesuru(isauto) {
    const transaction = db.transaction(["sheet"], "readwrite"),
        objectstore = transaction.objectStore("sheet");
    if (saveindex == null) {
        return;
    }
    objectstore.put({ "Index": saveindex, "title": data.title, "value": data });
    if (!isauto) alert("saved!");
}
async function getpath(handle) {
}
function parse() {
    const transaction = db.transaction(["sheet"], "readwrite"),
        objectstore = transaction.objectStore("sheet"),
        blacklist = [];
    let count = 0;
    all = objectstore.openCursor();
    console.log(objectstore);
    if (result.length) {
        for (let i = 0; i < result.length - 1; i++) {
            if (blacklist.includes(i)) {
                continue;
            }
            for (let j = i + 1; j < result.length; j++) {
                if (result[i].File.isSameEntry(result[j].File)) {
                    blacklist.push(j);
                }
            }
            objectstore.put({ File: result[i].File, ogg: result[i].ogg, "NAME": result[i].NAME, Index: count });
            count++;
        }
    }

}
let all, result = [];
function open(isload) {
    if (yarareta) {
        return
    }
    yarareta = true
    const transaction = db.transaction(["sheet"], "readwrite"),
        objectstore = transaction.objectStore("sheet");
    all = objectstore.openCursor();
    console.log(objectstore);
    if (!result.length) {
        all.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                result.push(cursor.value);
                cursor.continue();
            } else {

                if (!result.length) {
                    $("button#open")[0].disabled = true;
                    return;
                } else {
                    $("button#open")[0].disabled = false;
                }
                $("#filepick #buttons").remove();
                $("#filepick").append(`<div id="buttons" style="width:100%;height:calc(100% - 70px);overflow:scroll;"></div>`)
                result.forEach((element, ind) => {
                    $("#buttons").append(`<button onclick='showsheet(${ind},true);$("dialog")[0].close();'>${element.title}</button>`)
                });
                if (isload) {
                    return;
                }
            }
        }
        check();
    } else {
    }
}
async function toText() {
    const a = new Blob([JSON.stringify(data)], { type: "text/plain" });
    $(`<a href="${URL.createObjectURL(a)}" download="${data.title}.tjasheet" />`)[0].click();
}
function toText2() {
    let text = "", tukauyatu = Object.entries(data.hontai).map(val => { const x = val[1]; return x?.name == void 0 ? Object.entries(x).map(y => y[1]) : x }).flat(2).toReversed();
    for (const i of tukauyatu) {
        text += "///////////////////////////\n\n";
        text += `曲名:${i.name.slice(0,-4)}

点数:${i.point || ""}
お気に入り:${i.fav ? "◯" : ""}
感想:${i.kansou}

`
    }
    text += "///////////////////////////\n";
    const a = new Blob([text], { type: "text/plain" });
    $(`<a href="${URL.createObjectURL(a)}" download="${data.title}.txt" />`)[0].click();
}
async function fromTxT() {
    const reader = new FileReader();
    reader.onload = (e) => {
        data = new Function(`return ${e.target.result}`)();
        showsheet(data);
    }
    reader.readAsText($("input[type='file']")[0].files[0]);
}
$("input[type='file']").on("change",fromTxT);
class savedata {
    constructor(handle, ogg) {
        this.handle = handle;
        this.ogg = ogg;
        this.elem = $(`<button onclick="${this.open()}">${handle.name}</button>`);
    }
}
