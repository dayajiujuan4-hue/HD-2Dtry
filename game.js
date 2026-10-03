/* ==========================================================
   杭州探索録 3
   都市杭州
   City Prototype Ver.0.1
========================================================== */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");

let VW = 0;
let VH = 0;

const DPR =
  Math.min(
    window.devicePixelRatio || 1,
    2
  );


/* ==========================================================
   RESIZE
========================================================== */

function resize() {

  VW = window.innerWidth;
  VH = window.innerHeight;

  canvas.width =
    VW * DPR;

  canvas.height =
    VH * DPR;

  canvas.style.width =
    VW + "px";

  canvas.style.height =
    VH + "px";

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

  width: 2600,
  height: 3000

};


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x: 1300,
  y: 2550,

  speed: 245,

  moving: false,

  step: 0,

  direction: "up"

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
   HELPERS
========================================================== */

function clamp(v,min,max) {

  return Math.max(
    min,
    Math.min(max,v)
  );

}


function screen(x,y) {

  return {

    x:
      x -
      camera.x +
      VW/2,

    y:
      y -
      camera.y +
      VH/2

  };

}


function visible(
  x,
  y,
  margin=400
) {

  const p =
    screen(x,y);

  return (
    p.x > -margin &&
    p.x < VW + margin &&
    p.y > -margin &&
    p.y < VH + margin
  );

}


function noise(n) {

  const x =
    Math.sin(
      n * 12.9898
    ) * 43758.5453;

  return x -
    Math.floor(x);

}


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

    dy--;

    player.direction =
      "up";

  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy++;

    player.direction =
      "down";

  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx--;

    player.direction =
      "left";

  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx++;

    player.direction =
      "right";

  }


  player.moving =
    dx !== 0 ||
    dy !== 0;


  if (
    player.moving
  ) {

    const len =
      Math.hypot(dx,dy);

    dx /= len;
    dy /= len;

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
      150,
      WORLD.width - 150
    );

  player.y =
    clamp(
      player.y,
      200,
      WORLD.height - 100
    );


  camera.x +=
    (
      player.x -
      camera.x
    ) * .075;

  camera.y +=
    (
      player.y -
      camera.y
    ) * .075;

}


/* ==========================================================
   SKY
========================================================== */

function drawSky() {

  const g =
    ctx.createLinearGradient(
      0,
      0,
      0,
      VH
    );

  g.addColorStop(
    0,
    "#9fc6d5"
  );

  g.addColorStop(
    .35,
    "#d2d8ce"
  );

  g.addColorStop(
    1,
    "#b9bcb1"
  );

  ctx.fillStyle = g;

  ctx.fillRect(
    0,
    0,
    VW,
    VH
  );

}


/* ==========================================================
   DISTANT SKYLINE
========================================================== */

function drawSkyline() {

  const base =
    360;

  const buildings = [

    [0,170,95],
    [85,220,80],
    [160,145,70],
    [225,260,110],
    [330,190,80],
    [410,300,105],
    [510,230,85],
    [590,160,70],
    [655,340,115],
    [770,215,80],
    [850,280,100],
    [950,190,70],
    [1010,330,110],
    [1120,240,80],
    [1200,180,70],
    [1270,350,120],
    [1390,260,85],
    [1470,200,70],
    [1540,315,105],
    [1645,220,80],
    [1725,270,95],
    [1820,185,75]

  ];


  ctx.save();

  ctx.globalAlpha =
    .34;


  buildings.forEach(
    (b,i) => {

      let x =
        (
          b[0] %
          (VW + 200)
        ) - 50;

      const h =
        b[1];

      const w =
        b[2];


      ctx.fillStyle =
        i % 3 === 0
        ?
        "#617783"
        :
        "#6e8087";


      ctx.fillRect(
        x,
        base-h,
        w,
        h
      );


      /*
        rooftop
      */

      if (
        i % 4 === 0
      ) {

        ctx.fillRect(
          x+w*.43,
          base-h-35,
          w*.14,
          35
        );

      }


      /*
        window lines
      */

      ctx.strokeStyle =
        "rgba(225,235,236,.25)";

      ctx.lineWidth =
        1;


      for (
        let yy =
          base-h+15;
        yy <
          base-10;
        yy += 18
      ) {

        ctx.beginPath();

        ctx.moveTo(
          x+8,
          yy
        );

        ctx.lineTo(
          x+w-8,
          yy
        );

        ctx.stroke();

      }

    }
  );


  ctx.restore();


  /*
    haze
  */

  const haze =
    ctx.createLinearGradient(
      0,
      170,
      0,
      430
    );


  haze.addColorStop(
    0,
    "rgba(225,233,229,.05)"
  );

  haze.addColorStop(
    1,
    "rgba(225,233,229,.7)"
  );


  ctx.fillStyle =
    haze;

  ctx.fillRect(
    0,
    150,
    VW,
    300
  );

}


