/* ==========================================================
   杭州探索録 2
   龍井茶郷
   Visual Prototype Ver.0.2
========================================================== */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");


let VIEW_W = 0;
let VIEW_H = 0;

let DPR =
  Math.min(
    window.devicePixelRatio || 1,
    2
  );


/* ==========================================================
   RESIZE
========================================================== */

function resize() {

  VIEW_W =
    window.innerWidth;

  VIEW_H =
    window.innerHeight;

  canvas.width =
    VIEW_W * DPR;

  canvas.height =
    VIEW_H * DPR;

  canvas.style.width =
    VIEW_W + "px";

  canvas.style.height =
    VIEW_H + "px";

  ctx.setTransform(
    DPR,
    0,
    0,
    DPR,
    0,
    0
  );

}

window.addEventListener(
  "resize",
  resize
);

resize();


/* ==========================================================
   WORLD
========================================================== */

const WORLD = {

  width: 2200,

  height: 2400

};


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x: 1100,

  y: 1960,

  radius: 15,

  speed: 235,

  moving: false,

  direction: "up",

  step: 0

};


/* ==========================================================
   CAMERA
========================================================== */

const camera = {

  x: player.x,

  y: player.y

};


/* ==========================================================
   INPUT
========================================================== */

const keys = {};

window.addEventListener(
  "keydown",
  e => {

    keys[
      e.key.toLowerCase()
    ] = true;

  }
);

window.addEventListener(
  "keyup",
  e => {

    keys[
      e.key.toLowerCase()
    ] = false;

  }
);


/* ==========================================================
   RANDOM
   固定シード風の疑似ランダム
========================================================== */

function noise(n) {

  const x =
    Math.sin(
      n * 12.9898
    ) * 43758.5453;

  return x -
    Math.floor(x);

}


/* ==========================================================
   HELPERS
========================================================== */

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


function screen(
  x,
  y
) {

  return {

    x:
      x -
      camera.x +
      VIEW_W / 2,

    y:
      y -
      camera.y +
      VIEW_H / 2

  };

}


function visible(
  x,
  y,
  margin = 300
) {

  const p =
    screen(x,y);

  return (

    p.x > -margin &&
    p.x < VIEW_W + margin &&
    p.y > -margin &&
    p.y < VIEW_H + margin

  );

}


/* ==========================================================
   BUILDINGS
========================================================== */

const buildings = [

  {
    x: 490,
    y: 1560,
    w: 360,
    h: 170,
    name: "龍井茶",
    type: "shop"
  },

  {
    x: 1370,
    y: 1510,
    w: 350,
    h: 175,
    name: "村口茶館",
    type: "tea"
  },

  {
    x: 430,
    y: 1110,
    w: 310,
    h: 155,
    name: "清香居",
    type: "house"
  },

  {
    x: 1450,
    y: 1050,
    w: 330,
    h: 160,
    name: "",
    type: "house"
  },

  {
    x: 540,
    y: 680,
    w: 330,
    h: 165,
    name: "龍井人家",
    type: "house"
  },

  {
    x: 1370,
    y: 610,
    w: 350,
    h: 170,
    name: "",
    type: "house"
  }

];


/* ==========================================================
   TREES
========================================================== */

const trees = [

  [280,1900,1.25],
  [390,2020,1.05],

  [1810,1920,1.35],
  [1900,1770,1.1],

  [310,1450,1.1],
  [1850,1400,1.3],

  [330,950,1.2],
  [1870,880,1.25],

  [390,530,1.4],
  [1790,430,1.2],

  [780,360,1.1],
  [1510,300,1.2]

].map(
  t => ({
    x:t[0],
    y:t[1],
    s:t[2]
  })
);


/* ==========================================================
   NPCS
========================================================== */

const npcs = [

  {
    x:1000,
    y:1710,
    color:"#516c83"
  },

  {
    x:1190,
    y:1450,
    color:"#88614e"
  },

  {
    x:980,
    y:1210,
    color:"#5d7150"
  },

  {
    x:1170,
    y:930,
    color:"#76546b"
  },

  {
    x:1050,
    y:700,
    color:"#486b75"
  }

];


/* ==========================================================
   DECORATIONS
========================================================== */

const baskets = [

  [850,1580],
  [1380,1690],
  [770,1120],
  [1430,1160],
  [870,720]

];


const pots = [

  [820,1650],
  [1420,1580],
  [750,1180],
  [1480,1080]

];


