/* ==========================================================
   杭州探索録 3
   都市杭州
   Dense City Prototype Ver.0.3

   ・3/4 perspective
   ・dense storefronts
   ・street furniture
   ・moving traffic
   ・pedestrians
   ・delivery riders
   ・bus
   ・signage
   ・AC units
   ・pipes
   ・birds
   ・foreground occlusion
========================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

const DPR = Math.min(
  window.devicePixelRatio || 1,
  2
);

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W * DPR;
  canvas.height = H * DPR;

  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  ctx.setTransform(
    DPR, 0, 0, DPR, 0, 0
  );
}

window.addEventListener("resize", resize);
resize();


/* ==========================================================
   WORLD
========================================================== */

const WORLD = {
  width: 2200,
  height: 4200
};

const road = {
  center: 1100,
  halfWidth: 330
};


/* ==========================================================
   PLAYER
========================================================== */

const player = {
  x: 1100,
  y: 3350,
  speed: 270,
  moving: false,
  direction: "up",
  step: 0
};

const camera = {
  x: player.x,
  y: player.y
};

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});


/* ==========================================================
   HELPERS
========================================================== */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function noise(n) {
  const x =
    Math.sin(n * 12.9898) *
    43758.5453;

  return x - Math.floor(x);
}


/* ==========================================================
   PERSPECTIVE
========================================================== */

const VIEW = {
  horizon: 145,
  playerScreenY: .72,
  depthScale: .48,
  perspective: .00034
};

function project(x, y, z = 0) {

  const dy = y - camera.y;

  let scale =
    1 +
    dy * VIEW.perspective;

  scale = clamp(
    scale,
    .44,
    1.58
  );

  return {
    x:
      W / 2 +
      (x - camera.x) * scale,

    y:
      H * VIEW.playerScreenY +
      dy * VIEW.depthScale -
      z * scale,

    scale
  };
}


/* ==========================================================
   UPDATE PLAYER
========================================================== */

function updatePlayer(dt) {

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) {
    dy--;
    player.direction = "up";
  }

  if (keys["s"] || keys["arrowdown"]) {
    dy++;
    player.direction = "down";
  }

  if (keys["a"] || keys["arrowleft"]) {
    dx--;
    player.direction = "left";
  }

  if (keys["d"] || keys["arrowright"]) {
    dx++;
    player.direction = "right";
  }

  player.moving =
    dx !== 0 ||
    dy !== 0;

  if (player.moving) {

    const len =
      Math.hypot(dx, dy);

    dx /= len;
    dy /= len;

    player.x +=
      dx * player.speed * dt;

    player.y +=
      dy * player.speed * dt;

    player.step +=
      dt * 10;
  }

  player.x =
    clamp(player.x, 690, 1510);

  player.y =
    clamp(player.y, 300, WORLD.height - 100);

  camera.x +=
    (player.x - camera.x) * .075;

  camera.y +=
    (player.y - camera.y) * .07;
}


/* ==========================================================
   SKY
========================================================== */

function drawSky() {

  const g =
    ctx.createLinearGradient(
      0, 0,
      0, H
    );

  g.addColorStop(
    0,
    "#8dbccd"
  );

  g.addColorStop(
    .32,
    "#c3d4d5"
  );

  g.addColorStop(
    .58,
    "#d8d8cd"
  );

  g.addColorStop(
    1,
    "#a8aaa0"
  );

  ctx.fillStyle = g;

  ctx.fillRect(
    0, 0, W, H
  );
}


/* ==========================================================
   CLOUDS
========================================================== */