/* ==========================================================
   WORLD GROUND
========================================================== */

function drawGround() {

  const p =
    screen(0,0);


  ctx.fillStyle =
    "#a7a9a2";

  ctx.fillRect(
    p.x,
    p.y,
    WORLD.width,
    WORLD.height
  );

}


/* ==========================================================
   ROAD
========================================================== */

const road = {

  left: 870,
  right: 1730

};


function drawRoad() {

  const top =
    screen(
      road.left,
      0
    );

  const bottom =
    screen(
      road.right,
      WORLD.height
    );


  /*
    asphalt
  */

  ctx.fillStyle =
    "#4e5355";

  ctx.fillRect(
    top.x,
    top.y,
    road.right-road.left,
    WORLD.height
  );


  /*
    asphalt texture
  */

  for (
    let i=0;
    i<700;
    i++
  ) {

    const x =
      road.left +
      noise(i*5) *
      (
        road.right -
        road.left
      );

    const y =
      noise(i*11) *
      WORLD.height;


    if (
      !visible(x,y,20)
    ) continue;


    const p =
      screen(x,y);


    ctx.fillStyle =
      i % 2
      ?
      "rgba(255,255,255,.035)"
      :
      "rgba(0,0,0,.035)";


    ctx.fillRect(
      p.x,
      p.y,
      2,
      2
    );

  }


  /*
    road borders
  */

  drawRoadLine(
    road.left + 25,
    "#e8e5d8",
    5
  );

  drawRoadLine(
    road.right - 25,
    "#e8e5d8",
    5
  );


  /*
    lane markings
  */

  for (
    const lane of [
      1080,
      1300,
      1520
    ]
  ) {

    for (
      let y=100;
      y<WORLD.height;
      y+=120
    ) {

      const p =
        screen(
          lane,
          y
        );


      ctx.fillStyle =
        "#dddccf";

      ctx.fillRect(
        p.x-3,
        p.y,
        6,
        58
      );

    }

  }

}


function drawRoadLine(
  x,
  color,
  width
) {

  const p =
    screen(x,0);


  ctx.fillStyle =
    color;


  ctx.fillRect(
    p.x-width/2,
    p.y,
    width,
    WORLD.height
  );

}


/* ==========================================================
   SIDEWALKS
========================================================== */

function drawSidewalk() {

  drawOneSidewalk(
    550,
    road.left
  );

  drawOneSidewalk(
    road.right,
    2050
  );

}