const stoneLanterns = [

  [880,1370],
  [1320,1250],
  [870,840],
  [1330,760]

];


/* ==========================================================
   UPDATE
========================================================== */

function update(dt) {

  let dx = 0;
  let dy = 0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    dy -= 1;

    player.direction =
      "up";

  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy += 1;

    player.direction =
      "down";

  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx -= 1;

    player.direction =
      "left";

  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx += 1;

    player.direction =
      "right";

  }


  player.moving =
    dx !== 0 ||
    dy !== 0;


  if (
    player.moving
  ) {

    const length =
      Math.hypot(
        dx,
        dy
      );

    dx /= length;
    dy /= length;


    player.x +=
      dx *
      player.speed *
      dt;

    player.y +=
      dy *
      player.speed *
      dt;


    player.step +=
      dt * 11;

  }


  player.x =
    clamp(
      player.x,
      140,
      WORLD.width - 140
    );

  player.y =
    clamp(
      player.y,
      180,
      WORLD.height - 120
    );


  /* smooth camera */

  camera.x +=
    (
      player.x -
      camera.x
    ) * 0.075;

  camera.y +=
    (
      player.y -
      camera.y
    ) * 0.075;

}


/* ==========================================================
   SKY
========================================================== */

function drawSky() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      VIEW_H
    );


  gradient.addColorStop(
    0,
    "#a9d7e3"
  );

  gradient.addColorStop(
    .24,
    "#d7e4c2"
  );

  gradient.addColorStop(
    .55,
    "#8fa66c"
  );

  gradient.addColorStop(
    1,
    "#718b50"
  );


  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    VIEW_W,
    VIEW_H
  );

}


/* ==========================================================
   DISTANT MOUNTAINS
========================================================== */

function mountainLayer(
  base,
  height,
  color,
  offset,
  alpha
) {

  ctx.save();

  ctx.globalAlpha =
    alpha;

  ctx.fillStyle =
    color;

  ctx.beginPath();

  ctx.moveTo(
    0,
    base
  );


  const points = 8;

  for (
    let i = 0;
    i <= points;
    i++
  ) {

    const x =
      i *
      VIEW_W /
      points;

    const n =
      Math.sin(
        i * 1.7 +
        offset
      );

    const y =
      base -
      height *
      (
        .55 +
        .45 *
        Math.abs(n)
      );

    ctx.lineTo(
      x,
      y
    );

  }


  ctx.lineTo(
    VIEW_W,
    base + 200
  );

  ctx.lineTo(
    0,
    base + 200
  );

  ctx.closePath();

  ctx.fill();

  ctx.restore();

}


function drawMountains() {

  mountainLayer(
    310,
    135,
    "#73917a",
    1,
    .42
  );

  mountainLayer(
    350,
    160,
    "#54775e",
    3,
    .55
  );

  mountainLayer(
    395,
    145,
    "#42664c",
    5,
    .65
  );

}


/* ==========================================================
   MIST
========================================================== */

function drawMist() {

  const gradient =
    ctx.createLinearGradient(
      0,
      180,
      0,
      480
    );

  gradient.addColorStop(
    0,
    "rgba(235,245,226,.24)"
  );

  gradient.addColorStop(
    1,
    "rgba(235,245,226,0)"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    160,
    VIEW_W,
    350
  );

}


/* ==========================================================
   WORLD GROUND
========================================================== */

function drawGround() {

  const p =
    screen(
      0,
      0
    );


  ctx.fillStyle =
    "#789651";

  ctx.fillRect(
    p.x,
    p.y,
    WORLD.width,
    WORLD.height
  );


  /*
     草地の細かな粒
  */

  for (
    let i = 0;
    i < 450;
    i++
  ) {

    const x =
      noise(i * 8) *
      WORLD.width;

    const y =
      noise(i * 17) *
      WORLD.height;


    if (
      !visible(
        x,
        y,
        30
      )
    ) continue;


    const q =
      screen(
        x,
        y
      );


    ctx.fillStyle =
      i % 3 === 0
      ?
      "rgba(49,91,46,.25)"
      :
      "rgba(190,205,120,.17)";


    ctx.fillRect(
      q.x,
      q.y,
      2,
      5
    );

  }

}


/* ==========================================================
   TEA TERRACES
========================================================== */

