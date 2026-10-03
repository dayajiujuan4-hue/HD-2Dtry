/* ==========================================================
   杭州探索録 3
   都市杭州
   Perspective Prototype Ver.0.2

   目的：
   ・完全俯瞰をやめる
   ・3/4ビュー
   ・正面壁を大きく見せる
   ・奥ほど小さく
   ・手前ほど巨大に
   ・HD-2D的な前景 / 中景 / 遠景
========================================================== */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");


let W = 0;
let H = 0;

const DPR =
  Math.min(
    window.devicePixelRatio || 1,
    2
  );


/* ==========================================================
   RESIZE
========================================================== */

function resize() {

  W =
    window.innerWidth;

  H =
    window.innerHeight;


  canvas.width =
    W * DPR;

  canvas.height =
    H * DPR;


  canvas.style.width =
    W + "px";

  canvas.style.height =
    H + "px";


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

   x = 横方向
   y = 奥行き

   y が小さいほど奥
   y が大きいほど手前
========================================================== */

const WORLD = {

  width: 2200,
  height: 3600

};


/* ==========================================================
   CAMERA

   今回は画面中央ではなく
   少し下にプレイヤーを置く
========================================================== */

const camera = {

  x: 1100,
  y: 2850

};


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x: 1100,
  y: 2850,

  speed: 270,

  moving: false,

  direction: "up",

  step: 0

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


function noise(n) {

  const x =
    Math.sin(
      n * 12.9898
    ) *
    43758.5453;

  return x -
    Math.floor(x);

}


/* ==========================================================
   PERSPECTIVE

   ここが今回の核心。

   world y の距離によって
   横方向・縦方向の見え方を変える。

   画面上端 = 遠景
   画面下端 = 手前
========================================================== */

const VIEW = {

  horizon:
    150,

  playerScreenY:
    0.72,

  depthScale:
    0.48,

  perspective:
    0.00034

};


/* ==========================================================
   WORLD → SCREEN

   単なる x-camera.x / y-camera.y
   ではない。

   奥ほど横方向も縮める。
========================================================== */

function project(
  x,
  y,
  z = 0
) {

  const dy =
    y -
    camera.y;


  /*
     奥ほど小さい
     手前ほど大きい
  */

  let scale =
    1 +
    dy *
    VIEW.perspective;


  scale =
    clamp(
      scale,
      .46,
      1.55
    );


  const screenY =
    H *
    VIEW.playerScreenY +
    dy *
    VIEW.depthScale;


  const screenX =
    W / 2 +
    (
      x -
      camera.x
    ) *
    scale;


  return {

    x:
      screenX,

    y:
      screenY -
      z *
      scale,

    scale

  };

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
      dt * 10;

  }


  player.x =
    clamp(
      player.x,
      700,
      1500
    );


  player.y =
    clamp(
      player.y,
      350,
      WORLD.height - 100
    );


  /*
     camera follow
  */

  camera.x +=
    (
      player.x -
      camera.x
    ) *
    .075;


  camera.y +=
    (
      player.y -
      camera.y
    ) *
    .07;

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
      H
    );


  gradient.addColorStop(
    0,
    "#8ebdce"
  );


  gradient.addColorStop(
    .35,
    "#c5d6d5"
  );


  gradient.addColorStop(
    .58,
    "#d6d8cc"
  );


  gradient.addColorStop(
    1,
    "#a5aaa1"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );

}


/* ==========================================================
   CLOUDS / HAZE
========================================================== */

function drawClouds(time) {

  ctx.save();

  ctx.globalAlpha =
    .15;


  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const x =
      (
        i * 240 +
        time * .006
      ) %
      (
        W + 300
      ) -
      150;


    const y =
      80 +
      noise(i*7) *
      140;


    ctx.fillStyle =
      "#ffffff";


    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      110,
      28,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();

  }

  ctx.restore();

}


/* ==========================================================
   DISTANT HANGZHOU SKYLINE
========================================================== */