function drawOneSidewalk(
  left,
  right
) {

  const p =
    screen(
      left,
      0
    );


  ctx.fillStyle =
    "#c5c4bc";


  ctx.fillRect(
    p.x,
    p.y,
    right-left,
    WORLD.height
  );


  /*
     paving slabs
  */

  ctx.strokeStyle =
    "rgba(95,96,91,.17)";

  ctx.lineWidth =
    1;


  for (
    let y=0;
    y<WORLD.height;
    y+=42
  ) {

    const a =
      screen(left,y);

    const b =
      screen(right,y);


    ctx.beginPath();

    ctx.moveTo(
      a.x,
      a.y
    );

    ctx.lineTo(
      b.x,
      b.y
    );

    ctx.stroke();

  }


  for (
    let x=left;
    x<right;
    x+=48
  ) {

    const a =
      screen(x,0);


    ctx.beginPath();

    ctx.moveTo(
      a.x,
      a.y
    );

    ctx.lineTo(
      a.x,
      a.y+WORLD.height
    );

    ctx.stroke();

  }


  /*
     curb
  */

  const curb =
    right === road.left
    ?
    right-10
    :
    left;


  const c =
    screen(
      curb,
      0
    );


  ctx.fillStyle =
    "#deddd4";


  ctx.fillRect(
    c.x,
    c.y,
    10,
    WORLD.height
  );

}


/* ==========================================================
   YELLOW TACTILE PAVING
========================================================== */

function drawTactilePaving() {

  for (
    const x of [
      810,
      1790
    ]
  ) {

    const p =
      screen(x,0);


    ctx.fillStyle =
      "#d5b34c";


    ctx.fillRect(
      p.x-8,
      p.y,
      16,
      WORLD.height
    );


    for (
      let y=0;
      y<WORLD.height;
      y+=12
    ) {

      const q =
        screen(x,y);


      ctx.fillStyle =
        "rgba(107,86,27,.25)";


      ctx.beginPath();

      ctx.arc(
        q.x,
        q.y,
        1.5,
        0,
        Math.PI*2
      );

      ctx.fill();

    }

  }

}


/* ==========================================================
   CROSSWALK
========================================================== */

function drawCrosswalk(
  y
) {

  const start =
    road.left + 30;

  const width =
    road.right -
    road.left -
    60;


  for (
    let x=start;
    x<start+width;
    x+=48
  ) {

    const p =
      screen(
        x,
        y
      );


    ctx.fillStyle =
      "rgba(235,235,226,.88)";


    ctx.fillRect(
      p.x,
      p.y,
      30,
      115
    );

  }


  /*
    stop line
  */

  const line =
    screen(
      road.left,
      y-28
    );


  ctx.fillStyle =
    "#e7e6dc";


  ctx.fillRect(
    line.x,
    line.y,
    road.right-road.left,
    7
  );

}


/* ==========================================================
   BUILDINGS
========================================================== */

const cityBuildings = [

  {
    x:70,
    y:2080,
    w:450,
    h:360,
    floors:8,
    name:"杭州书房",
    type:"stone"
  },

  {
    x:100,
    y:1510,
    w:420,
    h:430,
    floors:11,
    name:"杭城中心",
    type:"glass"
  },

  {
    x:40,
    y:870,
    w:480,
    h:520,
    floors:14,
    name:"HANGZHOU",
    type:"glass"
  },

  {
    x:90,
    y:250,
    w:430,
    h:480,
    floors:12,
    name:"",
    type:"office"
  },


  {
    x:2080,
    y:2070,
    w:450,
    h:370,
    floors:9,
    name:"茶 · COFFEE",
    type:"stone"
  },

  {
    x:2080,
    y:1480,
    w:450,
    h:450,
    floors:12,
    name:"杭州中心",
    type:"glass"
  },

  {
    x:2070,
    y:850,
    w:470,
    h:520,
    floors:15,
    name:"",
    type:"office"
  },

  {
    x:2090,
    y:220,
    w:430,
    h:500,
    floors:13,
    name:"",
    type:"glass"
  }

];


/* ==========================================================
   BUILDING DRAW
========================================================== */

