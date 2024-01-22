//zvoleni barev velikosti atd
var game, level, color=["hotpink","Blueviolet","plum","lightskyblue","tomato","orchid","lightblue","orange","brown","pink"], water=[], w=[], currentLevel, clicked=[], transferring=false, t=false, size=1, sizechange=0.05, won=false, moves=0;

//Pozice zkumavek pro různé úrovně hry (souradnice)
var testTubePosition = {
    0: [[-110,130], [-20, 130], [70, 130], [-65,320], [15, 320]],
    1: [[-110,130], [-20, 130], [70, 130],[-110,320], [-20, 320], [70, 320]],
    2: [[-140,130],[-60,130],[20,130],[100,130],[-110,320], [-20, 320], [70, 320]],
}

//Funkce spuštěná po načtení stránky
window.onload = function() {
    game = document.getElementById("game");
    level = document.getElementById("level");
}

// Funkce pro otevreni nove urovne a naplneni zkumavky nahodne barevnimi dily
window.OpenLevel = function(x) {
    moves = 0;
    currentLevel = x;
    won = false;
    level.style.display = "block";
    level.innerHTML = "";
    water = [];
    let a = [], c = 0;

    //generace nahodnych barev z vybranych barev
    for (let i = 0; i < x + 3; i++) {
        for (let j = 0; j < 4; j++) {
            a.push(color[i]);
        }
    }
    a = shuffle(a);

    //naplneni zkumavek
    for (let i = 0; i < x + 3; i++) {
        water[i] = [];
        for (let j = 0; j < 4; j++) {                        
            water[i].push(a[c]);
            c++;
        }
    }

    // Přidání průhledného vzhledu zkumavek
    water.push(["transparent","transparent","transparent","transparent"],["transparent","transparent","transparent","transparent"]);
    w = water.map((a) => [...a]);
    ApplyInfo();
}

//informace o urovnich
function ApplyInfo(a = water) {
    if (!won) {
        let d=0,heading=["EASY","MEDIUM","HARD"][currentLevel];
        level.innerHTML = `<div id='lvl-heading'>${heading}</div>`;

        // Vykreslení zkumavek s barvami
        for (let i of testTubePosition[currentLevel]) {
            level.innerHTML += `<div class="test-tube" style="top:${i[1]}px;left:calc(50vw + ${i[0]}px);transform:rotate(0deg);" onclick="Clicked(${d});">
                <div class="colors" style="background-color:${a[d][0]};top:100px;"></div>
                <div class="colors" style="background-color:${a[d][1]};top:70px;"></div>
                <div class="colors" style="background-color:${a[d][2]};top:40px;"></div>
                <div class="colors" style="background-color:${a[d][3]};top:10px;"></div>
            </div>`;
            d++;
        }

        //ovladani tlacitek
        level.innerHTML += `<div id="restart" class="game-buttons" onclick="Restart();">RESTART</div>
            <div id="home" class="game-buttons" onclick="ShowMenu();">HOME</div>
            <div id="moves">Moves: ${moves}</div>`;
    }
}

//funkce aby zkumavky odpovidaly na kliknuti
window.Clicked = function(x) {
    if (!transferring) {
        if (clicked.length == 0) {
            clicked.push(x);
            document.getElementsByClassName("test-tube")[x].style.transition = "0.2s linear";
            document.getElementsByClassName("test-tube")[x].style.transform = "scale(1.08)";
        } else {
            clicked.push(x);
            let el = document.getElementsByClassName("test-tube")[clicked[0]];
            el.style.transform = "scale(1) rotate(0deg)";
            if (clicked[0] != clicked[1]) {
                el.style.transition = "1s linear";
                moves++;
                document.getElementById("moves").innerHTML = "Moves: " + moves;
                Transfer(...clicked);
            }
            clicked = [];
        }
    }
}

//Funkce na animaci přenosu vody
function TransferAnim(a, b) {
    let el = document.getElementsByClassName("test-tube")[a];
    transferring = true;
    el.style.zIndex = "100";
    el.style.top = `calc(${testTubePosition[currentLevel][b][1]}px - 90px)`;
    el.style.left = `calc(50vw + ${testTubePosition[currentLevel][b][0]}px - 70px)`;
    el.style.transform = "rotate(75deg)";
    setTimeout(function() {
        el.style.transform = "rotate(90deg)";
    }, 1000)
    setTimeout(function() {
        el.style.left = `calc(50vw + ${testTubePosition[currentLevel][a][0]}px)`;
        el.style.top = `calc(${testTubePosition[currentLevel][a][1]}px)`;
        el.style.transform = "rotate(0deg)";
    }, 2000);
    setTimeout(function() {
        el.style.zIndex = "0";
        transferring = false;
    }, 3000);
}