function drawClouds(time) {

  ctx.save();

  ctx.globalAlpha = .14;

  for (let i = 0; i < 9; i++) {

    const x =
      (
        i * 230 +
        time * .005
      ) %
      (W + 350) - 170;

    const y =
      70 +
      noise(i * 11) * 160;

    ctx.fillStyle = "#fff";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      100 + noise(i) * 60,
      23 + noise(i + 2) * 13,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.restore();
}


/* ==========================================================
   DISTANT SKYLINE
========================================================== */

function drawSkyline() {

  const base = 325;

  const towers = [
    [0,170,70],
    [75,230,78],
    [165,140,65],
    [230,310,90],
    [330,210,72],
    [410,365,100],
    [525,190,70],
    [600,290,90],
    [705,420,105],
    [830,240,76],
    [915,335,95],
    [1020,180,65],
    [1090,440,110],
    [1220,270,85],
    [1320,205,70],
    [1400,380,105],
    [1520,225,75],
    [1600,320,95],
    [1710,180,65],
    [1780,275,85]
  ];

  ctx.save();
  ctx.globalAlpha = .40;

  towers.forEach((b, i) => {

    const x =
      b[0] / 1800 *
      (W + 150) - 60;

    const h = b[1];
    const w = b[2];

    ctx.fillStyle =
      i % 3 === 0
      ? "#58727b"
      : "#71868b";

    ctx.fillRect(
      x,
      base - h,
      w,
      h
    );

    ctx.fillStyle =
      "rgba(220,233,230,.18)";

    for (
      let yy = base - h + 15;
      yy < base - 10;
      yy += 17
    ) {
      ctx.fillRect(
        x + 7,
        yy,
        w - 14,
        2
      );
    }
  });

  ctx.restore();

  const haze =
    ctx.createLinearGradient(
      0, 80,
      0, 390
    );

  haze.addColorStop(
    0,
    "rgba(229,238,235,.04)"
  );

  haze.addColorStop(
    .6,
    "rgba(229,238,235,.18)"
  );

  haze.addColorStop(
    1,
    "rgba(229,238,235,.72)"
  );

  ctx.fillStyle = haze;

  ctx.fillRect(
    0, 60,
    W, 360
  );
}


/* ==========================================================
   ROAD
========================================================== */

function drawRoad() {

  const farY =
    camera.y - 1700;

  const nearY =
    camera.y + 1000;

  const FL =
    project(
      road.center - road.halfWidth,
      farY
    );

  const FR =
    project(
      road.center + road.halfWidth,
      farY
    );

  const NL =
    project(
      road.center - road.halfWidth,
      nearY
    );

  const NR =
    project(
      road.center + road.halfWidth,
      nearY
    );


  /* sidewalk */

  ctx.fillStyle =
    "#aaa99f";

  ctx.beginPath();

  ctx.moveTo(
    FL.x - 250,
    FL.y
  );

  ctx.lineTo(
    FR.x + 250,
    FR.y
  );

  ctx.lineTo(
    NR.x + 520,
    NR.y
  );

  ctx.lineTo(
    NL.x - 520,
    NL.y
  );

  ctx.closePath();
  ctx.fill();


  /* asphalt */

  ctx.fillStyle =
    "#4b5052";

  ctx.beginPath();

  ctx.moveTo(FL.x, FL.y);
  ctx.lineTo(FR.x, FR.y);
  ctx.lineTo(NR.x, NR.y);
  ctx.lineTo(NL.x, NL.y);

  ctx.closePath();
  ctx.fill();


  /* asphalt grain */

  for (let i = 0; i < 330; i++) {

    const y =
      camera.y -
      1600 +
      noise(i * 17) * 2500;

    const x =
      road.center -
      road.halfWidth +
      noise(i * 29) *
      road.halfWidth * 2;

    const p =
      project(x, y);

    if (
      p.y < 250 ||
      p.y > H + 50
    ) continue;

    ctx.fillStyle =
      i % 2
      ? "rgba(255,255,255,.035)"
      : "rgba(0,0,0,.045)";

    ctx.fillRect(
      p.x,
      p.y,
      1.7 * p.scale,
      1.7 * p.scale
    );
  }
}


/* ==========================================================
   SIDEWALK DETAILS
========================================================== */

function drawSidewalk() {

  for (
    let y = camera.y - 1600;
    y < camera.y + 1000;
    y += 62
  ) {

    const LA =
      project(
        road.center -
        road.halfWidth - 240,
        y
      );

    const LB =
      project(
        road.center -
        road.halfWidth,
        y
      );

    const RA =
      project(
        road.center +
        road.halfWidth,
        y
      );

    const RB =
      project(
        road.center +
        road.halfWidth + 240,
        y
      );

    ctx.strokeStyle =
      "rgba(70,72,68,.17)";

    ctx.lineWidth =
      Math.max(.5, LA.scale);

    ctx.beginPath();
    ctx.moveTo(LA.x, LA.y);
    ctx.lineTo(LB.x, LB.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(RA.x, RA.y);
    ctx.lineTo(RB.x, RB.y);
    ctx.stroke();
  }


  /* curb */

  for (
    const x of [
      road.center - road.halfWidth,
      road.center + road.halfWidth
    ]
  ) {

    const A =
      project(
        x,
        camera.y - 1600
      );

    const B =
      project(
        x,
        camera.y + 1000
      );

    ctx.strokeStyle =
      "#d4d2c7";

    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }
}


/* ==========================================================
   TACTILE PAVING
========================================================== */

function drawTactile() {

  for (
    const x of [
      road.center -
      road.halfWidth - 75,

      road.center +
      road.halfWidth + 75
    ]
  ) {

    for (
      let y =
        camera.y - 1600;
      y <
        camera.y + 1000;
      y += 25
    ) {

      const A =
        project(x, y);

      const B =
        project(x, y + 28);

      ctx.strokeStyle =
        "#d4b244";

      ctx.lineWidth =
        Math.max(
          3,
          11 * A.scale
        );

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }
}


/* ==========================================================
   ROAD MARKINGS
========================================================== */

function drawRoadMarkings() {

  for (
    const lane of [
      road.center - 110,
      road.center + 110
    ]
  ) {

    for (
      let y =
        camera.y - 1600;
      y <
        camera.y + 1000;
      y += 155
    ) {

      const A =
        project(lane, y);

      const B =
        project(lane, y + 70);

      ctx.strokeStyle =
        "rgba(239,238,227,.9)";

      ctx.lineWidth =
        Math.max(
          2,
          5 * A.scale
        );

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }


  for (
    const edge of [
      road.center -
      road.halfWidth + 20,

      road.center +
      road.halfWidth - 20
    ]
  ) {

    const A =
      project(
        edge,
        camera.y - 1600
      );

    const B =
      project(
        edge,
        camera.y + 1000
      );

    ctx.strokeStyle =
      "rgba(240,239,229,.92)";

    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }
}


/* ==========================================================
   CROSSWALK
========================================================== */

function drawCrosswalk(y) {

  for (
    let x =
      road.center -
      road.halfWidth + 25;

    x <
      road.center +
      road.halfWidth - 20;

    x += 55
  ) {

    const A =
      project(x, y);

    const B =
      project(x + 34, y);

    const C =
      project(x + 34, y + 105);

    const D =
      project(x, y + 105);

    ctx.fillStyle =
      "rgba(238,238,229,.92)";

    ctx.beginPath();

    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.lineTo(D.x, D.y);

    ctx.closePath();
    ctx.fill();
  }
}


/* ==========================================================
   MANHOLES
========================================================== */

const manholes = [
  [980,3150],
  [1230,2860],
  [1390,2400],
  [1020,1980],
  [1260,1570],
  [950,1050],
  [1370,680]
];

function drawManhole(x, y) {

  const p = project(x, y);
  const s = p.scale;

  ctx.fillStyle =
    "#353b3c";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    20 * s,
    7 * s,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle =
    "#666b69";

  ctx.lineWidth =
    2 * s;

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    14 * s,
    5 * s,
    0,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    p.x - 9 * s,
    p.y
  );

  ctx.lineTo(
    p.x + 9 * s,
    p.y
  );

  ctx.stroke();
}


/* ==========================================================
   BUILDINGS
========================================================== */

const buildings = [

  {
    side:-1,
    x:565,
    y:3850,
    width:410,
    height:560,
    depth:180,
    type:"glass",
    shops:["便利店","茶百道","杭州面馆"]
  },

  {
    side:1,
    x:1635,
    y:3780,
    width:430,
    height:610,
    depth:190,
    type:"dark",
    shops:["咖啡","药房","小笼包"]
  },

  {
    side:-1,
    x:530,
    y:3150,
    width:445,
    height:690,
    depth:185,
    type:"silver",
    shops:["书店","便利蜂","杭帮菜"]
  },

  {
    side:1,
    x:1650,
    y:3000,
    width:445,
    height:760,
    depth:195,
    type:"glass",
    shops:["喜茶","手机","咖啡"]
  },

  {
    side:-1,
    x:545,
    y:2380,
    width:430,
    height:790,
    depth:180,
    type:"dark",
    shops:["面馆","水果","便利店"]
  },

  {
    side:1,
    x:1645,
    y:2200,
    width:450,
    height:850,
    depth:205,
    type:"silver",
    shops:["茶饮","杭州味道","银行"]
  },

  {
    side:-1,
    x:570,
    y:1580,
    width:410,
    height:880,
    depth:175,
    type:"glass",
    shops:["咖啡","书房","甜品"]
  },

  {
    side:1,
    x:1620,
    y:1370,
    width:445,
    height:930,
    depth:190,
    type:"dark",
    shops:["便利店","餐厅","数码"]
  },

  {
    side:-1,
    x:590,
    y:720,
    width:390,
    height:920,
    depth:175,
    type:"silver",
    shops:["杭州茶","面包","生活"]
  },

  {
    side:1,
    x:1610,
    y:520,
    width:430,
    height:970,
    depth:185,
    type:"glass",
    shops:["咖啡","茶饮","餐厅"]
  }
];


/* ==========================================================
   AIR CONDITIONER
========================================================== */

function drawAC(
  x,
  y,
  size,
  time,
  seed
) {

  ctx.fillStyle =
    "#c1c3be";

  ctx.fillRect(
    x,
    y,
    size,
    size * .68
  );

  ctx.strokeStyle =
    "#777f7e";

  ctx.lineWidth = 1;

  ctx.strokeRect(
    x,
    y,
    size,
    size * .68
  );

  ctx.fillStyle =
    "#555f60";

  ctx.beginPath();

  ctx.arc(
    x + size * .5,
    y + size * .34,
    size * .20,
    0,
    Math.PI * 2
  );

  ctx.fill();

  const angle =
    time * .003 +
    seed;

  ctx.strokeStyle =
    "#8c9492";

  ctx.beginPath();

  for (let i=0; i<4; i++) {

    const a =
      angle +
      i * Math.PI/2;

    ctx.moveTo(
      x + size*.5,
      y + size*.34
    );

    ctx.lineTo(
      x + size*.5 +
      Math.cos(a)*size*.17,

      y + size*.34 +
      Math.sin(a)*size*.17
    );
  }

  ctx.stroke();
}


/* ==========================================================
   BUILDING
========================================================== */

function drawBuilding(b, time) {

  const base =
    project(b.x, b.y);

  if (
    base.y < -900 ||
    base.y > H + 700
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
      ? width
      : 0
    );

  const y =
    base.y;


  /* shadow */

  ctx.fillStyle =
    "rgba(17,28,31,.21)";

  ctx.beginPath();

  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(
    x + width + 100*s,
    y + 42*s
  );
  ctx.lineTo(
    x + 65*s,
    y + 45*s
  );

  ctx.closePath();
  ctx.fill();


  /* facade */

  let front = "#63808a";

  if (b.type === "dark")
    front = "#43555b";

  if (b.type === "silver")
    front = "#7d898a";

  ctx.fillStyle = front;

  ctx.fillRect(
    x,
    y-height,
    width,
    height
  );


  /* side */

  ctx.fillStyle =
    b.side < 0
    ? "#344950"
    : "#53686e";

  ctx.beginPath();

  if (b.side < 0) {

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

  } else {

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


  /* roof */

  ctx.fillStyle =
    "#788789";

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


  /* floors */

  const floors =
    Math.max(
      10,
      Math.floor(
        b.height / 47
      )
    );

  const columns =
    Math.max(
      6,
      Math.floor(
        b.width / 46
      )
    );

  const groundH =
    96 * s;

  const upperH =
    height - groundH;


  for (
    let floor=0;
    floor<floors;
    floor++
  ) {

    const fy =
      y-height +
      floor *
      upperH/floors;

    ctx.strokeStyle =
      "rgba(222,236,236,.17)";

    ctx.lineWidth =
      Math.max(.6, 1.2*s);

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


  for (
    let column=1;
    column<columns;
    column++
  ) {

    const fx =
      x +
      column *
      width/columns;

    ctx.strokeStyle =
      "rgba(24,47,53,.34)";

    ctx.lineWidth =
      Math.max(1, 2*s);

    ctx.beginPath();

    ctx.moveTo(
      fx,
      y-height
    );

    ctx.lineTo(
      fx,
      y-groundH
    );

    ctx.stroke();
  }


  /* windows */

  const cellW =
    width / columns;

  const cellH =
    upperH / floors;

  for (
    let floor=0;
    floor<floors;
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

      ctx.fillStyle =
        noise(seed) > .82
        ? "rgba(225,213,157,.28)"
        : "rgba(38,66,74,.18)";

      ctx.fillRect(
        x +
        column*cellW +
        cellW*.16,

        y -
        height +
        floor*cellH +
        cellH*.18,

        cellW*.67,

        cellH*.57
      );
    }
  }


  /* reflection */

  if (b.type === "glass") {

    const reflection =
      ctx.createLinearGradient(
        x,
        y-height,
        x+width,
        y
      );

    reflection.addColorStop(
      0,
      "rgba(212,237,239,.28)"
    );

    reflection.addColorStop(
      .34,
      "rgba(255,255,255,.02)"
    );

    reflection.addColorStop(
      .58,
      "rgba(230,245,244,.17)"
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
      height-groundH
    );
  }


  /* rooftop equipment */

  ctx.fillStyle =
    "#586668";

  ctx.fillRect(
    x + width*.18,
    y-height-18*s,
    width*.18,
    18*s
  );

  ctx.fillRect(
    x + width*.62,
    y-height-28*s,
    width*.14,
    28*s
  );


  /* antennas */

  ctx.strokeStyle =
    "#47575a";

  ctx.lineWidth =
    2*s;

  ctx.beginPath();

  ctx.moveTo(
    x + width*.73,
    y-height-28*s
  );

  ctx.lineTo(
    x + width*.73,
    y-height-65*s
  );

  ctx.stroke();


  /* pipes */

  ctx.strokeStyle =
    "rgba(55,68,69,.8)";

  ctx.lineWidth =
    5*s;

  ctx.beginPath();

  ctx.moveTo(
    x + width*.09,
    y-height*.72
  );

  ctx.lineTo(
    x + width*.09,
    y-groundH-12*s
  );

  ctx.stroke();


  /* AC units */

  for (
    let i=0;
    i<3;
    i++
  ) {

    const acSeed =
      b.x + i*90;

    const acX =
      x +
      width *
      (
        .16 +
        i*.25
      );

    const acY =
      y -
      groundH -
      (
        80 +
        noise(acSeed)*140
      )*s;

    drawAC(
      acX,
      acY,
      27*s,
      time,
      acSeed
    );
  }


  /* ground floor */

  ctx.fillStyle =
    "#253a40";

  ctx.fillRect(
    x,
    y-groundH,
    width,
    groundH
  );


  /* stores */

  const count =
    b.shops.length;

  const shopW =
    width / count;

  for (
    let i=0;
    i<count;
    i++
  ) {

    const sx =
      x + i*shopW;

    /* interior */

    ctx.fillStyle =
      i%2
      ? "#425b5e"
      : "#364f54";

    ctx.fillRect(
      sx + 5*s,
      y-groundH + 26*s,
      shopW - 10*s,
      groundH - 30*s
    );


    /* warm interior */

    ctx.fillStyle =
      "rgba(238,205,139,.33)";

    ctx.fillRect(
      sx + 11*s,
      y-groundH + 32*s,
      shopW - 22*s,
      groundH - 43*s
    );


    /* shelves */

    ctx.fillStyle =
      "rgba(70,54,39,.42)";

    ctx.fillRect(
      sx + 17*s,
      y-35*s,
      shopW - 34*s,
      4*s
    );


    /* sign */

    const signColors = [
      "#aa4339",
      "#39765e",
      "#b38338",
      "#365f82"
    ];

    ctx.fillStyle =
      signColors[
        (
          i +
          Math.floor(b.y/500)
        ) %
        signColors.length
      ];

    ctx.fillRect(
      sx + 6*s,
      y-groundH + 5*s,
      shopW - 12*s,
      22*s
    );

    ctx.fillStyle =
      "#f4eee0";

    ctx.font =
      `${Math.max(
        8,
        12*s
      )}px sans-serif`;

    ctx.textAlign =
      "center";

    ctx.fillText(
      b.shops[i],
      sx + shopW/2,
      y-groundH + 21*s
    );
  }


  /* awning */

  ctx.fillStyle =
    "#25363b";

  ctx.fillRect(
    x-10*s,
    y-groundH,
    width+20*s,
    11*s
  );


  /* vertical sign */

  const signX =
    b.side < 0
    ? x+width-22*s
    : x+8*s;

  ctx.fillStyle =
    "#a34136";

  ctx.fillRect(
    signX,
    y-groundH-115*s,
    28*s,
    95*s
  );

  ctx.fillStyle =
    "#f0e7d5";

  ctx.font =
    `${Math.max(
      7,
      11*s
    )}px serif`;

  ctx.textAlign =
    "center";

  const verticalText =
    "杭州";

  ctx.fillText(
    verticalText[0],
    signX+14*s,
    y-groundH-86*s
  );

  ctx.fillText(
    verticalText[1],
    signX+14*s,
    y-groundH-62*s
  );


  /* LED screen */

  if (
    Math.floor(b.y/700)%2===0
  ) {

    const ledX =
      x + width*.23;

    const ledY =
      y-groundH-78*s;

    ctx.fillStyle =
      "#172327";

    ctx.fillRect(
      ledX,
      ledY,
      width*.45,
      40*s
    );

    const pulse =
      .55 +
      Math.sin(time*.003)*.2;

    ctx.fillStyle =
      `rgba(113,214,190,${pulse})`;

    ctx.font =
      `${Math.max(
        7,
        10*s
      )}px sans-serif`;

    ctx.fillText(
      "HANGZHOU · CITY",
      ledX + width*.225,
      ledY + 25*s
    );
  }
}


/* ==========================================================
   TREES
========================================================== */

const trees = [];

for (
  let y=430;
  y<WORLD.height;
  y+=235
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
    y:y+110
  });
}

function drawTree(x,y,time) {

  const p =
    project(x,y);

  const s =
    p.scale;

  const sway =
    Math.sin(
      time*.001 +
      y*.01
    ) *
    3*s;


  /* pit */

  ctx.fillStyle =
    "#6d7169";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    27*s,
    9*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* shadow */

  ctx.fillStyle =
    "rgba(24,42,30,.17)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+27*s,
    p.y+4*s,
    55*s,
    14*s,
    .1,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* trunk */

  ctx.strokeStyle =
    "#625441";

  ctx.lineWidth =
    10*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x+sway,
    p.y-78*s
  );

  ctx.stroke();


  const leaves = [
    [-31,-92,31],
    [3,-108,37],
    [39,-89,29],
    [-8,-74,34],
    [24,-123,25],
    [-44,-67,22]
  ];

  leaves.forEach(
    (l,i) => {

      ctx.fillStyle =
        i%2
        ? "#557653"
        : "#66835b";

      ctx.beginPath();

      ctx.arc(
        p.x+l[0]*s+sway,
        p.y+l[1]*s,
        l[2]*s,
        0,
        Math.PI*2
      );

      ctx.fill();

      if (i<3) {

        ctx.fillStyle =
          "rgba(142,166,104,.18)";

        ctx.beginPath();

        ctx.arc(
          p.x+(l[0]-7)*s+sway,
          p.y+(l[1]-8)*s,
          l[2]*.55*s,
          0,
          Math.PI*2
        );

        ctx.fill();
      }
    }
  );
}


/* ==========================================================
   LAMP POST
========================================================== */

const lamps=[];

for (
  let y=500;
  y<WORLD.height;
  y+=410
) {

  lamps.push([690,y]);
  lamps.push([1510,y+170]);
}

function drawLamp(x,y) {

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
    p.y-120*s
  );

  ctx.lineTo(
    p.x+30*s,
    p.y-120*s
  );

  ctx.stroke();

  ctx.fillStyle =
    "#d6d4b5";

  ctx.beginPath();

  ctx.ellipse(
    p.x+34*s,
    p.y-120*s,
    11*s,
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
  x,y,time
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.strokeStyle =
    "#394547";

  ctx.lineWidth =
    6*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-102*s
  );

  ctx.lineTo(
    p.x+46*s,
    p.y-102*s
  );

  ctx.stroke();

  ctx.fillStyle =
    "#253034";

  ctx.fillRect(
    p.x+32*s,
    p.y-119*s,
    30*s,
    58*s
  );

  const phase =
    Math.floor(time/5000)%2;

  ctx.fillStyle =
    phase
    ? "#d65348"
    : "#513a38";

  ctx.beginPath();

  ctx.arc(
    p.x+47*s,
    p.y-104*s,
    7*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.fillStyle =
    phase
    ? "#30463b"
    : "#54a968";

  ctx.beginPath();

  ctx.arc(
    p.x+47*s,
    p.y-79*s,
    7*s,
    0,
    Math.PI*2
  );

  ctx.fill();
}


/* ==========================================================
   METRO
========================================================== */

function drawMetro(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.fillStyle =
    "#475256";

  ctx.beginPath();

  ctx.moveTo(
    p.x-48*s,
    p.y
  );

  ctx.lineTo(
    p.x+48*s,
    p.y
  );

  ctx.lineTo(
    p.x+32*s,
    p.y+58*s
  );

  ctx.lineTo(
    p.x-32*s,
    p.y+58*s
  );

  ctx.closePath();
  ctx.fill();

  for (
    let i=8;
    i<52;
    i+=8
  ) {

    ctx.strokeStyle =
      "rgba(220,226,223,.28)";

    ctx.beginPath();

    ctx.moveTo(
      p.x-43*s+i*.2*s,
      p.y+i*s
    );

    ctx.lineTo(
      p.x+43*s-i*.2*s,
      p.y+i*s
    );

    ctx.stroke();
  }

  ctx.strokeStyle =
    "#53686c";

  ctx.lineWidth =
    5*s;

  ctx.strokeRect(
    p.x-53*s,
    p.y-67*s,
    106*s,
    68*s
  );

  ctx.fillStyle =
    "rgba(143,189,198,.17)";

  ctx.fillRect(
    p.x-49*s,
    p.y-63*s,
    98*s,
    59*s
  );

  ctx.fillStyle =
    "#b74242";

  ctx.beginPath();

  ctx.arc(
    p.x-36*s,
    p.y-81*s,
    14*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.fillStyle =
    "#fff";

  ctx.font =
    `bold ${Math.max(8,13*s)}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "M",
    p.x-36*s,
    p.y-76*s
  );

  ctx.fillStyle =
    "#364a50";

  ctx.font =
    `${Math.max(7,10*s)}px sans-serif`;

  ctx.fillText(
    "地铁",
    p.x+9*s,
    p.y-79*s
  );
}


/* ==========================================================
   BIKE
========================================================== */

const bikes = [
  [625,3460],
  [650,3490],
  [675,3520],
  [1570,3230],
  [1595,3260],

  [630,2690],
  [655,2720],
  [1570,2350],
  [1595,2380],

  [630,1830],
  [655,1860],
  [1570,1480],
  [1595,1510],

  [630,900],
  [655,930]
];

function drawBike(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.strokeStyle =
    "#414c4d";

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
    "#d2b33f";

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
   BENCH
========================================================== */

const benches = [
  [625,3080],
  [1575,2770],
  [625,2130],
  [1575,1780],
  [625,1150]
];

function drawBench(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.fillStyle =
    "#70523d";

  ctx.fillRect(
    p.x-30*s,
    p.y-19*s,
    60*s,
    7*s
  );

  ctx.fillRect(
    p.x-30*s,
    p.y-8*s,
    60*s,
    7*s
  );

  ctx.fillStyle =
    "#3f4748";

  ctx.fillRect(
    p.x-24*s,
    p.y,
    5*s,
    17*s
  );

  ctx.fillRect(
    p.x+19*s,
    p.y,
    5*s,
    17*s
  );
}


/* ==========================================================
   TRASH CAN
========================================================== */

const trashCans = [
  [715,2900],
  [1485,2550],
  [715,1900],
  [1485,950]
];

function drawTrashCan(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.fillStyle =
    "#4d6561";

  ctx.beginPath();

  ctx.roundRect(
    p.x-10*s,
    p.y-27*s,
    20*s,
    28*s,
    3*s
  );

  ctx.fill();

  ctx.fillStyle =
    "#283b38";

  ctx.fillRect(
    p.x-12*s,
    p.y-29*s,
    24*s,
    5*s
  );
}


/* ==========================================================
   PLANTERS
========================================================== */

const planters = [
  [620,3300],
  [1580,3030],
  [620,2500],
  [1580,2070],
  [620,1450],
  [1580,1100]
];

function drawPlanter(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.fillStyle =
    "#6d746e";

  ctx.fillRect(
    p.x-25*s,
    p.y-11*s,
    50*s,
    20*s
  );

  for (
    let i=-17;
    i<=17;
    i+=8
  ) {

    ctx.fillStyle =
      i%16===0
      ? "#5d7a54"
      : "#68855d";

    ctx.beginPath();

    ctx.arc(
      p.x+i*s,
      p.y-13*s,
      9*s,
      0,
      Math.PI*2
    );

    ctx.fill();
  }
}


/* ==========================================================
   PERSON
========================================================== */

function drawPerson(
  x,
  y,
  color,
  isPlayer=false,
  bag=false
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  let bob = 0;

  if (
    isPlayer &&
    player.moving
  ) {
    bob =
      Math.sin(player.step) *
      2.2*s;
  }

  ctx.fillStyle =
    "rgba(20,27,27,.25)";

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


  /* legs */

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


  /* torso */

  ctx.fillStyle = color;

  ctx.beginPath();

  ctx.roundRect(
    p.x-12*s,
    p.y-49*s+bob,
    24*s,
    33*s,
    5*s
  );

  ctx.fill();


  /* head */

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


  /* hair */

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


  if (bag) {

    ctx.fillStyle =
      "#9a7b43";

    ctx.fillRect(
      p.x+9*s,
      p.y-37*s+bob,
      9*s,
      17*s
    );
  }


  if (isPlayer) {

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
   MOVING PEDESTRIANS
========================================================== */

const pedestrians = [
  {
    x:650,y:3500,
    dir:-1,speed:25,
    color:"#596f84"
  },
  {
    x:1550,y:3300,
    dir:1,speed:22,
    color:"#835f53"
  },
  {
    x:680,y:2900,
    dir:1,speed:28,
    color:"#55705b"
  },
  {
    x:1530,y:2650,
    dir:-1,speed:24,
    color:"#72586d"
  },
  {
    x:650,y:2150,
    dir:-1,speed:27,
    color:"#7c654f"
  },
  {
    x:1550,y:1900,
    dir:1,speed:30,
    color:"#526b78"
  },
  {
    x:675,y:1400,
    dir:1,speed:22,
    color:"#6b7150"
  },
  {
    x:1535,y:1150,
    dir:-1,speed:26,
    color:"#765c67"
  },
  {
    x:650,y:700,
    dir:1,speed:24,
    color:"#4f6874"
  }
];

function updatePedestrians(dt) {

  pedestrians.forEach(p => {

    p.y +=
      p.dir *
      p.speed *
      dt;

    if (p.y < 300)
      p.y = WORLD.height - 200;

    if (p.y > WORLD.height)
      p.y = 350;
  });
}


/* ==========================================================
   CARS
========================================================== */

const cars = [
  {
    x:900,
    y:900,
    speed:110,
    dir:1,
    color:"#d8dad6",
    type:"car"
  },

  {
    x:1040,
    y:3000,
    speed:125,
    dir:-1,
    color:"#34434a",
    type:"taxi"
  },

  {
    x:1190,
    y:1700,
    speed:105,
    dir:1,
    color:"#c0c5c3",
    type:"car"
  },

  {
    x:1370,
    y:3700,
    speed:130,
    dir:-1,
    color:"#5d727c",
    type:"car"
  }
];

function updateCars(dt) {

  cars.forEach(car => {

    car.y +=
      car.speed *
      car.dir *
      dt;

    if (
      car.y >
      WORLD.height+300
    )
      car.y=-300;

    if (
      car.y <
      -300
    )
      car.y=
        WORLD.height+300;
  });
}

function drawCar(car) {

  const p =
    project(car.x,car.y);

  const s =
    p.scale;

  const w =
    48*s;

  const h =
    72*s;


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


  if (car.type==="taxi") {

    ctx.fillStyle =
      "#d8d6bc";

    ctx.fillRect(
      p.x-9*s,
      p.y-h-7*s,
      18*s,
      7*s
    );

    ctx.fillStyle =
      "#315f73";

    ctx.fillRect(
      p.x-7*s,
      p.y-h-5*s,
      14*s,
      3*s
    );
  }
}


/* ==========================================================
   BUS
========================================================== */

const bus = {
  x:960,
  y:3800,
  speed:78
};

function updateBus(dt) {

  bus.y -=
    bus.speed*dt;

  if (
    bus.y < -500
  )
    bus.y =
      WORLD.height+500;
}

function drawBus() {

  const p =
    project(
      bus.x,
      bus.y
    );

  const s =
    p.scale;

  const w =
    72*s;

  const h =
    150*s;

  ctx.fillStyle =
    "rgba(15,22,23,.25)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+10*s,
    p.y+7*s,
    44*s,
    13*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "#3e7b74";

  ctx.beginPath();

  ctx.roundRect(
    p.x-w/2,
    p.y-h,
    w,
    h,
    10*s
  );

  ctx.fill();


  /* windows */

  ctx.fillStyle =
    "#38545c";

  ctx.fillRect(
    p.x-w*.38,
    p.y-h+20*s,
    w*.76,
    67*s
  );


  /* window separators */

  ctx.strokeStyle =
    "#8ba3a5";

  ctx.lineWidth =
    2*s;

  for (
    let i=-2;
    i<=2;
    i++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      p.x+i*12*s,
      p.y-h+20*s
    );

    ctx.lineTo(
      p.x+i*12*s,
      p.y-h+87*s
    );

    ctx.stroke();
  }


  /* route display */

  ctx.fillStyle =
    "#172524";

  ctx.fillRect(
    p.x-w*.34,
    p.y-h+6*s,
    w*.68,
    12*s
  );

  ctx.fillStyle =
    "#e7b94b";

  ctx.font =
    `${Math.max(6,8*s)}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "市民中心  →",
    p.x,
    p.y-h+15*s
  );


  /* lower body */

  ctx.fillStyle =
    "#e1e2dc";

  ctx.fillRect(
    p.x-w*.45,
    p.y-48*s,
    w*.9,
    38*s
  );
}


/* ==========================================================
   DELIVERY SCOOTER
========================================================== */

const scooters = [
  {
    x:760,
    y:2500,
    dir:1,
    speed:85
  },

  {
    x:1450,
    y:1100,
    dir:-1,
    speed:90
  }
];

function updateScooters(dt) {

  scooters.forEach(s => {

    s.y +=
      s.dir *
      s.speed *
      dt;

    if (s.y<0)
      s.y=WORLD.height;

    if (s.y>WORLD.height)
      s.y=0;
  });
}

function drawScooter(scooter) {

  const p =
    project(
      scooter.x,
      scooter.y
    );

  const s =
    p.scale;

  ctx.fillStyle =
    "rgba(20,25,25,.22)";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    19*s,
    6*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* wheels */

  ctx.fillStyle =
    "#252b2b";

  ctx.beginPath();

  ctx.arc(
    p.x-11*s,
    p.y-3*s,
    5*s,
    0,
    Math.PI*2
  );

  ctx.arc(
    p.x+11*s,
    p.y-3*s,
    5*s,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* body */

  ctx.fillStyle =
    "#d4b73e";

  ctx.fillRect(
    p.x-10*s,
    p.y-18*s,
    21*s,
    12*s
  );


  /* rider */

  ctx.fillStyle =
    "#e0b088";

  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-42*s,
    7*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.fillStyle =
    "#d2b33d";

  ctx.fillRect(
    p.x-8*s,
    p.y-36*s,
    16*s,
    21*s
  );


  /* delivery box */

  ctx.fillStyle =
    "#e0bd3e";

  ctx.fillRect(
    p.x-18*s,
    p.y-35*s,
    12*s,
    16*s
  );
}


/* ==========================================================
   BUS STOP
========================================================== */

function drawBusStop(x,y) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.strokeStyle =
    "#526366";

  ctx.lineWidth =
    5*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x-35*s,
    p.y
  );

  ctx.lineTo(
    p.x-35*s,
    p.y-95*s
  );

  ctx.lineTo(
    p.x+45*s,
    p.y-95*s
  );

  ctx.lineTo(
    p.x+45*s,
    p.y
  );

  ctx.stroke();


  /* glass */

  ctx.fillStyle =
    "rgba(142,185,192,.18)";

  ctx.fillRect(
    p.x-31*s,
    p.y-91*s,
    72*s,
    70*s
  );


  /* sign */

  ctx.fillStyle =
    "#2f6c65";

  ctx.fillRect(
    p.x-28*s,
    p.y-88*s,
    66*s,
    19*s
  );

  ctx.fillStyle =
    "#f0f1e9";

  ctx.font =
    `${Math.max(6,9*s)}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "市民中心站",
    p.x+5*s,
    p.y-75*s
  );


  /* route board */

  ctx.fillStyle =
    "#e5e5dc";

  ctx.fillRect(
    p.x-20*s,
    p.y-60*s,
    50*s,
    29*s
  );

  ctx.fillStyle =
    "#526064";

  ctx.font =
    `${Math.max(5,7*s)}px sans-serif`;

  ctx.fillText(
    "32  71  108",
    p.x+5*s,
    p.y-44*s
  );
}


/* ==========================================================
   STREET SIGN
========================================================== */

function drawStreetSign(
  x,y,text
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.strokeStyle =
    "#566361";

  ctx.lineWidth =
    4*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-62*s
  );

  ctx.stroke();

  ctx.fillStyle =
    "#337063";

  ctx.fillRect(
    p.x-43*s,
    p.y-77*s,
    86*s,
    20*s
  );

  ctx.fillStyle =
    "#fff";

  ctx.font =
    `${Math.max(6,9*s)}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    text,
    p.x,
    p.y-63*s
  );
}