function drawBuilding(b) {

  if (
    !visible(
      b.x+b.w/2,
      b.y,
      700
    )
  ) return;


  const p =
    screen(
      b.x,
      b.y
    );


  const x=p.x;
  const y=p.y;

  const visualHeight =
    Math.min(
      b.h,
      430
    );


  /*
    building shadow
  */

  ctx.fillStyle =
    "rgba(25,35,38,.19)";


  ctx.beginPath();

  ctx.moveTo(
    x+30,
    y+80
  );

  ctx.lineTo(
    x+b.w+75,
    y+130
  );

  ctx.lineTo(
    x+b.w+75,
    y+visualHeight+70
  );

  ctx.lineTo(
    x+30,
    y+visualHeight+20
  );

  ctx.closePath();

  ctx.fill();


  /*
    facade
  */

  let facade;


  if (
    b.type === "glass"
  ) {

    facade =
      ctx.createLinearGradient(
        x,
        y,
        x+b.w,
        y
      );


    facade.addColorStop(
      0,
      "#66838d"
    );

    facade.addColorStop(
      .45,
      "#9ab1b5"
    );

    facade.addColorStop(
      .7,
      "#55747f"
    );

    facade.addColorStop(
      1,
      "#78929a"
    );

  }

  else if (
    b.type === "stone"
  ) {

    facade =
      "#b5afa3";

  }

  else {

    facade =
      "#8b9696";

  }


  ctx.fillStyle =
    facade;


  ctx.fillRect(
    x,
    y-visualHeight,
    b.w,
    visualHeight
  );


  /*
    side face
  */

  ctx.fillStyle =
    "rgba(52,65,67,.35)";


  ctx.beginPath();

  ctx.moveTo(
    x+b.w,
    y-visualHeight
  );

  ctx.lineTo(
    x+b.w+35,
    y-visualHeight+25
  );

  ctx.lineTo(
    x+b.w+35,
    y+25
  );

  ctx.lineTo(
    x+b.w,
    y
  );

  ctx.closePath();

  ctx.fill();


  /*
    windows
  */

  const floorHeight =
    visualHeight /
    b.floors;


  for (
    let floor=0;
    floor<b.floors;
    floor++
  ) {

    const yy =
      y -
      visualHeight +
      floor *
      floorHeight;


    for (
      let xx=16;
      xx<b.w-12;
      xx+=39
    ) {

      const seed =
        b.x +
        floor*77 +
        xx;


      if (
        b.type === "glass"
      ) {

        ctx.fillStyle =
          noise(seed) > .73
          ?
          "rgba(213,227,218,.65)"
          :
          "rgba(38,66,75,.48)";

      }

      else {

        ctx.fillStyle =
          noise(seed) > .8
          ?
          "#d8c99a"
          :
          "#53666a";

      }


      ctx.fillRect(
        x+xx,
        yy+8,
        28,
        Math.max(
          8,
          floorHeight-15
        )
      );

    }


    ctx.strokeStyle =
      "rgba(255,255,255,.13)";


    ctx.beginPath();

    ctx.moveTo(
      x,
      yy
    );

    ctx.lineTo(
      x+b.w,
      yy
    );

    ctx.stroke();

  }


  /*
    vertical facade lines
  */

  ctx.strokeStyle =
    "rgba(28,48,53,.25)";

  ctx.lineWidth =
    2;


  for (
    let xx=0;
    xx<b.w;
    xx+=78
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x+xx,
      y-visualHeight
    );

    ctx.lineTo(
      x+xx,
      y
    );

    ctx.stroke();

  }


  /*
    roof equipment
  */

  ctx.fillStyle =
    "#697475";


  ctx.fillRect(
    x+b.w*.2,
    y-visualHeight-17,
    60,
    17
  );


  ctx.fillRect(
    x+b.w*.68,
    y-visualHeight-25,
    45,
    25
  );


  /*
    entrance
  */

  const entranceW =
    115;


  ctx.fillStyle =
    "#30484e";


  ctx.fillRect(
    x+b.w/2-entranceW/2,
    y-72,
    entranceW,
    72
  );


  ctx.strokeStyle =
    "#b7c3c0";


  ctx.beginPath();

  ctx.moveTo(
    x+b.w/2,
    y-70
  );

  ctx.lineTo(
    x+b.w/2,
    y-3
  );

  ctx.stroke();


  /*
    canopy
  */

  ctx.fillStyle =
    "#414d4f";


  ctx.fillRect(
    x+b.w/2-85,
    y-80,
    170,
    9
  );


  /*
    building name
  */

  if (
    b.name
  ) {

    ctx.fillStyle =
      "rgba(238,242,237,.92)";


    ctx.font =
      "16px sans-serif";

    ctx.textAlign =
      "center";


    ctx.fillText(
      b.name,
      x+b.w/2,
      y-102
    );

  }

}


