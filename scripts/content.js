function xp(xpath){
    let results = [];
    let q = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    )
    for (let i = 0, length = q.snapshotLength; i < length; ++i) {
        results.push(q.snapshotItem(i));
    }
    return results;
}
function modifyTable() {
    var tables = xp('//span[@class="table"]');
    for (var i = 1, l = tables.length; i<=l; i++){
        var rows = xp('//span[@class="table"]['+i.toString()+']/*[@class="tr"]');
        var nt = document.createElement('tbody');
        var tab = document.createElement('table');
        tab.setAttribute('style', 'border-collapse: collapse; border: 1px solid black;');
        for (var e = 1, r = rows.length; e<=r; e++) {
            var ds = xp('//span[@class="table"]['+i.toString()+']/*[@class="tr"]['+e.toString()+']/*[@class="td" or @class="th"]');
            var nr = document.createElement('tr');
            for (var n = 0, c = ds.length; n<c; n++) {
                var nd = document.createElement('td');
                nd.appendChild(document.createTextNode(ds[n].innerText));
                nd.setAttribute('style', 'border-collapse: collapse; border: 1px solid black;');
                nr.appendChild(nd);
            }
            nt.appendChild(nr);
        }
        tab.appendChild(nt);
        tables[i-1].replaceWith(tab);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var SQL;
initSqlJs().then(function (sql) {
    //Create the database
    SQL = sql;
});
var d = {};
var deck;
function gw() {
    var ws = xp('//h2/*[@class="orth"]');
    var prons = xp('//div[contains(@class, "mini") and contains(@class, "h2")]');
    var defs = xp('//div[contains(@class,"definitions") or contains(@class, "definition")]');
    var notes = [];
    for (var i = 0, l = ws.length; i < l; i++) {
        var w = ws[i].innerText;
        var pron = prons[i].innerText;
        var def = defs[i].innerHTML;
        var sdef = ''; 
        // xp('//*[@class="anchor"][contains(@id, "__'+(i+1).toString()+'")]/../div[contains(@class, "definition")]/div[contains(@class, "hom")]/div[contains(@class, "sense")]/span[contains(@class, "bold") or contains(@class, "type-translation")]').forEach(element => {
        xp('//*[@class="anchor"][contains(@id, "__'+(i+1).toString()+'")]/../div[contains(@class, "definition")]/div[contains(@class, "hom")]/*[contains(@class, "sense") or contains(@class, "bold") or contains(@class, "type-translation")]/*[contains(@class, "sense") or contains(@class, "bold") or contains(@class, "type-translation") or contains(@class, "quote")]').forEach(element => {
            if (element.className.includes('bold') && !element.innerText.includes('1')) {
                sdef += '<br>' + element.innerText + '. ';
            } else if (element.className.includes('bold') && element.innerText.includes('1')) {
                sdef += element.innerText + '. ';
            } else {
                sdef += element.innerText + ', ';
            }
        });
        sdef += '\n';
        console.log([w, pron, def, sdef]);
        notes.push([w, pron, def, sdef]);
    }
    chrome.storage.local.get("d").then((result) => {
        console.log(notes.concat(result.d));
        chrome.storage.local.set({'d': notes.concat(result.d)});
        sleep(456)
        getDex();
    });
    return notes;
}
function clearDeck() {
    chrome.storage.local.set({ 'd': []});
    sleep(123);
    getDex();
}
function getDex() {
    chrome.storage.local.get("d").then((dex) => {
        var ih = '';
        let c = 0;
        dex.d.forEach(element => {
            ih += '<input type="checkbox" id="bx'+c.toString()+'"> '+element[0]+'<br>'
            c += 1;
        });
        xp('//*[@id="fmee6789"]')[0].innerHTML = '<div>'+ih+'</div>';
        return dex.d;
    });
}
var m1 = new Model({
    name: "Collins",
    id: "2156341623643",
    flds: [
        { name: "word" },
        { name: "pron" },
        { name: "def" },
        { name: "sdef" }
    ],
    req: [
        [0, "all", [0]],
        [ 1, "all", [ 1 ] ]
    ],
    tmpls: [
        {
            name: "Card 1",
            qfmt: "{{word}}",
            afmt: "{{word}}\n\n<hr id=answer>\n\n{{pron}}\n\n{{def}}",
        },
        {
            name: "Card 2",
            qfmt: "{{sdef}}",
            afmt: "{{sdef}}\n\n<hr id=answer>\n\n{{word}}\n\n{{pron}}\n\n{{def}}",
        }
    ],
})

// add deck to package and export
function exportDeck() {
    chrome.storage.local.get("d").then((fr) => {
        deck = new Deck(Math.floor(Math.random() * (1999999999999 - 1000000000000 + 1)) + 1000000000000, document.getElementById('deck_name').value);
        fr.d.forEach(element => {
            deck.addNote(m1.note(element),);
        });
    });
    var p = new Package();
    p.addDeck(deck);
    p.writeToFile(document.getElementById('note_tags').value+'.apkg');
}
function delNote() {
    var count = 0;
    var rm_list = [];
    xp('//input[contains(@id, "bx")]').forEach(element => {
        if (element.checked) {
            rm_list.push(count);
        }
        count += 1;
    });
    chrome.storage.local.get("d").then((ad) => {
        var l = ad.d;
        rm_list.forEach(element => {
            l.splice(element, 1);
            sleep(200);
        });
        chrome.storage.local.set({'d': l});
        sleep(466);
        getDex()
    });
}
function start() {
    var ads = xp('//div[contains(@id,"ad") and contains(@id, "slot")]');
    for (var i = 0, l = ads.length; i < l; i++) {
        ads[i].remove();
    }
    var cprs = xp('//div[contains(@class,"copyright")]');
    for (var i = 0, l = cprs.length; i < l; i++) {
        cprs[i].remove();
    }
    xp('//*[@class="orth"]').forEach(element => {
        element.style.fontWeight = "bolder";
    });
    xp('//*[contains(@class, "translation")]/*[@class="quote"]').forEach(element => {
        element.style.fontWeight = "bolder";
    });
    xp('//*[contains(@class,"type-syn")]').forEach(element => {
        element.style.fontWeight = "lighter";
        element.style.fontStyle = "italic";
    });
    xp('//*[@class="pronIPASymbol"]').forEach(element => {
        element.remove();
    });
    xp('//span[@class="p" or @class="p heading"]').forEach(element => {
        element.remove();
    });

    var bt1 = document.createElement("button");
    bt1.setAttribute('id', 'bt1');
    bt1.textContent = 'Save to New Notes';
    bt1.addEventListener("click", gw);
    xp('//*[@class="res_cell_right"]')[0].appendChild(bt1);

    var bt2 = document.createElement("button");
    bt2.setAttribute('id', 'bt2');
    bt2.textContent = 'Output Deck';
    bt2.addEventListener("click", exportDeck);
    xp('//*[@class="res_cell_right"]')[0].appendChild(bt2);

    var bt4 = document.createElement("button");
    bt4.setAttribute('id', 'bt4');
    bt4.textContent = 'Get Saved Notes';
    bt4.addEventListener("click", getDex);
    xp('//*[@class="res_cell_right"]')[0].appendChild(bt4);

    var bt3 = document.createElement("button");
    bt3.setAttribute('id', 'bt3');
    bt3.textContent = 'Clear Saved Notes';
    bt3.addEventListener("click", clearDeck);
    xp('//*[@class="res_cell_right"]')[0].appendChild(bt3);

    var bt5 = document.createElement("button");
    bt5.setAttribute('id', 'bt5');
    bt5.textContent = 'Delete Selected';
    bt5.addEventListener("click", delNote);
    xp('//*[@class="res_cell_right"]')[0].appendChild(bt5);

    var x = document.createElement("INPUT");
    x.setAttribute("type", "text");
    x.setAttribute("id", "deck_name");
    xp('//*[@class="res_cell_right"]')[0].appendChild(x);
    var tags = document.createElement("INPUT");
    tags.setAttribute("type", "text");
    tags.setAttribute("id", "note_tags");
    tags.setAttribute("value", "deck");
    xp('//*[@class="res_cell_right"]')[0].appendChild(tags);

    var new_div = document.createElement('div');
    new_div.setAttribute('id', 'fmee6789');
    xp('//*[@class="res_cell_right"]')[0].appendChild(new_div);

    xp('//span[contains(@class, "verb") or contains(@class, "conjugation") or contains(@class, "title")]/span[contains(@class, "infl") or contains(@class, "conjugation") or contains(@class, "title")]').forEach(element => {
        element.appendChild(document.createElement('br'));
    });

    xp('//span[@class="vb" or @class="title"]').forEach(element => {
        element.setAttribute("style", "font-weight:bolder");
    });
    xp('//a[@class="link-right verbtable" or @class="share-button icon-Share"]').forEach(element => {
        element.remove();
    });
    xp('//span[@class="pos"]').forEach(element => {
        element.setAttribute('style', "text-transform: uppercase;");
    });
    xp('//div[@class="languageSelector desktopOnly" or @class="carousel alone jsActive" or @class="carousel jsActive" or @class="miniWordle default" or @class="miniScrabble default" or @class="cB cB-hook" or @class="footerContent" or @class="header-top" or @class="logo-reseaux_img login desktopOnly" or contains(@class, "major-links-container") or contains(@class,"dD_d") or @class="grammarBox"]').forEach(element => {
        element.remove();
    });
    xp('//a[@title="Grammar" or contains(@class, "tab disabled-link") or @title="Video"]').forEach(element => {
        element.remove();
    });

    modifyTable()
    getDex()
}
start()