function drawDistantSkyline() {

  const base =
    VIEW.horizon + 150;


  const towers = [

    [-80,170,75],
    [10,230,80],
    [105,150,65],
    [180,300,95],
    [290,210,72],

    [380,350,105],
    [500,190,75],
    [585,280,90],

    [690,390,110],
    [815,220,75],

    [900,320,100],
    [1015,180,70],

    [1090,420,115],

    [1220,270,90],
    [1320,205,75],

    [1410,360,110],
    [1530,230,82],

    [1625,315,95],
    [1740,190,70],

    [1815,270,85]

  ];


  ctx.save();

  ctx.globalAlpha =
    .43;


  towers.forEach(
    (b,index) => {

      const x =
        b[0] /
        1900 *
        (
          W + 200
        );


      const height =
        b[1];


      const width =
        b[2];


      ctx.fillStyle =
        index % 3 === 0
        ?
        "#58737d"
        :
        "#6e858b";


      ctx.fillRect(
        x,
        base-height,
        width,
        height
      );


      /*
        distant windows
      */

      ctx.fillStyle =
        "rgba(216,229,226,.18)";


      for (
        let yy =
          base-height+15;
        yy <
          base-15;
        yy += 18
      ) {

        ctx.fillRect(
          x+8,
          yy,
          width-16,
          2
        );

      }

    }
  );


  ctx.restore();


  /*
    atmospheric haze
  */

  const haze =
    ctx.createLinearGradient(
      0,
      80,
      0,
      390
    );


  haze.addColorStop(
    0,
    "rgba(225,237,234,.05)"
  );


  haze.addColorStop(
    .65,
    "rgba(225,237,234,.18)"
  );


  haze.addColorStop(
    1,
    "rgba(225,237,234,.65)"
  );


  ctx.fillStyle =
    haze;


  ctx.fillRect(
    0,
    60,
    W,
    350
  );

}


/* ==========================================================
   ROAD GEOMETRY

   道路そのものを
   台形として描く。
========================================================== */

const road = {

  center:
    1100,

  halfWidth:
    330

};


/* ==========================================================
   ROAD QUAD
========================================================== */

function drawRoad() {

  const farY =
    camera.y -
    1500;


  const nearY =
    camera.y +
    950;


  const farLeft =
    project(
      road.center -
      road.halfWidth,
      farY
    );


  const farRight =
    project(
      road.center +
      road.halfWidth,
      farY
    );


  const nearLeft =
    project(
      road.center -
      road.halfWidth,
      nearY
    );


  const nearRight =
    project(
      road.center +
      road.halfWidth,
      nearY
    );


  /*
    sidewalk background
  */

  ctx.fillStyle =
    "#aaa99f";


  ctx.beginPath();

  ctx.moveTo(
    farLeft.x - 220,
    farLeft.y
  );

  ctx.lineTo(
    farRight.x + 220,
    farRight.y
  );

  ctx.lineTo(
    nearRight.x + 450,
    nearRight.y
  );

  ctx.lineTo(
    nearLeft.x - 450,
    nearLeft.y
  );

  ctx.closePath();

  ctx.fill();


  /*
    asphalt
  */

  ctx.fillStyle =
    "#4c5153";


  ctx.beginPath();

  ctx.moveTo(
    farLeft.x,
    farLeft.y
  );

  ctx.lineTo(
    farRight.x,
    farRight.y
  );

  ctx.lineTo(
    nearRight.x,
    nearRight.y
  );

  ctx.lineTo(
    nearLeft.x,
    nearLeft.y
  );

  ctx.closePath();

  ctx.fill();


  /*
    asphalt grain
  */

  for (
    let i=0;
    i<280;
    i++
  ) {

    const y =
      camera.y -
      1300 +
      noise(i*17) *
      2200;


    const x =
      road.center -
      road.halfWidth +
      noise(i*29) *
      road.halfWidth*2;


    const p =
      project(x,y);


    if (
      p.y < 250 ||
      p.y > H+40
    ) continue;


    ctx.fillStyle =
      i%2
      ?
      "rgba(255,255,255,.035)"
      :
      "rgba(0,0,0,.045)";


    const size =
      1.5 *
      p.scale;


    ctx.fillRect(
      p.x,
      p.y,
      size,
      size
    );

  }

}


/* ==========================================================
   ROAD MARKINGS
========================================================== */