/* ==========================================================
   STREET TREES
========================================================== */

const streetTrees=[];


for (
  let y=300;
  y<2850;
  y+=260
) {

  streetTrees.push({
    x:720,
    y:y
  });

  streetTrees.push({
    x:1880,
    y:y+110
  });

}


function drawStreetTree(t) {

  const p =
    screen(
      t.x,
      t.y
    );


  /*
    pavement opening
  */

  ctx.fillStyle =
    "#6d7169";


  ctx.fillRect(
    p.x-25,
    p.y-10,
    50,
    25
  );


  /*
    shadow
  */

  ctx.fillStyle =
    "rgba(28,42,31,.17)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+20,
    p.y+8,
    45,
    13,
    .15,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
    trunk
  */

  ctx.strokeStyle =
    "#665744";

  ctx.lineWidth =
    10;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-67
  );

  ctx.stroke();


  /*
    crown
  */

  const leaves = [

    [-23,-79,28],
    [8,-91,34],
    [34,-74,25],
    [-5,-62,31]

  ];


  leaves.forEach(
    (l,i) => {

      ctx.fillStyle =
        i%2
        ?
        "#557451"
        :
        "#63805a";


      ctx.beginPath();

      ctx.arc(
        p.x+l[0],
        p.y+l[1],
        l[2],
        0,
        Math.PI*2
      );

      ctx.fill();

    }
  );

}


/* ==========================================================
   TRAFFIC LIGHT
========================================================== */

const trafficLights = [

  [820,1900],
  [1780,1900],
  [820,900],
  [1780,900]

];