function drawTeaField(
  x,
  y,
  width,
  rows,
  curve
) {

  if (
    !visible(
      x + width/2,
      y,
      width
    )
  ) return;


  const p =
    screen(
      x,
      y
    );


  /*
    terrace soil
  */

  ctx.fillStyle =
    "#66824a";

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y - 18
  );

  ctx.lineTo(
    p.x + width,
    p.y - 30
  );

  ctx.lineTo(
    p.x + width + 25,
    p.y + rows * 30
  );

  ctx.lineTo(
    p.x - 20,
    p.y + rows * 30
  );

  ctx.closePath();

  ctx.fill();


  /*
    tea rows
  */

  for (
    let row = 0;
    row < rows;
    row++
  ) {

    const yy =
      p.y +
      row * 30;


    ctx.lineCap =
      "round";


    ctx.strokeStyle =
      "rgba(24,73,39,.55)";

    ctx.lineWidth =
      18;


    ctx.beginPath();

    ctx.moveTo(
      p.x + 5,
      yy
    );


    ctx.quadraticCurveTo(

      p.x +
      width / 2,

      yy +
      Math.sin(
        row * 1.7
      ) *
      curve,

      p.x +
      width,

      yy - 5

    );


    ctx.stroke();


    /*
      bright leaves
    */

    ctx.strokeStyle =
      "rgba(101,151,70,.9)";

    ctx.lineWidth =
      7;


    ctx.beginPath();

    ctx.moveTo(
      p.x + 8,
      yy - 5
    );


    ctx.quadraticCurveTo(

      p.x +
      width / 2,

      yy -
      5 +
      Math.sin(
        row * 1.7
      ) *
      curve,

      p.x +
      width - 5,

      yy - 10

    );


    ctx.stroke();


    /*
      individual leaves
    */

    for (
      let j = 0;
      j < width;
      j += 32
    ) {

      const leafX =
        p.x + j;

      const leafY =
        yy -
        9 +
        Math.sin(
          j * .04 +
          row
        ) * 5;


      ctx.fillStyle =
        row % 2
        ?
        "#6f9b54"
        :
        "#7da65b";


      ctx.beginPath();

      ctx.ellipse(
        leafX,
        leafY,
        6,
        2.5,
        -.4,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }

  }

}


function drawTeaFields() {

  drawTeaField(
    110,
    430,
    600,
    5,
    20
  );

  drawTeaField(
    1450,
    390,
    590,
    5,
    -18
  );


  drawTeaField(
    80,
    900,
    430,
    5,
    14
  );

  drawTeaField(
    1670,
    860,
    430,
    5,
    -14
  );


  drawTeaField(
    80,
    1370,
    420,
    5,
    14
  );

  drawTeaField(
    1700,
    1330,
    420,
    5,
    -16
  );


  drawTeaField(
    80,
    1880,
    500,
    5,
    18
  );

  drawTeaField(
    1600,
    1860,
    500,
    5,
    -18
  );

}


/* ==========================================================
   STONE ROAD
========================================================== */

function roadHalfWidth(y) {

  const t =
    y /
    WORLD.height;

  return (
    115 +
    t * 190
  );

}


function drawRoad() {

  const top =
    screen(
      WORLD.width/2,
      200
    );

  const bottom =
    screen(
      WORLD.width/2,
      WORLD.height
    );


  const topWidth =
    roadHalfWidth(200);

  const bottomWidth =
    roadHalfWidth(
      WORLD.height
    );


  ctx.fillStyle =
    "#b5a67e";


  ctx.beginPath();

  ctx.moveTo(
    top.x - topWidth,
    top.y
  );

  ctx.lineTo(
    top.x + topWidth,
    top.y
  );

  ctx.lineTo(
    bottom.x + bottomWidth,
    bottom.y
  );

  ctx.lineTo(
    bottom.x - bottomWidth,
    bottom.y
  );

  ctx.closePath();

  ctx.fill();


  /*
     Road edges
  */

  ctx.strokeStyle =
    "rgba(83,76,55,.42)";

  ctx.lineWidth = 7;

  ctx.stroke();


  /*
    individual stone slabs
  */

  for (
    let y = 250;
    y < WORLD.height;
    y += 43
  ) {

    const p =
      screen(
        WORLD.width/2,
        y
      );


    if (
      p.y < -100 ||
      p.y > VIEW_H + 100
    ) continue;


    const hw =
      roadHalfWidth(y);


    const number =
      Math.floor(
        hw / 45
      );


    for (
      let i = -number;
      i <= number;
      i++
    ) {

      const seed =
        y * .7 +
        i * 13;


      const randomX =
        (
          noise(seed) -
          .5
        ) * 12;


      const randomY =
        (
          noise(seed + 7) -
          .5
        ) * 8;


      const stoneW =
        38 +
        noise(seed + 20) *
        25;


      const stoneH =
        24 +
        noise(seed + 30) *
        12;


      const x =
        p.x +
        i * 53 +
        randomX;


      if (
        Math.abs(
          x - p.x
        ) >
        hw - 20
      ) continue;


      ctx.fillStyle =
        noise(seed) > .5
        ?
        "rgba(220,207,166,.33)"
        :
        "rgba(110,101,78,.15)";


      ctx.strokeStyle =
        "rgba(75,69,56,.18)";

      ctx.lineWidth = 1;


      ctx.beginPath();

      ctx.roundRect(
        x -
        stoneW/2,
        p.y +
        randomY -
        stoneH/2,
        stoneW,
        stoneH,
        5
      );

      ctx.fill();
      ctx.stroke();

    }

  }

}