/* ==========================================================
   PIGEONS
========================================================== */

const pigeons = [
  [690,3250,0],
  [710,3260,1],
  [1490,2050,2],
  [1510,2070,3]
];

function drawPigeon(
  x,y,index,time
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  const hop =
    Math.sin(
      time*.003 +
      index
    ) * 2*s;

  ctx.fillStyle =
    "#62696a";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y-5*s-hop,
    7*s,
    4*s,
    -.2,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    p.x+5*s,
    p.y-9*s-hop,
    3*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.strokeStyle =
    "#494f50";

  ctx.lineWidth =
    1*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x-2*s,
    p.y-1*s
  );

  ctx.lineTo(
    p.x-3*s,
    p.y+3*s
  );

  ctx.stroke();
}


/* ==========================================================
   WORLD OBJECTS
========================================================== */

function drawObjects(time) {

  const objects=[];


  buildings.forEach(b => {

    objects.push({
      y:b.y,
      draw:() =>
        drawBuilding(b,time)
    });
  });


  trees.forEach(t => {

    objects.push({
      y:t.y,
      draw:() =>
        drawTree(
          t.x,
          t.y,
          time
        )
    });
  });


  lamps.forEach(l => {

    objects.push({
      y:l[1],
      draw:() =>
        drawLamp(
          l[0],
          l[1]
        )
    });
  });


  bikes.forEach(b => {

    objects.push({
      y:b[1],
      draw:() =>
        drawBike(
          b[0],
          b[1]
        )
    });
  });


  benches.forEach(b => {

    objects.push({
      y:b[1],
      draw:() =>
        drawBench(
          b[0],
          b[1]
        )
    });
  });


  trashCans.forEach(t => {

    objects.push({
      y:t[1],
      draw:() =>
        drawTrashCan(
          t[0],
          t[1]
        )
    });
  });


  planters.forEach(p => {

    objects.push({
      y:p[1],
      draw:() =>
        drawPlanter(
          p[0],
          p[1]
        )
    });
  });


  pedestrians.forEach(
    (p,index) => {

      objects.push({
        y:p.y,
        draw:() =>
          drawPerson(
            p.x,
            p.y,
            p.color,
            false,
            index%3===0
          )
      });
    }
  );


  cars.forEach(car => {

    objects.push({
      y:car.y,
      draw:() =>
        drawCar(car)
    });
  });


  scooters.forEach(s => {

    objects.push({
      y:s.y,
      draw:() =>
        drawScooter(s)
    });
  });


  objects.push({
    y:bus.y,
    draw:() =>
      drawBus()
  });


  /* metro */

  objects.push({
    y:3500,
    draw:() =>
      drawMetro(
        640,
        3500
      )
  });

  objects.push({
    y:1850,
    draw:() =>
      drawMetro(
        1560,
        1850
      )
  });


  /* bus stops */

  objects.push({
    y:2850,
    draw:() =>
      drawBusStop(
        640,
        2850
      )
  });

  objects.push({
    y:1300,
    draw:() =>
      drawBusStop(
        1560,
        1300
      )
  });


  /* traffic lights */

  [
    [720,2650],
    [1480,2650],
    [720,1250],
    [1480,1250]
  ].forEach(t => {

    objects.push({
      y:t[1],
      draw:() =>
        drawTrafficLight(
          t[0],
          t[1],
          time
        )
    });
  });


  /* signs */

  objects.push({
    y:3000,
    draw:() =>
      drawStreetSign(
        720,
        3000,
        "钱江路"
      )
  });

  objects.push({
    y:1550,
    draw:() =>
      drawStreetSign(
        1480,
        1550,
        "市民中心"
      )
  });


  /* pigeons */

  pigeons.forEach(p => {

    objects.push({
      y:p[1],
      draw:() =>
        drawPigeon(
          p[0],
          p[1],
          p[2],
          time
        )
    });
  });


  /* player */

  objects.push({
    y:player.y,
    draw:() =>
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
   FOREGROUND OCCLUSION
========================================================== */

function drawForeground(time) {

  const sway =
    Math.sin(
      time*.0007
    ) * 7;


  ctx.save();


  /* huge leaves left */

  ctx.fillStyle =
    "rgba(19,45,36,.38)";

  for (
    let i=0;
    i<9;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      -15 +
      i*18 +
      sway,

      H -
      35 -
      i*17,

      65,
      25,
      -.55,
      0,
      Math.PI*2
    );

    ctx.fill();
  }


  /* huge leaves right */

  for (
    let i=0;
    i<9;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      W +
      15 -
      i*18 -
      sway,

      H -
      45 -
      i*17,

      65,
      25,
      .55,
      0,
      Math.PI*2
    );

    ctx.fill();
  }


  /*
     foreground overhead sign
  */

  if (
    player.y > 1900 &&
    player.y < 2500
  ) {

    ctx.globalAlpha =
      .38;

    ctx.fillStyle =
      "#26383b";

    ctx.fillRect(
      W*.08,
      55,
      W*.28,
      38
    );

    ctx.fillStyle =
      "#e8ece7";

    ctx.font =
      "13px sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "市民中心  →",
      W*.22,
      80
    );
  }

  ctx.restore();
}