function drawTrafficLight(
  x,
  y,
  time
) {

  const p =
    screen(x,y);


  ctx.strokeStyle =
    "#3e4848";

  ctx.lineWidth =
    7;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-95
  );

  ctx.lineTo(
    p.x+38,
    p.y-95
  );

  ctx.stroke();


  ctx.fillStyle =
    "#283234";


  ctx.fillRect(
    p.x+25,
    p.y-111,
    30,
    52
  );


  const cycle =
    Math.floor(
      time/5000
    ) % 2;


  ctx.fillStyle =
    cycle
    ?
    "#d94f42"
    :
    "#523733";


  ctx.beginPath();

  ctx.arc(
    p.x+40,
    p.y-98,
    7,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    cycle
    ?
    "#30453b"
    :
    "#4ea65d";


  ctx.beginPath();

  ctx.arc(
    p.x+40,
    p.y-75,
    7,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* ==========================================================
   METRO ENTRANCE
========================================================== */

function drawMetroEntrance(
  x,
  y
) {

  const p =
    screen(x,y);


  /*
    stairs
  */

  ctx.fillStyle =
    "#646c6d";


  ctx.beginPath();

  ctx.moveTo(
    p.x-50,
    p.y
  );

  ctx.lineTo(
    p.x+50,
    p.y
  );

  ctx.lineTo(
    p.x+35,
    p.y+55
  );

  ctx.lineTo(
    p.x-35,
    p.y+55
  );

  ctx.closePath();

  ctx.fill();


  for (
    let yy=8;
    yy<50;
    yy+=8
  ) {

    ctx.strokeStyle =
      "rgba(230,230,225,.3)";


    ctx.beginPath();

    ctx.moveTo(
      p.x-45+yy*.2,
      p.y+yy
    );

    ctx.lineTo(
      p.x+45-yy*.2,
      p.y+yy
    );

    ctx.stroke();

  }


  /*
    entrance frame
  */

  ctx.strokeStyle =
    "#445357";

  ctx.lineWidth =
    6;


  ctx.strokeRect(
    p.x-55,
    p.y-55,
    110,
    58
  );


  /*
    metro sign
  */

  ctx.fillStyle =
    "#b63e3d";


  ctx.beginPath();

  ctx.arc(
    p.x-40,
    p.y-68,
    14,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "white";

  ctx.font =
    "bold 14px sans-serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "M",
    p.x-40,
    p.y-63
  );


  ctx.fillStyle =
    "#33454a";

  ctx.font =
    "11px sans-serif";

  ctx.fillText(
    "地铁",
    p.x+5,
    p.y-65
  );

}


/* ==========================================================
   BIKE
========================================================== */

const bikes = [

  [650,2180],
  [690,2200],
  [730,2220],

  [1910,1320],
  [1950,1340],

  [660,650],
  [700,670]

];


function drawBike(
  x,
  y
) {

  const p =
    screen(x,y);


  ctx.strokeStyle =
    "#4a5555";

  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.arc(
    p.x-10,
    p.y,
    7,
    0,
    Math.PI*2
  );

  ctx.arc(
    p.x+12,
    p.y,
    7,
    0,
    Math.PI*2
  );

  ctx.stroke();


  ctx.strokeStyle =
    "#d4b844";


  ctx.beginPath();

  ctx.moveTo(
    p.x-10,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-12
  );

  ctx.lineTo(
    p.x+12,
    p.y
  );

  ctx.lineTo(
    p.x-2,
    p.y
  );

  ctx.lineTo(
    p.x-10,
    p.y
  );

  ctx.stroke();

}


/* ==========================================================
   BENCH
========================================================== */

const benches = [

  [620,1750],
  [1940,2350],
  [620,1100]

];


function drawBench(
  x,
  y
) {

  const p =
    screen(x,y);


  ctx.fillStyle =
    "#6a5140";


  ctx.fillRect(
    p.x-28,
    p.y-15,
    56,
    7
  );


  ctx.fillRect(
    p.x-28,
    p.y-5,
    56,
    7
  );


  ctx.fillStyle =
    "#414849";


  ctx.fillRect(
    p.x-23,
    p.y+2,
    5,
    15
  );


  ctx.fillRect(
    p.x+18,
    p.y+2,
    5,
    15
  );

}


/* ==========================================================
   MANHOLES
========================================================== */

function drawManholes() {

  const positions = [

    [1000,1600],
    [1550,2300],
    [1200,720],
    [1450,1150]

  ];


  positions.forEach(
    m => {

      const p =
        screen(
          m[0],
          m[1]
        );


      ctx.fillStyle =
        "#3f4444";


      ctx.beginPath();

      ctx.ellipse(
        p.x,
        p.y,
        19,
        8,
        0,
        0,
        Math.PI*2
      );

      ctx.fill();


      ctx.strokeStyle =
        "#656969";


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

      ctx.stroke();

    }
  );

}


/* ==========================================================
   CAR
========================================================== */

const cars = [

  {
    x:1000,
    y:300,
    dir:1,
    speed:80,
    color:"#d8d9d4"
  },

  {
    x:1210,
    y:1800,
    dir:-1,
    speed:100,
    color:"#404b50"
  },

  {
    x:1430,
    y:700,
    dir:1,
    speed:90,
    color:"#c6c8c5"
  },

  {
    x:1630,
    y:2400,
    dir:-1,
    speed:110,
    color:"#596a73"
  }

];


function updateCars(dt) {

  cars.forEach(
    car => {

      car.y +=
        car.speed *
        car.dir *
        dt;


      if (
        car.dir > 0 &&
        car.y >
        WORLD.height+200
      ) {

        car.y=-200;

      }


      if (
        car.dir < 0 &&
        car.y <
        -200
      ) {

        car.y =
          WORLD.height+200;

      }

    }
  );

}


function drawCar(car) {

  const p =
    screen(
      car.x,
      car.y
    );


  ctx.fillStyle =
    "rgba(20,25,25,.22)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+8,
    p.y+8,
    24,
    9,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    car.color;


  ctx.beginPath();

  ctx.roundRect(
    p.x-18,
    p.y-33,
    36,
    58,
    8
  );

  ctx.fill();


  /*
    windows
  */

  ctx.fillStyle =
    "#455b63";


  ctx.fillRect(
    p.x-13,
    p.y-20,
    26,
    16
  );


  ctx.fillRect(
    p.x-13,
    p.y+5,
    26,
    11
  );


  /*
    lights
  */

  ctx.fillStyle =
    car.dir > 0
    ?
    "#c7d7bd"
    :
    "#b84b42";


  ctx.fillRect(
    p.x-13,
    car.dir>0
      ? p.y+19
      : p.y-29,
    7,
    4
  );


  ctx.fillRect(
    p.x+6,
    car.dir>0
      ? p.y+19
      : p.y-29,
    7,
    4
  );

}


/* ==========================================================
   PEOPLE
========================================================== */

const pedestrians = [

  [700,2450,"#526f82"],
  [1880,2150,"#876354"],

  [680,1880,"#556f57"],
  [1910,1740,"#6e5772"],

  [710,1280,"#795e4f"],
  [1870,1080,"#4e6879"],

  [680,520,"#6c6a51"],
  [1900,480,"#765e68"]

];


function drawPerson(
  x,
  y,
  color,
  playerMode=false
) {

  const p =
    screen(x,y);


  let bob=0;


  if (
    playerMode &&
    player.moving
  ) {

    bob =
      Math.sin(
        player.step
      ) * 2;

  }


  /*
    shadow
  */

  ctx.fillStyle =
    "rgba(25,30,30,.24)";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+10,
    14,
    5,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
    legs
  */

  ctx.fillStyle =
    "#33383a";


  ctx.fillRect(
    p.x-7,
    p.y-2+bob,
    5,
    16
  );


  ctx.fillRect(
    p.x+2,
    p.y-2+bob,
    5,
    16
  );


  /*
    torso
  */

  ctx.fillStyle =
    color;


  ctx.beginPath();

  ctx.roundRect(
    p.x-11,
    p.y-29+bob,
    22,
    30,
    4
  );

  ctx.fill();


  /*
    head
  */

  ctx.fillStyle =
    "#d9aa84";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-38+bob,
    9,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
    hair
  */

  ctx.fillStyle =
    "#292827";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-41+bob,
    9,
    Math.PI,
    Math.PI*2
  );

  ctx.fill();


  if (
    playerMode
  ) {

    ctx.fillStyle =
      "#e2c85d";


    ctx.fillRect(
      p.x-11,
      p.y-28+bob,
      22,
      3
    );

  }

}


/* ==========================================================
   STREET SIGNS
========================================================== */

function drawStreetSign(
  x,
  y,
  text
) {

  const p =
    screen(x,y);


  ctx.strokeStyle =
    "#596463";

  ctx.lineWidth =
    4;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-58
  );

  ctx.stroke();


  ctx.fillStyle =
    "#376b61";


  ctx.fillRect(
    p.x-45,
    p.y-73,
    90,
    20
  );


  ctx.fillStyle =
    "white";


  ctx.font =
    "10px sans-serif";

  ctx.textAlign =
    "center";


  ctx.fillText(
    text,
    p.x,
    p.y-59
  );

}


