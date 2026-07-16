async function opendirectory(directory) {
    if (directory == null) {
        const dirhandle = await showDirectoryPicker();
        data.title = dirhandle.name;
        const values = await Array.fromAsync(await dirhandle.values());
        return values;
    } else {
        const values = await Array.fromAsync(await directory.values());
        return values;
    }
}
async function createsheet() {
    const directories = await opendirectory();
    await readdirectory(directories);
    showsheet(data);
}
function checkhyouka(tukauyatu,heikin){
	const tukauyatu2=[...$("#pluginpopover input[type='number']")].map(x=>x.value),
		tensuukaburi={};
	tukauyatu.forEach(x=>(tensuukaburi[x.tensuu]==void 0?tensuukaburi[x.tensuu]=0:tensuukaburi[x.tensuu]++));
	const damelist=[tukauyatu2[2]>0?Object.values(tensuukaburi).filter(x=>tukauyatu[2]<x):[],Math.abs(heikin-70)<=10];
	console.log(damelist);
}
async function kaisouyomitori(directories,count=0){
	let count2=0;
	for(const directory of directories){
		if(directory.kind=="directory"){
			kaisouyomitori(directory,count+1);
		}else if(directory.name.slice(-4)==".tja"){
			count2++;
			if(count2>1){
				data.kaisou[count]=true;
			}
		}
	}
}
async function readdirectory(directories, parent,count=0) {
    const parents = [];
    for (const directory of directories) {
        if (directory.kind == "directory") {
            if (parent == null) {
                data.hontai = await readdirectory(await opendirectory(directories), {},count+1);
            } else {
				console.log(directory.name);
                const kaesareru = await readdirectory(await opendirectory(directory), {},count+1);
                if (kaesareru?.length) {
                    parent[directory.name]={};
                    kaesareru.forEach((x) => { parent[directory.name][x.name.slice(0, -4)] = x; });
					data.kaisou[count]=true;
                }else if(data.kaisou[count]==true){
                    parent[directory.name]={};
					parent[directory.name][kaesareru.name.slice(0, -4)] = kaesareru;
				} else {
                    parent[directory.name] = kaesareru;
                }
            }
        } else {
            if (directory.name.slice(-4) == ".tja") {
                parent = new sheet(directory.name, false);
                parents.push(new sheet(directory.name, false));
            }
        }
    }
    if (parent != null) {
        return parents.length <= 1 ? parent : parents;
    }

}
let data = {
    isteam: true,
    average: null,
    hensa: null,
    hontai: {
    },
	kaisou:[false,false,false],
    openedindex: null,
};
class sheet {
    constructor(name, iskibou) {
        this.name = name;
        this.name2 = "";
        this.notgroup = false;
        this.fav = false;
        this.point = null;
        this.checked = false;
        this.parent = null;
        this.kansou = "";
        this.kansoukibou = iskibou;
    }
    check() {

    }
}
function showsheet(val, ind) {
    !ind ? data = val : data = result[val].value;
    function toElement(i, parent, parentobj, path = "") {
        if (typeof parentobj == "object" && parentobj?.name == undefined) {
            let childobj = $(`<label for="${i}" class="child"><input type="checkbox" id="${i}">${i}</label>`);
            parent.append(childobj);

            const keys = Object.keys(parentobj[i]).toSorted((a, b) => a.localeCompare(b, "ja"));
            path += `["${i}"]`;
            for (const j of keys) {
                toElement(j, childobj, parentobj[i], path);
            }
        } else {
            parent.attr("name", parentobj.name.slice(0, -4));
            parent.on("click", showhyouka.bind(null, parentobj, path));
            data.openedindex || (data.openedindex = path.replace(/'/g, "\\'"));
        }
        return parent;
    }
    const keys = Object.keys(data.hontai).toSorted((a, b) => a.localeCompare(b, "ja"));
    $("div#hyouka")[0].textContent = "";
    for (const i of keys) {
        toElement(i, $("div#hyouka"), data.hontai);
    }
    showhyouka(new Function(`return data.hontai${data.openedindex}`)(), data.openedindex,true);
}
function showhyouka(data2, path,isfirst) {
    const a = new Function(`data.hontai${data.openedindex}["kansou"]=\`${$("#hyouka2 textarea")[0].value}\`;`);
    !isfirst?a():void 0;
    data.openedindex = path.replace(/'/g, "\\'");
    autosave();
    listupdate();
    $(`#hyouka2 input[type="checkbox"]`)[0].checked = data2.notgroup;
    $(`#hyouka2 input[type="checkbox"]`)[1].checked = data2.fav;
    $(`#hyouka2 input[type="number"]`)[0].value = data2.point;
    $(`#hyouka2 textarea`)[0].value = data2.kansou;
}
$(function () {
    [...$("div[title]")].forEach(x => x.className != "" ? x.append($("<input type='" + x.className + "'>")[0]) : 0);
    $(`#hyouka2 input`).on("change", function () {
        const elem = this;
        const a = new Function(`data.hontai${data.openedindex}["${elem.name}"]="${elem.value}"=="on"?${elem.checked}:${elem.value};autosave()`);
        a();
        listupdate();
    });
    $("#hyouka2 textarea").on("change", function () {
        const elem = this;
        const a = new Function(`data.hontai${data.openedindex}["kansou"]=\`${elem.value}\`;`);
        a();
        listupdate();
    })
})
function listupdate() {
    const tukauyatu = Object.entries(data.hontai).map(val => { const x = val[1]; return x?.name == void 0 ? Object.entries(x).map(y => y[1]) : x }).flat(2), yuukou = tukauyatu.filter(x => !x.notgroup && x.point != null).length;
    console.log(yuukou);
    $("#average").text(`平均:${tukauyatu.reduce((a, b) => { return b.notgroup ? a : (b.point || 0) + a; }, 0) / (yuukou == 0 ? 1 : yuukou)}点`);
    $("#hyouka2")[0].title = new Function(`if('${data.openedindex}'!="null"){return data.hontai${data.openedindex}.name.slice(0,-4)}return "";`)();
    $("#saitenjun pre")[0].textContent = "";
    tukauyatu.toSorted((a, b) => b.point - a.point).forEach((val, index) => {
        $("#saitenjun pre")[0].innerHTML += `${index + 1}位:${val.name.slice(0, -4)} <span style="color:${val.fav?"red":"black"}">${val.point || 0}${val.fav ? "◯" : ""}</span><br>`
    });
    tukauyatu.forEach((x, ind) => { $(`label[name="${x.name.slice(0, -4)}"]`).css({ "flex-flow": "row", "color": x.notgroup ? "gray" : "black" }).text(x.name.slice(0, -4) + "  |").append(`<span style="color:${x.fav ? "red" : "black"}">${(x.point || "") + (x.fav ? "◯" : "")}</span>`) });
	checkhyouka(tukauyatu,tukauyatu.reduce((a, b) => { return b.notgroup ? a : (b.point || 0) + a; }, 0) / (yuukou == 0 ? 1 : yuukou));
}