/* ==========================================================
   GRASS ALONG ROAD
========================================================== */

function drawRoadGrass() {

  for (
    let y = 300;
    y < WORLD.height;
    y += 34
  ) {

    const width =
      roadHalfWidth(y);


    for (
      const side of [-1,1]
    ) {

      const seed =
        y +
        side * 43;


      const x =
        WORLD.width/2 +
        side *
        (
          width +
          8 +
          noise(seed) * 25
        );


      const p =
        screen(
          x,
          y
        );


      ctx.strokeStyle =
        noise(seed) > .5
        ?
        "#476d3e"
        :
        "#5d8048";

      ctx.lineWidth =
        2;


      const height =
        8 +
        noise(seed+2) *
        10;


      ctx.beginPath();

      ctx.moveTo(
        p.x,
        p.y
      );

      ctx.lineTo(
        p.x - 3,
        p.y - height
      );

      ctx.moveTo(
        p.x,
        p.y
      );

      ctx.lineTo(
        p.x + 4,
        p.y - height * .8
      );

      ctx.stroke();

    }

  }

}


/* ==========================================================
   BUILDING
========================================================== */

function drawBuilding(b) {

  if (
    !visible(
      b.x + b.w/2,
      b.y,
      b.w
    )
  ) return;


  const p =
    screen(
      b.x,
      b.y
    );


  const x =
    p.x;

  const y =
    p.y;


  const wallH =
    b.h;


  /* =================================
     ground shadow
  ================================= */

  ctx.fillStyle =
    "rgba(26,36,24,.24)";


  ctx.beginPath();

  ctx.moveTo(
    x + 25,
    y + wallH
  );

  ctx.lineTo(
    x + b.w + 65,
    y + wallH + 25
  );

  ctx.lineTo(
    x + b.w + 85,
    y + wallH + 55
  );

  ctx.lineTo(
    x + 30,
    y + wallH + 28
  );

  ctx.closePath();

  ctx.fill();


  /* =================================
     wall
  ================================= */

  const wallGradient =
    ctx.createLinearGradient(
      x,
      y,
      x,
      y + wallH
    );


  wallGradient.addColorStop(
    0,
    "#f3ecd6"
  );

  wallGradient.addColorStop(
    1,
    "#d8d0b7"
  );


  ctx.fillStyle =
    wallGradient;


  ctx.fillRect(
    x,
    y,
    b.w,
    wallH
  );


  /*
     dirty wall texture
  */

  for (
    let i = 0;
    i < 25;
    i++
  ) {

    const seed =
      b.x +
      b.y +
      i * 20;


    ctx.fillStyle =
      "rgba(91,92,68,.055)";


    ctx.fillRect(

      x +
      noise(seed) *
      b.w,

      y +
      noise(seed+2) *
      wallH,

      2 +
      noise(seed+4) * 12,

      2

    );

  }


  /* =================================
     wooden frame
  ================================= */

  ctx.fillStyle =
    "#5b432d";


  ctx.fillRect(
    x,
    y,
    8,
    wallH
  );

  ctx.fillRect(
    x + b.w - 8,
    y,
    8,
    wallH
  );

  ctx.fillRect(
    x,
    y + wallH - 10,
    b.w,
    10
  );


  /* vertical beams */

  for (
    let xx = 65;
    xx < b.w;
    xx += 70
  ) {

    ctx.fillStyle =
      "rgba(91,67,45,.85)";

    ctx.fillRect(
      x + xx,
      y + 7,
      5,
      wallH - 7
    );

  }


  /* =================================
     WINDOWS
  ================================= */

  drawWindow(
    x + 28,
    y + 62,
    62,
    52
  );


  drawWindow(
    x + b.w - 90,
    y + 62,
    62,
    52
  );


  /* =================================
     DOOR
  ================================= */

  const doorW = 58;

  const doorX =
    x +
    b.w/2 -
    doorW/2;


  ctx.fillStyle =
    "#493624";


  ctx.fillRect(
    doorX,
    y + 55,
    doorW,
    wallH - 55
  );


  ctx.strokeStyle =
    "#79593a";

  ctx.lineWidth = 3;


  for (
    let d = 9;
    d < doorW;
    d += 11
  ) {

    ctx.beginPath();

    ctx.moveTo(
      doorX + d,
      y + 58
    );

    ctx.lineTo(
      doorX + d,
      y + wallH - 3
    );

    ctx.stroke();

  }


  /* =================================
     STONE FOUNDATION
  ================================= */

  ctx.fillStyle =
    "#777363";


  ctx.fillRect(
    x - 3,
    y + wallH - 13,
    b.w + 6,
    15
  );


  for (
    let i = 0;
    i < b.w;
    i += 28
  ) {

    ctx.strokeStyle =
      "rgba(45,45,39,.25)";

    ctx.strokeRect(
      x + i,
      y + wallH - 13,
      27,
      14
    );

  }


  /* =================================
     ROOF
  ================================= */

  drawRoof(
    x,
    y,
    b.w
  );


  /* =================================
     SIGN
  ================================= */

  if (
    b.name
  ) {

    const signW =
      Math.min(
        170,
        b.w - 70
      );


    ctx.fillStyle =
      "#533b26";


    ctx.fillRect(
      x +
      b.w/2 -
      signW/2,
      y + 15,
      signW,
      34
    );


    ctx.strokeStyle =
      "#967449";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      x +
      b.w/2 -
      signW/2 +
      3,
      y + 18,
      signW - 6,
      28
    );


    ctx.fillStyle =
      "#e5c87e";

    ctx.font =
      "18px serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      b.name,
      x + b.w/2,
      y + 39
    );

  }


  /* =================================
     hanging lanterns
  ================================= */

  drawLantern(
    x + 24,
    y + 30
  );

  drawLantern(
    x + b.w - 24,
    y + 30
  );

}