/* ==========================================================
   OBJECT DEPTH
========================================================== */

function drawObjects(time) {

  const objects=[];


  cityBuildings.forEach(
    b => {

      objects.push({

        y:b.y,

        draw:
          () =>
            drawBuilding(b)

      });

    }
  );


  streetTrees.forEach(
    t => {

      objects.push({

        y:t.y,

        draw:
          () =>
            drawStreetTree(t)

      });

    }
  );


  trafficLights.forEach(
    t => {

      objects.push({

        y:t[1],

        draw:
          () =>
            drawTrafficLight(
              t[0],
              t[1],
              time
            )

      });

    }
  );


  pedestrians.forEach(
    p => {

      objects.push({

        y:p[1],

        draw:
          () =>
            drawPerson(
              p[0],
              p[1],
              p[2]
            )

      });

    }
  );


  bikes.forEach(
    b => {

      objects.push({

        y:b[1],

        draw:
          () =>
            drawBike(
              b[0],
              b[1]
            )

      });

    }
  );


  benches.forEach(
    b => {

      objects.push({

        y:b[1],

        draw:
          () =>
            drawBench(
              b[0],
              b[1]
            )

      });

    }
  );


  cars.forEach(
    car => {

      objects.push({

        y:car.y,

        draw:
          () =>
            drawCar(car)

      });

    }
  );


  objects.push({

    y:player.y,

    draw:
      () =>
        drawPerson(
          player.x,
          player.y,
          "#3c675a",
          true
        )

  });


  objects.sort(
    (a,b) =>
      a.y-b.y
  );


  objects.forEach(
    o => o.draw()
  );

}


