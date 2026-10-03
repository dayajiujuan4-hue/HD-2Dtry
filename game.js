const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resize() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );

  W = window.innerWidth;
  H = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();


/* ================================
   WORLD
================================ */

const WORLD_W = 1800;
const WORLD_H = 1800;


/* ================================
   PLAYER
================================ */

const player = {
  x: 900,
  y: 1420,

  speed: 210,

  radius: 15,

  direction: "down",

  moving: false
};


/* ================================
   CAMERA
================================ */

const camera = {
  x: player.x,
  y: player.y
};


/* ================================
   INPUT
================================ */

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});


/* ================================
   HELPERS
================================ */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function worldToScreen(x, y) {
  return {
    x: x - camera.x + W / 2,
    y: y - camera.y + H / 2
  };
}


/* ================================
   BUILDINGS
================================ */

const buildings = [

  {
    x: 500,
    y: 1040,
    w: 300,
    h: 160,
    name: "龍井茶",
    type: "shop"
  },

  {
    x: 1030,
    y: 960,
    w: 310,
    h: 170,
    name: "村口茶館",
    type: "tea"
  },

  {
    x: 430,
    y: 650,
    w: 270,
    h: 150,
    name: "龍井人家",
    type: "house"
  },

  {
    x: 1070,
    y: 590,
    w: 300,
    h: 160,
    name: "茶農の家",
    type: "house"
  }
];


/* ================================
   NPC
================================ */

const npcs = [
  { x: 820, y: 1120 },
  { x: 940, y: 900 },
  { x: 760, y: 720 },
  { x: 1030, y: 1250 },
  { x: 880, y: 520 }
];


/* ================================
   TREES
================================ */

const trees = [
  {x:350,y:1250,s:1.2},
  {x:420,y:1350,s:1},
  {x:1320,y:1280,s:1.2},
  {x:1420,y:1160,s:1},
  {x:340,y:840,s:1},
  {x:1450,y:760,s:1.3},
  {x:420,y:480,s:1.2},
  {x:1380,y:420,s:1.1}
];


/* ================================
   UPDATE
================================ */

function update(dt) {

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) {
    dy -= 1;
    player.direction = "up";
  }

  if (keys["s"] || keys["arrowdown"]) {
    dy += 1;
    player.direction = "down";
  }

  if (keys["a"] || keys["arrowleft"]) {
    dx -= 1;
    player.direction = "left";
  }

  if (keys["d"] || keys["arrowright"]) {
    dx += 1;
    player.direction = "right";
  }

  player.moving = dx !== 0 || dy !== 0;

  if (dx !== 0 || dy !== 0) {

    const length = Math.hypot(dx,dy);

    dx /= length;
    dy /= length;

    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
  }

  player.x = clamp(player.x,100,WORLD_W-100);
  player.y = clamp(player.y,100,WORLD_H-100);


  /* CAMERA FOLLOW */

  camera.x += (player.x - camera.x) * 0.08;
  camera.y += (player.y - camera.y) * 0.08;
}


/* ================================
   BACKGROUND
================================ */

function drawBackground() {

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    H
  );

  gradient.addColorStop(
    0,
    "#8bc6dd"
  );

  gradient.addColorStop(
    .28,
    "#7fa765"
  );

  gradient.addColorStop(
    1,
    "#9ab36e"
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,W,H);
}


/* ================================
   MOUNTAINS
================================ */

function drawMountains() {

  ctx.save();

  ctx.fillStyle = "#496f54";

  ctx.beginPath();

  ctx.moveTo(0,300);

  ctx.quadraticCurveTo(
    W*.15,
    160,
    W*.3,
    290
  );

  ctx.quadraticCurveTo(
    W*.45,
    120,
    W*.62,
    270
  );

  ctx.quadraticCurveTo(
    W*.8,
    130,
    W,
    260
  );

  ctx.lineTo(W,450);
  ctx.lineTo(0,450);

  ctx.fill();

  ctx.fillStyle =
    "rgba(34,80,54,.45)";

  ctx.beginPath();

  ctx.moveTo(0,340);

  ctx.quadraticCurveTo(
    W*.25,
    220,
    W*.45,
    340
  );

  ctx.quadraticCurveTo(
    W*.7,
    190,
    W,
    330
  );

  ctx.lineTo(W,470);
  ctx.lineTo(0,470);

  ctx.fill();

  ctx.restore();
}


/* ================================
   GROUND
================================ */

function drawGround() {

  const p =
    worldToScreen(0,0);

  ctx.fillStyle =
    "#88a85e";

  ctx.fillRect(
    p.x,
    p.y,
    WORLD_W,
    WORLD_H
  );
}