/* ==========================================================
   WINDOW
========================================================== */

function drawWindow(
  x,
  y,
  w,
  h
) {

  ctx.fillStyle =
    "#47615b";


  ctx.fillRect(
    x,
    y,
    w,
    h
  );


  ctx.strokeStyle =
    "#463626";

  ctx.lineWidth =
    4;


  ctx.strokeRect(
    x,
    y,
    w,
    h
  );


  ctx.lineWidth =
    2;


  for (
    let i = 1;
    i < 4;
    i++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x +
      i*w/4,
      y
    );

    ctx.lineTo(
      x +
      i*w/4,
      y+h
    );

    ctx.stroke();

  }


  ctx.beginPath();

  ctx.moveTo(
    x,
    y+h/2
  );

  ctx.lineTo(
    x+w,
    y+h/2
  );

  ctx.stroke();

}


/* ==========================================================
   ROOF
========================================================== */

function drawRoof(
  x,
  y,
  w
) {

  /*
     roof shadow
  */

  ctx.fillStyle =
    "rgba(0,0,0,.2)";

  ctx.fillRect(
    x - 22,
    y - 5,
    w + 44,
    15
  );


  /*
     roof shape
  */

  ctx.fillStyle =
    "#293531";


  ctx.beginPath();

  ctx.moveTo(
    x - 38,
    y + 4
  );

  ctx.quadraticCurveTo(
    x - 20,
    y - 8,
    x + 18,
    y - 58
  );


  ctx.lineTo(
    x + w - 18,
    y - 58
  );


  ctx.quadraticCurveTo(
    x + w + 20,
    y - 8,
    x + w + 38,
    y + 4
  );


  ctx.quadraticCurveTo(
    x + w/2,
    y - 3,
    x - 38,
    y + 4
  );


  ctx.fill();


  /*
     roof highlight
  */

  ctx.strokeStyle =
    "#53645c";

  ctx.lineWidth =
    3;


  ctx.beginPath();

  ctx.moveTo(
    x - 35,
    y
  );

  ctx.quadraticCurveTo(
    x + w/2,
    y - 12,
    x + w + 35,
    y
  );

  ctx.stroke();


  /*
     roof tiles
  */

  ctx.strokeStyle =
    "rgba(107,126,115,.55)";

  ctx.lineWidth =
    1.5;


  for (
    let i = 0;
    i <= 14;
    i++
  ) {

    const t =
      i / 14;


    const xx =
      x +
      t * w;


    ctx.beginPath();

    ctx.moveTo(
      xx,
      y - 54
    );

    ctx.quadraticCurveTo(
      xx +
      (t-.5)*12,
      y - 25,
      xx +
      (t-.5)*25,
      y
    );

    ctx.stroke();

  }


  /*
    roof ridge
  */

  ctx.fillStyle =
    "#202c29";


  ctx.fillRect(
    x + 15,
    y - 64,
    w - 30,
    8
  );


  /*
    end ornaments
  */

  ctx.beginPath();

  ctx.arc(
    x + 12,
    y - 60,
    7,
    0,
    Math.PI*2
  );

  ctx.arc(
    x + w - 12,
    y - 60,
    7,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* ==========================================================
   LANTERN
========================================================== */

function drawLantern(
  x,
  y
) {

  ctx.strokeStyle =
    "#392d22";

  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.moveTo(
    x,
    y
  );

  ctx.lineTo(
    x,
    y + 13
  );

  ctx.stroke();


  ctx.fillStyle =
    "#b95036";


  ctx.beginPath();

  ctx.ellipse(
    x,
    y + 24,
    7,
    11,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.strokeStyle =
    "#79352b";

  ctx.stroke();

}


/* ==========================================================
   TREE
========================================================== */

function drawTree(t) {

  if (
    !visible(
      t.x,
      t.y,
      150
    )
  ) return;


  const p =
    screen(
      t.x,
      t.y
    );


  const s =
    t.s;


  /*
     tree shadow
  */

  ctx.fillStyle =
    "rgba(28,53,28,.19)";


  ctx.beginPath();

  ctx.ellipse(
    p.x + 25*s,
    p.y + 17*s,
    65*s,
    22*s,
    .25,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     trunk
  */

  ctx.strokeStyle =
    "#55442f";

  ctx.lineWidth =
    15*s;

  ctx.lineCap =
    "round";


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y + 20*s
  );

  ctx.lineTo(
    p.x - 3*s,
    p.y - 65*s
  );

  ctx.stroke();


  /*
     branches
  */

  ctx.lineWidth =
    7*s;


  const branches = [

    [-3,-48,-38,-82],
    [0,-55,35,-88],
    [-2,-70,-20,-105],
    [2,-67,22,-110]

  ];


  branches.forEach(
    b => {

      ctx.beginPath();

      ctx.moveTo(
        p.x + b[0]*s,
        p.y + b[1]*s
      );

      ctx.lineTo(
        p.x + b[2]*s,
        p.y + b[3]*s
      );

      ctx.stroke();

    }
  );


  /*
     leaf clusters
  */

  const clusters = [

    [-38,-92,38],
    [5,-112,43],
    [40,-88,36],
    [-12,-73,39],
    [28,-125,30],
    [-53,-65,29]

  ];


  clusters.forEach(
    (c,index) => {

      ctx.fillStyle =
        index % 2
        ?
        "#426f45"
        :
        "#527f4b";


      ctx.beginPath();

      ctx.arc(
        p.x + c[0]*s,
        p.y + c[1]*s,
        c[2]*s,
        0,
        Math.PI*2
      );

      ctx.fill();


      ctx.fillStyle =
        "rgba(128,164,81,.32)";


      ctx.beginPath();

      ctx.arc(
        p.x +
        (
          c[0]-8
        )*s,

        p.y +
        (
          c[1]-10
        )*s,

        c[2]*.55*s,

        0,
        Math.PI*2
      );

      ctx.fill();

    }
  );

}


/* ==========================================================
   STONE LANTERN
========================================================== */

function drawStoneLantern(
  x,
  y
) {

  const p =
    screen(
      x,
      y
    );


  ctx.fillStyle =
    "#77786d";


  ctx.fillRect(
    p.x - 7,
    p.y - 28,
    14,
    30
  );


  ctx.fillRect(
    p.x - 15,
    p.y - 33,
    30,
    7
  );


  ctx.fillStyle =
    "#686a61";


  ctx.beginPath();

  ctx.moveTo(
    p.x - 19,
    p.y - 36
  );

  ctx.lineTo(
    p.x,
    p.y - 49
  );

  ctx.lineTo(
    p.x + 19,
    p.y - 36
  );

  ctx.closePath();

  ctx.fill();

}


/* ==========================================================
   BASKET
========================================================== */

function drawBasket(
  x,
  y
) {

  const p =
    screen(
      x,
      y
    );


  ctx.fillStyle =
    "#947347";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    17,
    7,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillRect(
    p.x - 15,
    p.y - 2,
    30,
    16
  );


  ctx.strokeStyle =
    "#634d32";

  ctx.lineWidth =
    2;


  for (
    let i=-10;
    i<=10;
    i+=5
  ) {

    ctx.beginPath();

    ctx.moveTo(
      p.x+i,
      p.y
    );

    ctx.lineTo(
      p.x+i,
      p.y+14
    );

    ctx.stroke();

  }


  /*
     tea leaves
  */

  ctx.fillStyle =
    "#477240";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y - 2,
    13,
    4,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* ==========================================================
   POT
========================================================== */

function drawPot(
  x,
  y
) {

  const p =
    screen(
      x,
      y
    );


  ctx.fillStyle =
    "#74523d";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    13,
    5,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    p.x - 12,
    p.y
  );

  ctx.lineTo(
    p.x - 9,
    p.y + 18
  );

  ctx.quadraticCurveTo(
    p.x,
    p.y + 24,
    p.x + 9,
    p.y + 18
  );

  ctx.lineTo(
    p.x + 12,
    p.y
  );

  ctx.fill();

}


/* ==========================================================
   CHARACTER
========================================================== */

function drawCharacter(
  x,
  y,
  color,
  isPlayer = false
) {

  const p =
    screen(
      x,
      y
    );


  const bob =
    isPlayer &&
    player.moving
    ?
    Math.sin(
      player.step
    ) * 2
    :
    0;


  /*
    shadow
  */

  ctx.fillStyle =
    "rgba(20,25,20,.28)";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y + 11,
    17,
    7,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     legs
  */

  ctx.fillStyle =
    "#353735";


  ctx.fillRect(
    p.x - 9,
    p.y - 2 + bob,
    7,
    18
  );


  ctx.fillRect(
    p.x + 2,
    p.y - 2 + bob,
    7,
    18
  );


  /*
     body
  */

  ctx.fillStyle =
    color;


  ctx.beginPath();

  ctx.roundRect(
    p.x - 13,
    p.y - 31 + bob,
    26,
    34,
    5
  );

  ctx.fill();


  /*
     belt
  */

  ctx.fillStyle =
    "rgba(40,35,30,.55)";


  ctx.fillRect(
    p.x - 13,
    p.y - 10 + bob,
    26,
    4
  );


  /*
     head
  */

  ctx.fillStyle =
    "#ddb08a";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y - 42 + bob,
    11,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     hair
  */

  ctx.fillStyle =
    "#2c2a27";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y - 46 + bob,
    11,
    Math.PI,
    Math.PI*2
  );

  ctx.fill();


  /*
     player scarf
  */

  if (
    isPlayer
  ) {

    ctx.fillStyle =
      "#d3b45f";


    ctx.fillRect(
      p.x - 12,
      p.y - 31 + bob,
      24,
      4
    );

  }

}


/* ==========================================================
   DEPTH SORT
========================================================== */

function drawObjects() {

  const objects = [];


  buildings.forEach(
    b => {

      objects.push({

        y:
          b.y +
          b.h,

        draw:
          () =>
            drawBuilding(b)

      });

    }
  );


  trees.forEach(
    t => {

      objects.push({

        y:t.y,

        draw:
          () =>
            drawTree(t)

      });

    }
  );


  npcs.forEach(
    n => {

      objects.push({

        y:n.y,

        draw:
          () =>
            drawCharacter(
              n.x,
              n.y,
              n.color
            )

      });

    }
  );


  baskets.forEach(
    b => {

      objects.push({

        y:b[1],

        draw:
          () =>
            drawBasket(
              b[0],
              b[1]
            )

      });

    }
  );


  pots.forEach(
    p => {

      objects.push({

        y:p[1],

        draw:
          () =>
            drawPot(
              p[0],
              p[1]
            )

      });

    }
  );


  stoneLanterns.forEach(
    s => {

      objects.push({

        y:s[1],

        draw:
          () =>
            drawStoneLantern(
              s[0],
              s[1]
            )

      });

    }
  );


  objects.push({

    y:
      player.y,

    draw:
      () =>
        drawCharacter(
          player.x,
          player.y,
          "#35654b",
          true
        )

  });


  objects.sort(
    (a,b) =>
      a.y -
      b.y
  );


  objects.forEach(
    o =>
      o.draw()
  );

}


/* ==========================================================
   FLOWERS
========================================================== */

function drawFlowers() {

  for (
    let i=0;
    i<110;
    i++
  ) {

    const seed =
      i * 81;


    let x =
      noise(seed) *
      WORLD.width;


    let y =
      noise(seed+9) *
      WORLD.height;


    const center =
      WORLD.width/2;


    if (
      Math.abs(
        x-center
      ) <
      roadHalfWidth(y)+40
    ) continue;


    if (
      !visible(
        x,
        y,
        30
      )
    ) continue;


    const p =
      screen(
        x,
        y
      );


    const flowerColors = [

      "#e7d6b0",
      "#d8c3dd",
      "#d8d88d",
      "#cfa6a2"

    ];


    ctx.fillStyle =
      flowerColors[
        i %
        flowerColors.length
      ];


    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      2.2,
      0,
      Math.PI*2
    );

    ctx.fill();

  }

}


/* ==========================================================
   SUNLIGHT
========================================================== */

function drawSunlight() {

  ctx.save();


  ctx.globalCompositeOperation =
    "screen";


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      VIEW_W,
      VIEW_H
    );


  gradient.addColorStop(
    0,
    "rgba(255,246,188,.12)"
  );


  gradient.addColorStop(
    .45,
    "rgba(255,246,188,.025)"
  );


  gradient.addColorStop(
    1,
    "rgba(255,246,188,0)"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    VIEW_W,
    VIEW_H
  );


  ctx.restore();

}