/* ==========================================================
   SMALL STREET DETAILS
========================================================== */

function drawStreetDetails() {

  /*
    metro entrances
  */

  drawMetroEntrance(
    650,
    2300
  );

  drawMetroEntrance(
    1940,
    750
  );


  /*
    signs
  */

  drawStreetSign(
    760,
    1480,
    "钱江路"
  );


  drawStreetSign(
    1840,
    520,
    "市民中心"
  );


  /*
    manholes
  */

  drawManholes();


  /*
    planters
  */

  const planters = [

    [620,1980],
    [1980,1880],
    [620,820],
    [1980,1180]

  ];


  planters.forEach(
    p => {

      const q =
        screen(
          p[0],
          p[1]
        );


      ctx.fillStyle =
        "#727b73";


      ctx.fillRect(
        q.x-24,
        q.y-9,
        48,
        18
      );


      ctx.fillStyle =
        "#56744f";


      for (
        let i=-17;
        i<=17;
        i+=8
      ) {

        ctx.beginPath();

        ctx.arc(
          q.x+i,
          q.y-11,
          8,
          0,
          Math.PI*2
        );

        ctx.fill();

      }

    }
  );

}


/* ==========================================================
   ATMOSPHERE
========================================================== */

function drawAtmosphere() {

  /*
    sunlight
  */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  const g =
    ctx.createLinearGradient(
      0,
      0,
      VW,
      VH
    );


  g.addColorStop(
    0,
    "rgba(255,244,195,.11)"
  );

  g.addColorStop(
    .55,
    "rgba(255,244,195,.015)"
  );

  g.addColorStop(
    1,
    "rgba(255,244,195,0)"
  );


  ctx.fillStyle = g;

  ctx.fillRect(
    0,
    0,
    VW,
    VH
  );

  ctx.restore();


  /*
    distant haze
  */

  const haze =
    ctx.createLinearGradient(
      0,
      0,
      0,
      VH
    );


  haze.addColorStop(
    0,
    "rgba(225,234,232,.12)"
  );

  haze.addColorStop(
    .5,
    "rgba(225,234,232,0)"
  );

  haze.addColorStop(
    1,
    "rgba(20,32,35,.025)"
  );


  ctx.fillStyle =
    haze;

  ctx.fillRect(
    0,
    0,
    VW,
    VH
  );

}


/* ==========================================================
   DRAW
========================================================== */

function draw(time) {

  ctx.clearRect(
    0,
    0,
    VW,
    VH
  );


  drawSky();

  drawSkyline();

  drawGround();

  drawSidewalk();

  drawRoad();

  drawTactilePaving();


  /*
    intersections
  */

  drawCrosswalk(1850);
  drawCrosswalk(850);


  drawStreetDetails();

  drawObjects(time);

  drawAtmosphere();

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

  updateCars(dt);

  draw(time);


  requestAnimationFrame(
    loop
  );

}


requestAnimationFrame(
  loop
);