function drawLaneMarkings() {

  const lanes = [

    road.center - 110,
    road.center + 110

  ];


  lanes.forEach(
    laneX => {

      for (
        let y =
          camera.y - 1500;
        y <
          camera.y + 1000;
        y += 150
      ) {

        const a =
          project(
            laneX,
            y
          );


        const b =
          project(
            laneX,
            y + 70
          );


        ctx.strokeStyle =
          "rgba(238,237,225,.88)";


        ctx.lineWidth =
          Math.max(
            2,
            5*a.scale
          );


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

    }
  );


  /*
     road edges
  */

  for (
    const x of [
      road.center-road.halfWidth+20,
      road.center+road.halfWidth-20
    ]
  ) {

    const a =
      project(
        x,
        camera.y-1500
      );


    const b =
      project(
        x,
        camera.y+1000
      );


    ctx.strokeStyle =
      "rgba(240,239,229,.9)";


    ctx.lineWidth =
      5;


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

}


/* ==========================================================
   SIDEWALK TILES
========================================================== */

function drawSidewalkDetails() {

  for (
    let y =
      camera.y - 1400;
    y <
      camera.y + 1000;
    y += 65
  ) {

    const leftA =
      project(
        road.center-road.halfWidth-210,
        y
      );


    const leftB =
      project(
        road.center-road.halfWidth,
        y
      );


    const rightA =
      project(
        road.center+road.halfWidth,
        y
      );


    const rightB =
      project(
        road.center+road.halfWidth+210,
        y
      );


    ctx.strokeStyle =
      "rgba(74,77,73,.16)";


    ctx.lineWidth =
      Math.max(
        .5,
        leftA.scale
      );


    ctx.beginPath();

    ctx.moveTo(
      leftA.x,
      leftA.y
    );

    ctx.lineTo(
      leftB.x,
      leftB.y
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      rightA.x,
      rightA.y
    );

    ctx.lineTo(
      rightB.x,
      rightB.y
    );

    ctx.stroke();

  }

}


/* ==========================================================
   TACTILE PAVING
========================================================== */

function drawTactilePaving() {

  for (
    const x of [
      road.center-road.halfWidth-80,
      road.center+road.halfWidth+80
    ]
  ) {

    for (
      let y =
        camera.y-1400;
      y <
        camera.y+950;
      y += 25
    ) {

      const a =
        project(
          x,
          y
        );


      const b =
        project(
          x,
          y+28
        );


      ctx.strokeStyle =
        "#d3ae42";


      ctx.lineWidth =
        Math.max(
          3,
          11*a.scale
        );


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

  }

}


/* ==========================================================
   CROSSWALK
========================================================== */

function drawCrosswalk(
  worldY
) {

  for (
    let x =
      road.center-road.halfWidth+25;
    x <
      road.center+road.halfWidth-20;
    x += 55
  ) {

    const a =
      project(
        x,
        worldY
      );


    const b =
      project(
        x+34,
        worldY+105
      );


    const c =
      project(
        x+34,
        worldY
      );


    const d =
      project(
        x,
        worldY+105
      );


    ctx.fillStyle =
      "rgba(235,235,226,.9)";


    ctx.beginPath();

    ctx.moveTo(
      a.x,
      a.y
    );

    ctx.lineTo(
      c.x,
      c.y
    );

    ctx.lineTo(
      b.x,
      b.y
    );

    ctx.lineTo(
      d.x,
      d.y
    );

    ctx.closePath();

    ctx.fill();

  }

}


/* ==========================================================
   CITY BUILDINGS
========================================================== */

const buildings = [

  {
    side:-1,
    x:570,
    y:3250,
    width:390,
    height:520,
    depth:170,
    type:"glass",
    name:"杭州中心"
  },

  {
    side:1,
    x:1630,
    y:3170,
    width:420,
    height:590,
    depth:190,
    type:"dark",
    name:"HANGZHOU"
  },

  {
    side:-1,
    x:530,
    y:2600,
    width:430,
    height:660,
    depth:180,
    type:"silver",
    name:"钱江商务"
  },

  {
    side:1,
    x:1650,
    y:2470,
    width:430,
    height:720,
    depth:190,
    type:"glass",
    name:"城市广场"
  },

  {
    side:-1,
    x:550,
    y:1850,
    width:420,
    height:760,
    depth:170,
    type:"dark",
    name:""
  },

  {
    side:1,
    x:1640,
    y:1700,
    width:440,
    height:820,
    depth:200,
    type:"silver",
    name:""
  },

  {
    side:-1,
    x:590,
    y:1100,
    width:390,
    height:840,
    depth:170,
    type:"glass",
    name:""
  },

  {
    side:1,
    x:1620,
    y:900,
    width:420,
    height:900,
    depth:180,
    type:"dark",
    name:""
  }

];


/* ==========================================================
   BUILDING DRAW

   今回は
   正面
   側面
   屋上
   の3面を描画する
========================================================== */

function drawBuilding(b) {

  const base =
    project(
      b.x,
      b.y
    );


  if (
    base.y < -700 ||
    base.y > H+600
  ) return;


  const s =
    base.scale;


  const width =
    b.width * s;


  const height =
    b.height * s;


  const depthX =
    b.side *
    b.depth *
    .42 *
    s;


  const depthY =
    -b.depth *
    .18 *
    s;


  const x =
    base.x -
    (
      b.side < 0
      ?
      width
      :
      0
    );


  const y =
    base.y;


  /*
     ground shadow
  */

  ctx.fillStyle =
    "rgba(20,31,34,.18)";


  ctx.beginPath();

  ctx.moveTo(
    x,
    y
  );

  ctx.lineTo(
    x+width,
    y
  );

  ctx.lineTo(
    x+width+90*s,
    y+35*s
  );

  ctx.lineTo(
    x+70*s,
    y+40*s
  );

  ctx.closePath();

  ctx.fill();


  /*
     front facade
  */

  let frontColor;


  if (
    b.type === "glass"
  ) {

    frontColor =
      "#63808a";

  }

  else if (
    b.type === "dark"
  ) {

    frontColor =
      "#46575c";

  }

  else {

    frontColor =
      "#7d898b";

  }


  ctx.fillStyle =
    frontColor;


  ctx.fillRect(
    x,
    y-height,
    width,
    height
  );


  /*
     side wall
  */

  ctx.fillStyle =
    b.side < 0
    ?
    "#394c53"
    :
    "#53676c";


  ctx.beginPath();

  if (
    b.side < 0
  ) {

    ctx.moveTo(
      x,
      y-height
    );

    ctx.lineTo(
      x+depthX,
      y-height+depthY
    );

    ctx.lineTo(
      x+depthX,
      y+depthY
    );

    ctx.lineTo(
      x,
      y
    );

  }

  else {

    ctx.moveTo(
      x+width,
      y-height
    );

    ctx.lineTo(
      x+width+depthX,
      y-height+depthY
    );

    ctx.lineTo(
      x+width+depthX,
      y+depthY
    );

    ctx.lineTo(
      x+width,
      y
    );

  }

  ctx.closePath();

  ctx.fill();


  /*
     rooftop
  */

  ctx.fillStyle =
    "#78888a";


  ctx.beginPath();

  ctx.moveTo(
    x,
    y-height
  );

  ctx.lineTo(
    x+width,
    y-height
  );

  ctx.lineTo(
    x+width+depthX,
    y-height+depthY
  );

  ctx.lineTo(
    x+depthX,
    y-height+depthY
  );

  ctx.closePath();

  ctx.fill();


  /*
     horizontal floor lines
  */

  const floors =
    Math.max(
      8,
      Math.floor(
        b.height / 48
      )
    );


  for (
    let floor=1;
    floor<floors;
    floor++
  ) {

    const fy =
      y -
      height +
      floor *
      height /
      floors;


    ctx.strokeStyle =
      "rgba(225,238,238,.18)";


    ctx.lineWidth =
      Math.max(
        .7,
        1.2*s
      );


    ctx.beginPath();

    ctx.moveTo(
      x,
      fy
    );

    ctx.lineTo(
      x+width,
      fy
    );

    ctx.stroke();

  }


  /*
     vertical window columns
  */

  const columns =
    Math.max(
      5,
      Math.floor(
        b.width / 48
      )
    );


  for (
    let column=1;
    column<columns;
    column++
  ) {

    const fx =
      x +
      column *
      width /
      columns;


    ctx.strokeStyle =
      "rgba(30,52,58,.36)";


    ctx.lineWidth =
      Math.max(
        1,
        2*s
      );


    ctx.beginPath();

    ctx.moveTo(
      fx,
      y-height
    );

    ctx.lineTo(
      fx,
      y
    );

    ctx.stroke();

  }


  /*
     random illuminated windows
  */

  for (
    let floor=1;
    floor<floors-1;
    floor++
  ) {

    for (
      let column=0;
      column<columns;
      column++
    ) {

      const seed =
        b.x +
        b.y +
        floor*37 +
        column*71;


      if (
        noise(seed) < .78
      ) continue;


      const cellW =
        width /
        columns;


      const cellH =
        height /
        floors;


      ctx.fillStyle =
        "rgba(221,220,176,.22)";


      ctx.fillRect(
        x +
        column*cellW +
        cellW*.18,

        y -
        height +
        floor*cellH +
        cellH*.18,

        cellW*.64,

        cellH*.55
      );

    }

  }


  /*
     glass reflection
  */

  if (
    b.type === "glass"
  ) {

    const reflection =
      ctx.createLinearGradient(
        x,
        y-height,
        x+width,
        y
      );


    reflection.addColorStop(
      0,
      "rgba(210,236,238,.23)"
    );


    reflection.addColorStop(
      .4,
      "rgba(210,236,238,.02)"
    );


    reflection.addColorStop(
      .65,
      "rgba(255,255,255,.14)"
    );


    reflection.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );


    ctx.fillStyle =
      reflection;


    ctx.fillRect(
      x,
      y-height,
      width,
      height
    );

  }


  /*
     rooftop equipment
  */

  ctx.fillStyle =
    "#566568";


  ctx.fillRect(
    x +
    width*.2 +
    depthX*.15,

    y -
    height -
    17*s +
    depthY*.4,

    width*.17,

    17*s
  );


  ctx.fillRect(
    x +
    width*.64,

    y -
    height -
    25*s +
    depthY*.2,

    width*.13,

    25*s
  );


  /*
     ground floor
  */

  const groundH =
    85*s;


  ctx.fillStyle =
    "#263c42";


  ctx.fillRect(
    x,
    y-groundH,
    width,
    groundH
  );


  /*
     shops
  */

  const shopCount =
    Math.max(
      2,
      Math.floor(
        b.width/130
      )
    );


  for (
    let i=0;
    i<shopCount;
    i++
  ) {

    const shopW =
      width /
      shopCount;


    ctx.fillStyle =
      i%2
      ?
      "#405d62"
      :
      "#334e54";


    ctx.fillRect(
      x +
      i*shopW +
      5*s,

      y -
      groundH +
      16*s,

      shopW -
      10*s,

      groundH -
      20*s
    );


    /*
       warm shop interior
    */

    ctx.fillStyle =
      "rgba(230,203,139,.32)";


    ctx.fillRect(
      x +
      i*shopW +
      11*s,

      y -
      groundH +
      22*s,

      shopW -
      22*s,

      groundH -
      34*s
    );

  }


  /*
     canopy
  */

  ctx.fillStyle =
    "#26383c";


  ctx.fillRect(
    x-8*s,
    y-groundH,
    width+16*s,
    10*s
  );


  /*
     signage
  */

  if (
    b.name
  ) {

    ctx.fillStyle =
      "rgba(241,242,231,.9)";


    ctx.font =
      `${Math.max(
        10,
        16*s
      )}px sans-serif`;


    ctx.textAlign =
      "center";


    ctx.fillText(
      b.name,
      x+width/2,
      y-groundH-14*s
    );

  }

}


/* ==========================================================
   STREET TREE
========================================================== */

function drawTree(
  x,
  y
) {

  const p =
    project(x,y);


  const s =
    p.scale;


  /*
     tree pit
  */

  ctx.fillStyle =
    "#6b7169";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    27*s,
    10*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     shadow
  */

  ctx.fillStyle =
    "rgba(24,42,30,.18)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+25*s,
    p.y+5*s,
    55*s,
    14*s,
    .1,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     trunk
  */

  ctx.strokeStyle =
    "#625442";


  ctx.lineWidth =
    10*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-75*s
  );

  ctx.stroke();


  /*
     crown
  */

  const leaves = [

    [-30,-90,31],
    [4,-105,37],
    [38,-88,29],
    [-8,-73,34],
    [23,-120,25]

  ];


  leaves.forEach(
    (leaf,index) => {

      ctx.fillStyle =
        index%2
        ?
        "#557653"
        :
        "#66835b";


      ctx.beginPath();

      ctx.arc(
        p.x +
        leaf[0]*s,

        p.y +
        leaf[1]*s,

        leaf[2]*s,

        0,
        Math.PI*2
      );

      ctx.fill();

    }
  );

}


/* ==========================================================
   STREET TREES DATA
========================================================== */

const trees=[];


for (
  let y=500;
  y<3500;
  y+=240
) {

  trees.push({

    x:
      road.center -
      road.halfWidth -
      145,

    y

  });


  trees.push({

    x:
      road.center +
      road.halfWidth +
      145,

    y:
      y+110

  });

}


/* ==========================================================
   LAMP POST
========================================================== */

function drawLampPost(
  x,
  y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  ctx.strokeStyle =
    "#3c484a";


  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-115*s
  );

  ctx.lineTo(
    p.x+28*s,
    p.y-115*s
  );

  ctx.stroke();


  ctx.fillStyle =
    "#d6d4b5";


  ctx.beginPath();

  ctx.ellipse(
    p.x+32*s,
    p.y-115*s,
    10*s,
    5*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* ==========================================================
   TRAFFIC LIGHT
========================================================== */

function drawTrafficLight(
  x,
  y,
  time
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  ctx.strokeStyle =
    "#3a4547";


  ctx.lineWidth =
    6*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-100*s
  );

  ctx.lineTo(
    p.x+45*s,
    p.y-100*s
  );

  ctx.stroke();


  ctx.fillStyle =
    "#253034";


  ctx.fillRect(
    p.x+32*s,
    p.y-117*s,
    30*s,
    57*s
  );


  const phase =
    Math.floor(
      time/4500
    ) % 2;


  ctx.fillStyle =
    phase
    ?
    "#d45248"
    :
    "#563a38";


  ctx.beginPath();

  ctx.arc(
    p.x+47*s,
    p.y-102*s,
    7*s,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    phase
    ?
    "#30463b"
    :
    "#53a867";


  ctx.beginPath();

  ctx.arc(
    p.x+47*s,
    p.y-77*s,
    7*s,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* ==========================================================
   METRO ENTRANCE
========================================================== */

function drawMetro(
  x,
  y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  /*
     stairs opening
  */

  ctx.fillStyle =
    "#4c5659";


  ctx.beginPath();

  ctx.moveTo(
    p.x-45*s,
    p.y
  );

  ctx.lineTo(
    p.x+45*s,
    p.y
  );

  ctx.lineTo(
    p.x+30*s,
    p.y+55*s
  );

  ctx.lineTo(
    p.x-30*s,
    p.y+55*s
  );

  ctx.closePath();

  ctx.fill();


  /*
     canopy
  */

  ctx.strokeStyle =
    "#53686c";


  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x-50*s,
    p.y
  );

  ctx.lineTo(
    p.x-50*s,
    p.y-65*s
  );

  ctx.lineTo(
    p.x+50*s,
    p.y-65*s
  );

  ctx.lineTo(
    p.x+50*s,
    p.y
  );

  ctx.stroke();


  /*
     glass
  */

  ctx.fillStyle =
    "rgba(150,193,201,.18)";


  ctx.fillRect(
    p.x-46*s,
    p.y-61*s,
    92*s,
    57*s
  );


  /*
     metro sign
  */

  ctx.fillStyle =
    "#b64242";


  ctx.beginPath();

  ctx.arc(
    p.x-34*s,
    p.y-78*s,
    14*s,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "#fff";


  ctx.font =
    `bold ${Math.max(
      8,
      13*s
    )}px sans-serif`;


  ctx.textAlign =
    "center";


  ctx.fillText(
    "M",
    p.x-34*s,
    p.y-73*s
  );

}


/* ==========================================================
   BIKE
========================================================== */

function drawBike(
  x,
  y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  ctx.strokeStyle =
    "#414d4e";


  ctx.lineWidth =
    2*s;


  ctx.beginPath();

  ctx.arc(
    p.x-11*s,
    p.y,
    8*s,
    0,
    Math.PI*2
  );


  ctx.arc(
    p.x+13*s,
    p.y,
    8*s,
    0,
    Math.PI*2
  );

  ctx.stroke();


  ctx.strokeStyle =
    "#d4b33f";


  ctx.beginPath();

  ctx.moveTo(
    p.x-11*s,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-14*s
  );

  ctx.lineTo(
    p.x+13*s,
    p.y
  );

  ctx.lineTo(
    p.x-2*s,
    p.y
  );

  ctx.lineTo(
    p.x-11*s,
    p.y
  );

  ctx.stroke();

}


/* ==========================================================
   STREET FURNITURE
========================================================== */

function drawBollard(
  x,
  y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  ctx.fillStyle =
    "#4d5757";


  ctx.beginPath();

  ctx.roundRect(
    p.x-4*s,
    p.y-22*s,
    8*s,
    24*s,
    3*s
  );

  ctx.fill();

}


/* ==========================================================
   CAR
========================================================== */

const cars = [

  {
    x:900,
    y:800,
    speed:105,
    dir:1,
    color:"#d8dad6"
  },

  {
    x:1040,
    y:2500,
    speed:125,
    dir:-1,
    color:"#34434a"
  },

  {
    x:1190,
    y:1500,
    speed:100,
    dir:1,
    color:"#bfc5c4"
  },

  {
    x:1370,
    y:3200,
    speed:130,
    dir:-1,
    color:"#5d727c"
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
        car.y >
        WORLD.height+300
      ) {

        car.y=-300;

      }


      if (
        car.y <
        -300
      ) {

        car.y =
          WORLD.height+300;

      }

    }
  );

}


/* ==========================================================
   CAR DRAW

   俯瞰車ではなく
   屋根＋フロント/リアを見せる
========================================================== */

function drawCar(car) {

  const p =
    project(
      car.x,
      car.y
    );


  const s =
    p.scale;


  const w =
    48*s;

  const h =
    70*s;


  /*
     shadow
  */

  ctx.fillStyle =
    "rgba(15,22,23,.23)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+8*s,
    p.y+6*s,
    30*s,
    10*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     car body
  */

  ctx.fillStyle =
    car.color;


  ctx.beginPath();

  ctx.roundRect(
    p.x-w/2,
    p.y-h,
    w,
    h,
    9*s
  );

  ctx.fill();


  /*
     cabin
  */

  ctx.fillStyle =
    "#40575f";


  ctx.beginPath();

  ctx.moveTo(
    p.x-w*.32,
    p.y-h*.73
  );

  ctx.lineTo(
    p.x+w*.32,
    p.y-h*.73
  );

  ctx.lineTo(
    p.x+w*.38,
    p.y-h*.37
  );

  ctx.lineTo(
    p.x-w*.38,
    p.y-h*.37
  );

  ctx.closePath();

  ctx.fill();


  /*
     windshield reflection
  */

  ctx.fillStyle =
    "rgba(190,221,225,.28)";


  ctx.beginPath();

  ctx.moveTo(
    p.x-w*.28,
    p.y-h*.69
  );

  ctx.lineTo(
    p.x+w*.22,
    p.y-h*.69
  );

  ctx.lineTo(
    p.x-w*.03,
    p.y-h*.43
  );

  ctx.lineTo(
    p.x-w*.30,
    p.y-h*.43
  );

  ctx.closePath();

  ctx.fill();


  /*
     lamps
  */

  ctx.fillStyle =
    car.dir > 0
    ?
    "#e0dfb9"
    :
    "#b84942";


  const lightY =
    car.dir > 0
    ?
    p.y-6*s
    :
    p.y-h+5*s;


  ctx.fillRect(
    p.x-w*.36,
    lightY,
    9*s,
    4*s
  );


  ctx.fillRect(
    p.x+w*.18,
    lightY,
    9*s,
    4*s
  );

}


/* ==========================================================
   PERSON
========================================================== */

function drawPerson(
  x,
  y,
  color,
  isPlayer=false
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  let bob=0;


  if (
    isPlayer &&
    player.moving
  ) {

    bob =
      Math.sin(
        player.step
      ) *
      2.2 *
      s;

  }


  /*
     shadow
  */

  ctx.fillStyle =
    "rgba(20,27,27,.26)";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+3*s,
    15*s,
    6*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /*
     legs
  */

  ctx.fillStyle =
    "#303638";


  ctx.fillRect(
    p.x-7*s,
    p.y-18*s+bob,
    5*s,
    19*s
  );


  ctx.fillRect(
    p.x+2*s,
    p.y-18*s+bob,
    5*s,
    19*s
  );


  /*
     torso
  */

  ctx.fillStyle =
    color;


  ctx.beginPath();

  ctx.roundRect(
    p.x-12*s,
    p.y-49*s+bob,
    24*s,
    33*s,
    5*s
  );

  ctx.fill();


  /*
     head
  */

  ctx.fillStyle =
    "#d7a984";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-60*s+bob,
    10*s,
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
    p.y-64*s+bob,
    10*s,
    Math.PI,
    Math.PI*2
  );

  ctx.fill();


  if (
    isPlayer
  ) {

    ctx.fillStyle =
      "#e2c25b";


    ctx.fillRect(
      p.x-12*s,
      p.y-48*s+bob,
      24*s,
      4*s
    );

  }

}


/* ==========================================================
   PEDESTRIANS
========================================================== */

const pedestrians = [

  [650,3050,"#596e83"],
  [1550,2920,"#835f53"],

  [690,2700,"#55705b"],
  [1510,2500,"#72586d"],

  [650,2180,"#7c654f"],
  [1550,2050,"#526b78"],

  [680,1600,"#6b7150"],
  [1530,1430,"#765c67"],

  [650,950,"#4f6874"],
  [1540,800,"#766351"]

];


/* ==========================================================
   STREET DETAILS
========================================================== */

const bikes = [

  [630,2800],
  [655,2830],
  [680,2860],

  [1560,2260],
  [1585,2290],

  [630,1350],
  [655,1380]

];


const lamps=[];


for (
  let y=550;
  y<3500;
  y+=420
) {

  lamps.push([
    690,
    y
  ]);

  lamps.push([
    1510,
    y+180
  ]);

}


/* ==========================================================
   DRAW OBJECTS / DEPTH SORT
========================================================== */

function drawWorldObjects(time) {

  const objects=[];


  buildings.forEach(
    b => {

      objects.push({

        y:b.y,

        draw:
          () =>
            drawBuilding(b)

      });

    }
  );


  trees.forEach(
    tree => {

      objects.push({

        y:tree.y,

        draw:
          () =>
            drawTree(
              tree.x,
              tree.y
            )

      });

    }
  );


  lamps.forEach(
    lamp => {

      objects.push({

        y:lamp[1],

        draw:
          () =>
            drawLampPost(
              lamp[0],
              lamp[1]
            )

      });

    }
  );


  pedestrians.forEach(
    person => {

      objects.push({

        y:person[1],

        draw:
          () =>
            drawPerson(
              person[0],
              person[1],
              person[2]
            )

      });

    }
  );


  bikes.forEach(
    bike => {

      objects.push({

        y:bike[1],

        draw:
          () =>
            drawBike(
              bike[0],
              bike[1]
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


  /*
     metro entrances
  */

  objects.push({

    y:3000,

    draw:
      () =>
        drawMetro(
          650,
          3000
        )

  });


  objects.push({

    y:1700,

    draw:
      () =>
        drawMetro(
          1540,
          1700
        )

  });


  /*
     traffic lights
  */

  [
    [720,2360],
    [1480,2360],
    [720,1160],
    [1480,1160]

  ].forEach(
    light => {

      objects.push({

        y:light[1],

        draw:
          () =>
            drawTrafficLight(
              light[0],
              light[1],
              time
            )

      });

    }
  );


  /*
     bollards
  */

  for (
    let y=450;
    y<3500;
    y+=180
  ) {

    objects.push({

      y,

      draw:
        () =>
          drawBollard(
            755,
            y
          )

    });


    objects.push({

      y:y+70,

      draw:
        () =>
          drawBollard(
            1445,
            y+70
          )

    });

  }


  /*
     player
  */

  objects.push({

    y:player.y,

    draw:
      () =>
        drawPerson(
          player.x,
          player.y,
          "#3d695d",
          true
        )

  });


  objects.sort(
    (a,b) =>
      a.y-b.y
  );


  objects.forEach(
    object =>
      object.draw()
  );

}


/* ==========================================================
   FOREGROUND

   手前の物体を画面外にはみ出させる。

   HD-2D感にかなり重要。
========================================================== */

function drawForeground(time) {

  const sway =
    Math.sin(
      time*.0007
    ) *
    5;


  ctx.save();


  /*
     left canopy
  */

  ctx.fillStyle =
    "rgba(20,48,39,.33)";


  for (
    let i=0;
    i<7;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      -20 +
      i*18 +
      sway,

      H -
      60 -
      i*15,

      55,
      22,

      -.5,

      0,
      Math.PI*2
    );

    ctx.fill();

  }


  /*
     right canopy
  */

  for (
    let i=0;
    i<7;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      W +
      15 -
      i*18 -
      sway,

      H -
      70 -
      i*15,

      58,
      22,

      .5,

      0,
      Math.PI*2
    );

    ctx.fill();

  }


  ctx.restore();

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


  const light =
    ctx.createLinearGradient(
      0,
      0,
      W,
      H
    );


  light.addColorStop(
    0,
    "rgba(255,244,195,.13)"
  );


  light.addColorStop(
    .45,
    "rgba(255,244,195,.025)"
  );


  light.addColorStop(
    1,
    "rgba(255,244,195,0)"
  );


  ctx.fillStyle =
    light;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.restore();


  /*
     upper haze
  */

  const haze =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H*.55
    );


  haze.addColorStop(
    0,
    "rgba(228,238,235,.18)"
  );


  haze.addColorStop(
    1,
    "rgba(228,238,235,0)"
  );


  ctx.fillStyle =
    haze;


  ctx.fillRect(
    0,
    0,
    W,
    H*.55
  );

}


/* ==========================================================
   DRAW
========================================================== */

function draw(time) {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  /*
     BACKGROUND
  */

  drawSky();

  drawClouds(time);

  drawDistantSkyline();


  /*
     GROUND
  */

  drawRoad();

  drawSidewalkDetails();

  drawTactilePaving();

  drawLaneMarkings();


  /*
     intersections
  */

  drawCrosswalk(2300);

  drawCrosswalk(1100);


  /*
     WORLD OBJECTS
  */

  drawWorldObjects(time);


  /*
     POST PROCESS
  */

  drawAtmosphere();

  drawForeground(time);

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
      ) /
      1000,

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