/* ================================
   TEA FIELDS
================================ */

function drawTeaFields() {

  const fields = [

    {x:120,y:400,w:450,h:120},
    {x:100,y:550,w:400,h:120},
    {x:100,y:700,w:330,h:110},

    {x:1300,y:420,w:380,h:120},
    {x:1350,y:570,w:350,h:120},
    {x:1400,y:720,w:300,h:110},

    {x:100,y:1250,w:430,h:130},
    {x:1280,y:1300,w:430,h:130}

  ];

  fields.forEach(field => {

    const p =
      worldToScreen(
        field.x,
        field.y
      );

    ctx.fillStyle =
      "#557d3d";

    ctx.fillRect(
      p.x,
      p.y,
      field.w,
      field.h
    );

    for(
      let y=10;
      y<field.h;
      y+=22
    ){

      ctx.strokeStyle =
        "#315f35";

      ctx.lineWidth = 8;

      ctx.beginPath();

      ctx.moveTo(
        p.x+10,
        p.y+y
      );

      ctx.lineTo(
        p.x+field.w-10,
        p.y+y
      );

      ctx.stroke();


      ctx.strokeStyle =
        "#7fa657";

      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.moveTo(
        p.x+10,
        p.y+y-4
      );

      ctx.lineTo(
        p.x+field.w-10,
        p.y+y-4
      );

      ctx.stroke();
    }
  });
}


/* ================================
   ROAD
================================ */

function drawRoad() {

  const centerX =
    worldToScreen(
      WORLD_W/2,
      0
    ).x;

  const top =
    worldToScreen(
      0,
      250
    ).y;

  const bottom =
    worldToScreen(
      0,
      1750
    ).y;


  const grad =
    ctx.createLinearGradient(
      0,
      top,
      0,
      bottom
    );

  grad.addColorStop(
    0,
    "#cbb686"
  );

  grad.addColorStop(
    1,
    "#d8c39a"
  );

  ctx.fillStyle = grad;

  ctx.beginPath();

  ctx.moveTo(
    centerX-120,
    top
  );

  ctx.lineTo(
    centerX+120,
    top
  );

  ctx.lineTo(
    centerX+270,
    bottom
  );

  ctx.lineTo(
    centerX-270,
    bottom
  );

  ctx.closePath();
  ctx.fill();


  /* STONE LINES */

  ctx.strokeStyle =
    "rgba(110,90,65,.18)";

  ctx.lineWidth = 1;

  for(
    let y=300;
    y<1750;
    y+=55
  ){

    const p =
      worldToScreen(
        WORLD_W/2,
        y
      );

    const width =
      130 +
      (y/1750)*130;

    ctx.beginPath();

    ctx.moveTo(
      p.x-width,
      p.y
    );

    ctx.lineTo(
      p.x+width,
      p.y
    );

    ctx.stroke();
  }
}


/* ================================
   BUILDING
================================ */

function drawBuilding(b) {

  const p =
    worldToScreen(
      b.x,
      b.y
    );

  const x = p.x;
  const y = p.y;

  const wallHeight = 95;


  /* SHADOW */

  ctx.fillStyle =
    "rgba(0,0,0,.18)";

  ctx.fillRect(
    x+10,
    y+15,
    b.w,
    wallHeight+60
  );


  /* WALL */

  ctx.fillStyle =
    "#eee5ca";

  ctx.fillRect(
    x,
    y,
    b.w,
    wallHeight
  );


  /* WOOD FRAME */

  ctx.strokeStyle =
    "#65472f";

  ctx.lineWidth = 6;

  ctx.strokeRect(
    x,
    y,
    b.w,
    wallHeight
  );


  /* DOOR */

  ctx.fillStyle =
    "#59412e";

  ctx.fillRect(
    x+b.w/2-24,
    y+42,
    48,
    53
  );


  /* WINDOWS */

  ctx.fillStyle =
    "#557069";

  ctx.fillRect(
    x+35,
    y+40,
    42,
    32
  );

  ctx.fillRect(
    x+b.w-77,
    y+40,
    42,
    32
  );


  /* ROOF */

  ctx.fillStyle =
    "#28322f";

  ctx.beginPath();

  ctx.moveTo(
    x-28,
    y+5
  );

  ctx.lineTo(
    x+35,
    y-55
  );

  ctx.lineTo(
    x+b.w-35,
    y-55
  );

  ctx.lineTo(
    x+b.w+28,
    y+5
  );

  ctx.closePath();
  ctx.fill();


  /* ROOF LINES */

  ctx.strokeStyle =
    "#44524b";

  ctx.lineWidth = 3;

  for(
    let i=0;
    i<8;
    i++
  ){

    const xx =
      x +
      (i/7)*b.w;

    ctx.beginPath();

    ctx.moveTo(
      xx,
      y-50
    );

    ctx.lineTo(
      xx,
      y
    );

    ctx.stroke();
  }


  /* SIGN */

  const signW =
    Math.min(
      150,
      b.w-40
    );

  ctx.fillStyle =
    "#604126";

  ctx.fillRect(
    x+b.w/2-signW/2,
    y+10,
    signW,
    30
  );

  ctx.fillStyle =
    "#f2d58a";

  ctx.font =
    "17px serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    b.name,
    x+b.w/2,
    y+31
  );
}