// Funkce pro přenos vody mezi dvěma zkumavkami
function Transfer(a, b) {
    if (!water[b].includes("transparent") || water[a] == ["transparent","transparent","transparent","transparent"]) {
        moves -= 1;
        document.getElementById("moves").innerHTML = "Moves: " + moves;
        return;
    }

    let p, q, r=false, s=false, count=0, c=0;

    //pravidla pro prenaseni vody
    //platí pro kazdy prvek vc poli water[a] a water[b]
    for (let i = 0; i < 4; i++) {
        //podminka pro vodu v prvni zkumavce water[a]
        if (((water[a][i]!="transparent" && water[a][i+1]=="transparent") || i === 3) && !r) {
            r = true;
            p = [water[a][i], i];
            //kontrola pruhlednosti nebo zda se v poli nachazi shoda
            if (water[a].map(function(x) {
                if (x=="transparent" || x==p[0]) {return 1;} else {return 0;}
            }).reduce((x,y) => x + y) === 4) {
                p.push(i+1);
                // hledani shody v poli
            } else {
                for (let j = 1; j < 4; j++) {
                    if (i - j >= 0 && water[a][i - j] != p[0]) {
                        p.push(j);
                        break;
                    }
                }
            }
        }
        //podmínka pro vodu v druhe nadobe water[b]
        if (((water[b][i]!="transparent" && water[b][i+1]=="transparent") || water[b][0]=="transparent") && !s) {
            s = true;
            q = [water[b][i], i, water[b].map((x) => x = (x == "transparent") ? 1 : 0).reduce((x,y) => x + y)];
        }
    }
    //kontrola zda se voda v obou polich shoduje
    if (q[0]!="transparent" && p[0]!=q[0]) {
        moves -= 1;
        document.getElementById("moves").innerHTML = "Moves: " + moves;
        return;
    }
    //odebrani vody z prvni zkumavky
    for (let i = 3; i >= 0; i--) {
        if ((water[a][i] == p[0] || water[a][i] == "transparent") && count < q[2]) {
            if (water[a][i] == p[0]) {
                count++;
            }
            water[a][i] = "transparent";
        } else {
            break;
        }
    }
    // nastaveni hodnoty count do c, takze co prenasime
    c = count;
    //zpozdene nacasovane funkce
    setTimeout(function() { WaterDec(p, a, c); }, 1010);
    setTimeout(function() { WaterInc(p, q, b, c); }, 1010);
    //pridani vody do druhe zkumavky
    for (let i = 0; i < 4; i++) {
        if (water[b][i] == "transparent" && count > 0) {
            count--;
            water[b][i] = p[0];
        }
    }
    //zpozdene nacasovane funkce a Won
    setTimeout(function() { ApplyInfo(); }, 3020);
    setTimeout(function() { TransferAnim(a, b); }, 10);
    setTimeout(Won, 3000);
}


//animace oddeleni dilu vody ze zkumavky
function WaterDec(p,a,count) {
    p[1] = 3-p[1];
    document.getElementsByClassName("test-tube")[a].innerHTML += `<div id = "white-bg" style = "top:calc(10px + ${p[1]*30}px - 1px);"></div>`;
    setTimeout(function() {document.getElementById("white-bg").style.height = count*30+1 + "px";},50);
    setTimeout(function() {
        document.getElementsByClassName("test-tube")[a].innerHTML = `
            <div class="colors" style = "background-color:${water[a][0]};top:100px;"></div>
            <div class="colors" style = "background-color:${water[a][1]};top:70px;"></div>
            <div class="colors" style = "background-color:${water[a][2]};top:40px;"></div>
            <div class="colors" style = "background-color:${water[a][3]};top:10px;"></div>`;
    },1050);
}
//animace napousteni vody
function WaterInc(p, q, b, count) {
q[1] = 4 - q[1];
q[1] -= (q[0]!="transparent" ? 1 : 0);
document.getElementsByClassName("test-tube")[b].innerHTML += `<div id="colorful-bg" style="background-color:${p[0]};top:calc(10px + ${q[1]*30}px);"></div>`;
setTimeout(function() {
    document.getElementById("colorful-bg").style.height = count*30+1 + "px";
    document.getElementById("colorful-bg").style.top = `calc(10px + ${q[1]*30}px - ${count*30}px)`;
}, 50);
}

//restart hry
window.Restart = function() {
moves = 0;
water = w.map((a) => [...a]);
won = false;
ApplyInfo(w);
}

// Funkce pro zobrazení hlavního menu
window.ShowMenu = function() {
document.getElementById("level").style.display = "none";
}

// Funkce pro kontrolu výhry
function Won() {
for (let i of water) {
    if (i[0] != i[1] || i[1] != i[2] || i[2] != i[3]) {
        return;
    }
}
won = true;
level.innerHTML = `<div id="won">VYHRAL JSI <img src="./img/giphy.gif" alt="tancujici hello kitty"><div id="restart" class="game-buttons" onclick="Restart();">RESTART</div><div id="home" class="game-buttons" onclick="ShowMenu();">HOME</div>`;
}

// Funkce pro zamíchání barev
function shuffle(x) {
let a = [], len = x.length;
for (let i = 0; i < len; i++) {
    let n = Math.floor(Math.random() * x.length);
    a.push(x[n]);
    x.splice(n, 1);
}
return a;
}

// Funkce pro zobrazení pravidel hry
window.ShowRules = function() {
document.getElementById("rules-page").style.display = "block";
setTimeout(function() {
    document.getElementById("rules-page").style.opacity = "1";
}, 50);
}

// Funkce pro skrytí pravidel hry
window.HideRules = function() {
setTimeout(function() {
    document.getElementById("rules-page").style.display = "none";
}, 500);
document.getElementById("rules-page").style.opacity = "0";
}