/* ==========================================================
   MOVING SUN PATCHES
========================================================== */

function drawSunPatches(time) {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  ctx.globalAlpha =
    .10;

  for (
    let i=0;
    i<7;
    i++
  ) {

    const x =
      (
        i*240 +
        time*.012
      ) %
      (W+350)-170;

    const y =
      H*.45 +
      noise(i*33)*H*.45;

    ctx.fillStyle =
      "#fff0b6";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      110,
      26,
      -.25,
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

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  const light =
    ctx.createLinearGradient(
      0,0,
      W,H
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
    0,0,W,H
  );

  ctx.restore();


  const haze =
    ctx.createLinearGradient(
      0,0,
      0,H*.55
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
    0,0,
    W,H*.55
  );
}


/* ==========================================================
   DRAW
========================================================== */

function draw(time) {

  ctx.clearRect(
    0,0,W,H
  );

  drawSky();

  drawClouds(time);

  drawSkyline();

  drawRoad();

  drawSidewalk();

  drawTactile();

  drawRoadMarkings();

  drawCrosswalk(2600);

  drawCrosswalk(1200);


  manholes.forEach(m => {
    drawManhole(
      m[0],
      m[1]
    );
  });


  drawObjects(time);

  drawSunPatches(time);

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
      (time-previous)/1000,
      .05
    );

  previous=time;

  updatePlayer(dt);

  updateCars(dt);

  updateBus(dt);

  updateScooters(dt);

  updatePedestrians(dt);

  draw(time);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