/* ================================
   TREE
================================ */

function drawTree(t) {

  const p =
    worldToScreen(
      t.x,
      t.y
    );

  const s=t.s;

  ctx.fillStyle =
    "#61482f";

  ctx.fillRect(
    p.x-8*s,
    p.y-20*s,
    16*s,
    65*s
  );


  ctx.fillStyle =
    "#315c38";

  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-55*s,
    45*s,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "#4d7b43";

  ctx.beginPath();

  ctx.arc(
    p.x-25*s,
    p.y-45*s,
    30*s,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    p.x+28*s,
    p.y-48*s,
    32*s,
    0,
    Math.PI*2
  );

  ctx.fill();
}


/* ================================
   CHARACTER
================================ */

function drawCharacter(
  x,
  y,
  shirt,
  isPlayer=false
){

  const p =
    worldToScreen(
      x,
      y
    );

  const bob =
    isPlayer &&
    player.moving
    ?
    Math.sin(
      performance.now()*.012
    )*2
    :
    0;


  /* SHADOW */

  ctx.fillStyle =
    "rgba(0,0,0,.22)";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+10,
    17,
    7,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* BODY */

  ctx.fillStyle =
    shirt;

  ctx.fillRect(
    p.x-12,
    p.y-25+bob,
    24,
    30
  );


  /* LEGS */

  ctx.fillStyle =
    "#343536";

  ctx.fillRect(
    p.x-9,
    p.y+3+bob,
    7,
    14
  );

  ctx.fillRect(
    p.x+2,
    p.y+3+bob,
    7,
    14
  );


  /* HEAD */

  ctx.fillStyle =
    "#e6ad83";

  ctx.fillRect(
    p.x-10,
    p.y-43+bob,
    20,
    19
  );


  /* HAIR */

  ctx.fillStyle =
    "#272724";

  ctx.fillRect(
    p.x-11,
    p.y-47+bob,
    22,
    8
  );


  if(isPlayer){

    ctx.fillStyle =
      "rgba(255,255,255,.9)";

    ctx.font =
      "11px sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "YOU",
      p.x,
      p.y-57+bob
    );
  }
}


/* ================================
   DEPTH SORTING
================================ */

function drawWorldObjects() {

  const objects=[];

  buildings.forEach(
    b=>{
      objects.push({
        y:b.y+100,
        draw:()=>drawBuilding(b)
      });
    }
  );

  trees.forEach(
    t=>{
      objects.push({
        y:t.y,
        draw:()=>drawTree(t)
      });
    }
  );

  npcs.forEach(
    n=>{
      objects.push({
        y:n.y,
        draw:()=>
          drawCharacter(
            n.x,
            n.y,
            "#355e78"
          )
      });
    }
  );

  objects.push({
    y:player.y,
    draw:()=>
      drawCharacter(
        player.x,
        player.y,
        "#326b4c",
        true
      )
  });


  objects.sort(
    (a,b)=>a.y-b.y
  );

  objects.forEach(
    o=>o.draw()
  );
}


/* ================================
   FOREGROUND
================================ */

function drawForeground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      H-180,
      0,
      H
    );

  gradient.addColorStop(
    0,
    "rgba(20,60,35,0)"
  );

  gradient.addColorStop(
    1,
    "rgba(15,45,25,.3)"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    H-180,
    W,
    180
  );
}


/* ================================
   GAME LOOP
================================ */

let lastTime =
  performance.now();

function gameLoop(now){

  const dt =
    Math.min(
      (now-lastTime)/1000,
      .05
    );

  lastTime=now;

  update(dt);


  ctx.clearRect(
    0,
    0,
    W,
    H
  );

  drawBackground();

  /*
    山は画面固定の遠景。
    プレイヤーが動いても
    地面よりゆっくり動いて見える。
  */

  drawMountains();

  drawGround();

  drawTeaFields();

  drawRoad();

  drawWorldObjects();

  drawForeground();


  requestAnimationFrame(
    gameLoop
  );
}

requestAnimationFrame(
  gameLoop
);