/* ==========================================================
   FOREGROUND LEAVES
========================================================== */

function drawForegroundLeaves(
  time
) {

  ctx.save();


  const sway =
    Math.sin(
      time * .0007
    ) * 10;


  ctx.globalAlpha =
    .30;


  ctx.fillStyle =
    "#173d2a";


  /*
     left foreground
  */

  for (
    let i=0;
    i<8;
    i++
  ) {

    const x =
      -20 +
      i*18 +
      sway;


    const y =
      VIEW_H -
      30 -
      i*13;


    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      42,
      16,
      -.6,
      0,
      Math.PI*2
    );

    ctx.fill();

  }


  /*
     right foreground
  */

  for (
    let i=0;
    i<8;
    i++
  ) {

    const x =
      VIEW_W +
      15 -
      i*17 -
      sway;


    const y =
      VIEW_H -
      40 -
      i*14;


    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      45,
      17,
      .6,
      0,
      Math.PI*2
    );

    ctx.fill();

  }


  ctx.restore();

}


/* ==========================================================
   ATMOSPHERIC DEPTH
========================================================== */

function drawAtmosphere() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      VIEW_H
    );


  gradient.addColorStop(
    0,
    "rgba(230,242,218,.13)"
  );


  gradient.addColorStop(
    .45,
    "rgba(230,242,218,0)"
  );


  gradient.addColorStop(
    1,
    "rgba(25,54,31,.04)"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    VIEW_W,
    VIEW_H
  );

}


/* ==========================================================
   DRAW
========================================================== */

function draw(time) {

  ctx.clearRect(
    0,
    0,
    VIEW_W,
    VIEW_H
  );


  drawSky();

  drawMountains();

  drawMist();

  drawGround();

  drawTeaFields();

  drawRoad();

  drawRoadGrass();

  drawFlowers();

  drawObjects();

  drawSunlight();

  drawAtmosphere();

  drawForegroundLeaves(
    time
  );

}


/* ==========================================================
   LOOP
========================================================== */

let previous =
  performance.now();


function loop(time) {

  const dt =
    Math.min(
      (
        time -
        previous
      ) / 1000,
      .05
    );


  previous =
    time;


  update(dt);

  draw(time);


  requestAnimationFrame(
    loop
  );

}


requestAnimationFrame(
  loop
);
