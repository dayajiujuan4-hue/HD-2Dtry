/* ==========================================================
   杭州探索録3
   夜行杭州
   OPEN DISTRICT Ver.0.5
========================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const interactionBox =
  document.getElementById("interaction");

const interactionText =
  document.getElementById("interactionText");

const locationTitle =
  document.getElementById("locationTitle");

const locationSub =
  document.getElementById("locationSub");


let W = 0;
let H = 0;

const DPR =
  Math.min(
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
    DPR,0,0,DPR,0,0
  );
}

window.addEventListener("resize",resize);

resize();


/* ==========================================================
   STATE
========================================================== */

let scene = "city";

let currentInterior = null;

let returnPosition = {
  x: 1800,
  y: 3250
};

let interactionTarget = null;


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x: 1800,
  y: 3250,

  radius: 18,

  speed: 250,

  moving: false,

  step: 0,

  direction: "up"
};


const camera = {

  x: player.x,
  y: player.y
};


/* ==========================================================
   INPUT
========================================================== */

const keys = {};

let ePressed = false;


window.addEventListener(
  "keydown",
  e => {

    const key =
      e.key.toLowerCase();

    keys[key] = true;

    if (
      key === "e" &&
      !e.repeat
    ) {

      ePressed = true;
    }
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


function noise(n) {

  const x =
    Math.sin(
      n * 12.9898
    ) *
    43758.5453;

  return x -
    Math.floor(x);
}


function glow(color,blur) {

  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}


function noGlow() {

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}


function distance(
  x1,y1,
  x2,y2
) {

  return Math.hypot(
    x2-x1,
    y2-y1
  );
}


/* ==========================================================
   3/4 PROJECTION
========================================================== */

const VIEW = {

  playerScreenY: .69,

  depthScale: .53,

  perspective: .00028
};


function project(
  x,
  y,
  z=0
) {

  const dy =
    y-camera.y;

  let scale =
    1+
    dy*
    VIEW.perspective;

  scale =
    clamp(
      scale,
      .48,
      1.52
    );

  return {

    x:
      W/2+
      (
        x-camera.x
      )*
      scale,

    y:
      H*
      VIEW.playerScreenY+
      dy*
      VIEW.depthScale-
      z*
      scale,

    scale
  };
}


/* ==========================================================
   COLLISION
========================================================== */

function circleRectCollision(
  cx,
  cy,
  radius,
  rect
) {

  const closestX =
    clamp(
      cx,
      rect.x,
      rect.x+rect.w
    );

  const closestY =
    clamp(
      cy,
      rect.y,
      rect.y+rect.h
    );

  const dx =
    cx-closestX;

  const dy =
    cy-closestY;

  return (
    dx*dx+
    dy*dy
    <
    radius*radius
  );
}


function getCityColliders() {

  return BUILDINGS.map(
    b => ({

      x:b.x,
      y:b.y,

      w:b.w,
      h:b.h
    })
  );
}


function getInteriorColliders() {

  if (
    currentInterior ===
    "convenience"
  ) {

    return [

      {x:130,y:190,w:150,h:390},

      {x:355,y:190,w:120,h:390},

      {x:575,y:190,w:120,h:390},

      {x:790,y:190,w:130,h:390},

      {x:120,y:70,w:800,h:90},

      {x:120,y:610,w:300,h:70},

      {x:630,y:610,w:300,h:70}
    ];
  }


  if (
    currentInterior ===
    "restaurant"
  ) {

    return [

      {x:100,y:80,w:850,h:120},

      {x:140,y:260,w:600,h:80},

      {x:780,y:260,w:150,h:300},

      {x:130,y:470,w:140,h:100},

      {x:340,y:470,w:140,h:100},

      {x:550,y:470,w:140,h:100}
    ];
  }


  if (
    currentInterior ===
    "office"
  ) {

    return [

      {x:120,y:100,w:860,h:100},

      {x:150,y:300,w:250,h:120},

      {x:700,y:300,w:250,h:120},

      {x:170,y:520,w:220,h:90},

      {x:710,y:520,w:220,h:90}
    ];
  }

  return [];
}


/* ==========================================================
   CAN MOVE
========================================================== */

function canMoveTo(
  x,
  y
) {

  const radius =
    player.radius;


  if (
    scene==="city"
  ) {

    if (
      x<50 ||
      y<50 ||
      x>WORLD.width-50 ||
      y>WORLD.height-50
    )
      return false;


    const colliders =
      getCityColliders();


    for (
      const rect of colliders
    ) {

      if (
        circleRectCollision(
          x,
          y,
          radius,
          rect
        )
      )
        return false;
    }

    return true;
  }


  const interior =
    INTERIORS[
      currentInterior
    ];


  if (
    x<55 ||
    y<55 ||
    x>
      interior.width-55 ||
    y>
      interior.height-55
  )
    return false;


  for (
    const rect of
    getInteriorColliders()
  ) {

    if (
      circleRectCollision(
        x,
        y,
        radius,
        rect
      )
    )
      return false;
  }

  return true;
}


/* ==========================================================
   PLAYER UPDATE
========================================================== */

function updatePlayer(dt) {

  let dx=0;
  let dy=0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    dy--;
    player.direction="up";
  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy++;
    player.direction="down";
  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx--;
    player.direction="left";
  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx++;
    player.direction="right";
  }


  player.moving =
    dx!==0 ||
    dy!==0;


  if (
    player.moving
  ) {

    const len =
      Math.hypot(dx,dy);

    dx/=len;
    dy/=len;


    const nx =
      player.x+
      dx*
      player.speed*
      dt;


    const ny =
      player.y+
      dy*
      player.speed*
      dt;


    /* X / Y separate collision
       makes sliding along walls possible
    */

    if (
      canMoveTo(
        nx,
        player.y
      )
    ) {

      player.x=nx;
    }


    if (
      canMoveTo(
        player.x,
        ny
      )
    ) {

      player.y=ny;
    }


    player.step +=
      dt*10;
  }


  camera.x +=
    (
      player.x-
      camera.x
    )*.10;


  camera.y +=
    (
      player.y-
      camera.y
    )*.09;
}


/* ==========================================================
   INTERACTION
========================================================== */

function updateInteraction() {

  interactionTarget=null;


  if (
    scene==="city"
  ) {

    for (
      const building of
      BUILDINGS
    ) {

      if (
        !building.enter ||
        !building.entrance
      )
        continue;


      const d =
        distance(
          player.x,
          player.y,
          building.entrance.x,
          building.entrance.y
        );


      if (
        d<95
      ) {

        interactionTarget={
          type:"enter",
          building
        };

        break;
      }
    }
  }


  else {

    const interior =
      INTERIORS[
        currentInterior
      ];


    const d =
      distance(
        player.x,
        player.y,
        interior.exit.x,
        interior.exit.y
      );


    if (
      d<75
    ) {

      interactionTarget={
        type:"exit"
      };
    }
  }


  if (
    interactionTarget
  ) {

    interactionBox.classList.remove(
      "hidden"
    );


    if (
      interactionTarget.type===
      "enter"
    ) {

      interactionText.textContent =
        interactionTarget
        .building
        .sign +
        " に入る";
    }

    else {

      interactionText.textContent =
        "街へ出る";
    }
  }


  else {

    interactionBox.classList.add(
      "hidden"
    );
  }


  if (
    ePressed &&
    interactionTarget
  ) {

    if (
      interactionTarget.type===
      "enter"
    ) {

      enterBuilding(
        interactionTarget.building
      );
    }

    else {

      exitBuilding();
    }
  }


  ePressed=false;
}


/* ==========================================================
   ENTER / EXIT
========================================================== */

function enterBuilding(building) {

  returnPosition = {

    x:
      building.entrance.x,

    y:
      building.entrance.y+105
  };


  currentInterior =
    building.enter;

  scene="interior";


  const interior =
    INTERIORS[
      currentInterior
    ];


  player.x =
    interior.spawn.x;

  player.y =
    interior.spawn.y;


  camera.x =
    player.x;

  camera.y =
    player.y;


  locationTitle.textContent =
    interior.title;

  locationSub.textContent =
    interior.sub;
}


function exitBuilding() {

  scene="city";

  currentInterior=null;


  player.x =
    returnPosition.x;

  player.y =
    returnPosition.y;


  camera.x =
    player.x;

  camera.y =
    player.y;


  locationTitle.textContent =
    "夜行杭州";

  locationSub.textContent =
    "HANGZHOU · NIGHT DISTRICT";
}


/* ==========================================================
   NIGHT BACKGROUND
========================================================== */

function drawNightBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,0,0,H
    );


  gradient.addColorStop(
    0,
    "#02050c"
  );

  gradient.addColorStop(
    .35,
    "#07111b"
  );

  gradient.addColorStop(
    .7,
    "#10131d"
  );

  gradient.addColorStop(
    1,
    "#08090d"
  );


  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,0,W,H
  );
}


/* ==========================================================
   CITY FLOOR
========================================================== */

function drawCityFloor() {

  /* city block ground */

  ctx.fillStyle =
    "#11171c";

  ctx.fillRect(
    0,0,W,H
  );


  /* roads */

  for (
    const road of ROADS
  ) {

    const a =
      project(
        road.x,
        road.y
      );

    const b =
      project(
        road.x+road.w,
        road.y
      );

    const c =
      project(
        road.x+road.w,
        road.y+road.h
      );

    const d =
      project(
        road.x,
        road.y+road.h
      );


    ctx.fillStyle =
      "#0b1015";


    ctx.beginPath();

    ctx.moveTo(a.x,a.y);
    ctx.lineTo(b.x,b.y);
    ctx.lineTo(c.x,c.y);
    ctx.lineTo(d.x,d.y);

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
      "rgba(91,126,138,.20)";

    ctx.lineWidth=2;

    ctx.stroke();
  }


  drawRoadDetails();
}


/* ==========================================================
   ROAD DETAIL
========================================================== */

function drawRoadDetails() {

  /*
    Main boulevard lane lines
  */

  for (
    const x of [
      1600,
      1800,
      2000
    ]
  ) {

    for (
      let y=80;
      y<3500;
      y+=150
    ) {

      const a =
        project(x,y);

      const b =
        project(
          x,
          y+70
        );


      ctx.strokeStyle =
        "rgba(207,218,220,.36)";

      ctx.lineWidth =
        Math.max(
          1,
          4*a.scale
        );


      ctx.beginPath();

      ctx.moveTo(
        a.x,a.y
      );

      ctx.lineTo(
        b.x,b.y
      );

      ctx.stroke();
    }
  }


  /* wet surface */

  for (
    let i=0;
    i<170;
    i++
  ) {

    const x =
      noise(i*41)*
      WORLD.width;

    const y =
      noise(i*73)*
      WORLD.height;


    const p =
      project(x,y);


    if (
      p.y<-50 ||
      p.y>H+50
    )
      continue;


    ctx.strokeStyle =
      i%3===0
      ? "rgba(91,190,211,.06)"
      : "rgba(255,255,255,.025)";


    ctx.lineWidth =
      Math.max(
        .5,
        p.scale
      );


    ctx.beginPath();

    ctx.moveTo(
      p.x,p.y
    );

    ctx.lineTo(
      p.x+8*p.scale,
      p.y+18*p.scale
    );

    ctx.stroke();
  }
}


/* ==========================================================
   BUILDING
========================================================== */

function drawBuilding(b,time) {

   if (window.drawDetailedBuilding) {
  window.drawDetailedBuilding(b, time);
  return;
}

  const p =
    project(
      b.x+b.w/2,
      b.y+b.h
    );


  if (
    p.y<-900 ||
    p.y>H+900
  )
    return;


  const s=p.scale;

  const width =
    b.w*s;

  const height =
    (
      180+
      b.floors*25
    )*s;


  const x =
    p.x-width/2;

  const y =
    p.y;


  /* ground shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.42)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+35*s,
    y+15*s,
    width*.48,
    30*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* facade */

  const facade =
    ctx.createLinearGradient(
      x,
      y-height,
      x+width,
      y
    );


  facade.addColorStop(
    0,
    "#162631"
  );

  facade.addColorStop(
    .55,
    "#0d1921"
  );

  facade.addColorStop(
    1,
    "#081117"
  );


  ctx.fillStyle =
    facade;


  ctx.fillRect(
    x,
    y-height,
    width,
    height
  );


  /* side wall */

  ctx.fillStyle =
    "#071016";


  ctx.beginPath();

  ctx.moveTo(
    x+width,
    y-height
  );

  ctx.lineTo(
    x+width+70*s,
    y-height-35*s
  );

  ctx.lineTo(
    x+width+70*s,
    y-35*s
  );

  ctx.lineTo(
    x+width,
    y
  );

  ctx.closePath();

  ctx.fill();


  /* windows */

  const cols =
    Math.max(
      5,
      Math.floor(
        b.w/100
      )
    );


  const rows =
    Math.max(
      5,
      b.floors
    );


  const cellW =
    width/cols;

  const usableHeight =
    height-95*s;

  const cellH =
    usableHeight/rows;


  for (
    let row=0;
    row<rows;
    row++
  ) {

    for (
      let col=0;
      col<cols;
      col++
    ) {

      const seed =
        b.x+
        b.y+
        row*91+
        col*37;


      const lit =
        noise(seed)>.61;


      if (
        lit
      ) {

        const c =
          noise(seed+50);


        ctx.fillStyle =
          c>.67
          ? "rgba(78,211,237,.40)"
          : c>.34
          ? "rgba(255,194,104,.40)"
          : "rgba(201,94,224,.28)";
      }

      else {

        ctx.fillStyle =
          "rgba(4,11,15,.67)";
      }


      ctx.fillRect(

        x+
        col*cellW+
        cellW*.17,

        y-height+
        row*cellH+
        cellH*.20,

        cellW*.64,

        cellH*.55
      );
    }
  }


  /* shop / entrance floor */

  ctx.fillStyle =
    "#061014";

  ctx.fillRect(
    x,
    y-88*s,
    width,
    88*s
  );


  /* entrance */

  if (
    b.enter
  ) {

    const doorX =
      x+
      width*.5;


    glow(
      b.neon,
      17*s
    );


    ctx.fillStyle =
      "rgba(75,210,225,.18)";


    ctx.fillRect(
      doorX-32*s,
      y-72*s,
      64*s,
      72*s
    );


    ctx.strokeStyle =
      b.neon;

    ctx.lineWidth =
      3*s;


    ctx.strokeRect(
      doorX-32*s,
      y-72*s,
      64*s,
      72*s
    );


    noGlow();
  }


  /* neon sign */

  glow(
    b.neon,
    17*s
  );


  ctx.strokeStyle =
    b.neon;

  ctx.lineWidth =
    2*s;


  ctx.strokeRect(
    x+20*s,
    y-130*s,
    Math.min(
      width-40*s,
      250*s
    ),
    38*s
  );


  noGlow();


  ctx.fillStyle =
    "#eaffff";


  ctx.font =
    `bold ${
      Math.max(
        8,
        13*s
      )
    }px sans-serif`;


  ctx.textAlign =
    "left";


  ctx.fillText(
    b.sign,
    x+30*s,
    y-105*s
  );


  /* roof */

  ctx.fillStyle =
    "#1a2b32";


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
    x+width+70*s,
    y-height-35*s
  );

  ctx.lineTo(
    x+70*s,
    y-height-35*s
  );

  ctx.closePath();

  ctx.fill();


  /* rooftop machinery */

  ctx.fillStyle =
    "#27363b";


  ctx.fillRect(
    x+width*.18,
    y-height-28*s,
    70*s,
    28*s
  );


  ctx.fillRect(
    x+width*.65,
    y-height-40*s,
    90*s,
    40*s
  );


  /* antenna */

  ctx.strokeStyle =
    "#48585e";

  ctx.lineWidth =
    2*s;


  ctx.beginPath();

  ctx.moveTo(
    x+width*.72,
    y-height-40*s
  );

  ctx.lineTo(
    x+width*.72,
    y-height-105*s
  );

  ctx.stroke();


  if (
    Math.floor(time/650)%2
  ) {

    glow(
      "#ff4056",
      10*s
    );


    ctx.fillStyle =
      "#ff4056";


    ctx.beginPath();

    ctx.arc(
      x+width*.72,
      y-height-107*s,
      3*s,
      0,
      Math.PI*2
    );

    ctx.fill();


    noGlow();
  }
}


/* ==========================================================
   TREE
========================================================== */

function drawTree(tree,time) {

  const p =
    project(
      tree.x,
      tree.y
    );


  const s=p.scale;

  const sway =
    Math.sin(
      time*.001+
      tree.y*.01
    )*3*s;


  ctx.fillStyle =
    "rgba(0,0,0,.32)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+20*s,
    p.y+5*s,
    50*s,
    14*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.strokeStyle =
    "#27392f";

  ctx.lineWidth =
    9*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,p.y
  );

  ctx.lineTo(
    p.x+sway,
    p.y-76*s
  );

  ctx.stroke();


  const leaves = [

    [-25,-90,30],
    [8,-105,36],
    [38,-88,27],
    [-8,-70,32],
    [25,-120,24]
  ];


  leaves.forEach(
    (l,i) => {

      ctx.fillStyle =
        i%2
        ? "#173c34"
        : "#21483e";


      ctx.beginPath();

      ctx.arc(
        p.x+l[0]*s+sway,
        p.y+l[1]*s,
        l[2]*s,
        0,
        Math.PI*2
      );

      ctx.fill();
    }
  );
}


/* ==========================================================
   STREET LIGHT
========================================================== */

function drawStreetLight(light) {

  const p =
    project(
      light.x,
      light.y
    );


  const s=p.scale;


  ctx.strokeStyle =
    "#38484f";

  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,p.y
  );

  ctx.lineTo(
    p.x,
    p.y-115*s
  );

  ctx.lineTo(
    p.x+30*s,
    p.y-115*s
  );

  ctx.stroke();


  glow(
    "#dff8ff",
    16*s
  );


  ctx.fillStyle =
    "#e9fcff";


  ctx.beginPath();

  ctx.ellipse(
    p.x+34*s,
    p.y-115*s,
    10*s,
    5*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  noGlow();
}


/* ==========================================================
   STREET SIGN
========================================================== */

function drawStreetSign(sign) {

  const p =
    project(
      sign.x,
      sign.y
    );


  const s=p.scale;


  ctx.strokeStyle =
    "#34464e";

  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-95*s
  );

  ctx.stroke();


  glow(
    sign.color,
    10*s
  );


  ctx.fillStyle =
    "#081419";


  ctx.fillRect(
    p.x-85*s,
    p.y-120*s,
    170*s,
    32*s
  );


  ctx.strokeStyle =
    sign.color;

  ctx.lineWidth =
    2*s;


  ctx.strokeRect(
    p.x-85*s,
    p.y-120*s,
    170*s,
    32*s
  );


  noGlow();


  ctx.fillStyle =
    sign.color;


  ctx.font =
    `${Math.max(
      7,
      10*s
    )}px sans-serif`;


  ctx.textAlign =
    "center";


  ctx.fillText(
    sign.text,
    p.x,
    p.y-99*s
  );
}


/* ==========================================================
   CHARACTER
========================================================== */

function drawCharacter(
  x,
  y,
  color,
  isPlayer=false
) {

  const p =
    project(x,y);

  const s=p.scale;


  let bob=0;


  if (
    isPlayer &&
    player.moving
  ) {

    bob =
      Math.sin(
        player.step
      )*
      2.3*s;
  }


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.40)";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+4*s,
    16*s,
    6*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* legs */

  ctx.fillStyle =
    "#11171b";


  ctx.fillRect(
    p.x-7*s,
    p.y-18*s+bob,
    5*s,
    20*s
  );


  ctx.fillRect(
    p.x+2*s,
    p.y-18*s+bob,
    5*s,
    20*s
  );


  /* body */

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


  /* face */

  ctx.fillStyle =
    "#c99576";


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
    "#141619";


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

    glow(
      "#55eaff",
      8*s
    );


    ctx.fillStyle =
      "#55eaff";


    ctx.fillRect(
      p.x-12*s,
      p.y-47*s+bob,
      24*s,
      3*s
    );


    noGlow();
  }
}


/* ==========================================================
   CITY DRAW OBJECTS
========================================================== */

function drawCityObjects(time) {

  const objects=[];


  BUILDINGS.forEach(
    b => {

      objects.push({

        y:
          b.y+b.h,

        draw:
          () =>
            drawBuilding(
              b,time
            )
      });
    }
  );


  TREES.forEach(
    tree => {

      objects.push({

        y:tree.y,

        draw:
          () =>
            drawTree(
              tree,time
            )
      });
    }
  );


  STREET_LIGHTS.forEach(
    light => {

      objects.push({

        y:light.y,

        draw:
          () =>
            drawStreetLight(
              light
            )
      });
    }
  );


  STREET_SIGNS.forEach(
    sign => {

      objects.push({

        y:sign.y,

        draw:
          () =>
            drawStreetSign(
              sign
            )
      });
    }
  );


  NPCS.forEach(
    npc => {

      objects.push({

        y:npc.y,

        draw:
          () =>
            drawCharacter(
              npc.x,
              npc.y,
              npc.color
            )
      });
    }
  );


  objects.push({

    y:player.y,

    draw:
      () =>
        drawCharacter(
          player.x,
          player.y,
          "#27535a",
          true
        )
  });


  objects.sort(
    (a,b)=>
      a.y-b.y
  );


  objects.forEach(
    o=>o.draw()
  );
}


/* ==========================================================
   INTERIOR FLOOR
========================================================== */

function drawInteriorFloor(
  interior,
  theme
) {

  ctx.fillStyle =
    theme.floor;


  ctx.fillRect(
    0,0,W,H
  );


  const tile=80;


  for (
    let x=0;
    x<interior.width;
    x+=tile
  ) {

    for (
      let y=0;
      y<interior.height;
      y+=tile
    ) {

      const a =
        project(x,y);

      const b =
        project(
          x+tile,y
        );

      const c =
        project(
          x+tile,
          y+tile
        );

      const d =
        project(
          x,
          y+tile
        );


      ctx.fillStyle =
        (
          (
            x/tile+
            y/tile
          )%2===0
        )
        ? theme.tileA
        : theme.tileB;


      ctx.beginPath();

      ctx.moveTo(a.x,a.y);
      ctx.lineTo(b.x,b.y);
      ctx.lineTo(c.x,c.y);
      ctx.lineTo(d.x,d.y);

      ctx.closePath();

      ctx.fill();


      ctx.strokeStyle =
        "rgba(255,255,255,.035)";

      ctx.lineWidth=1;

      ctx.stroke();
    }
  }
}


/* ==========================================================
   INTERIOR RECT OBJECT
========================================================== */

function drawFurniture(
  rect,
  options={}
) {

  const centerX =
    rect.x+
    rect.w/2;


  const bottomY =
    rect.y+
    rect.h;


  const p =
    project(
      centerX,
      bottomY
    );


  const s=p.scale;


  const w =
    rect.w*s;


  const visualH =
    (
      options.height ||
      80
    )*s;


  const x =
    p.x-w/2;


  const y =
    p.y;


  ctx.fillStyle =
    options.side ||
    "#192329";


  ctx.fillRect(
    x,
    y-visualH,
    w,
    visualH
  );


  ctx.fillStyle =
    options.top ||
    "#33434a";


  ctx.beginPath();

  ctx.moveTo(
    x,
    y-visualH
  );

  ctx.lineTo(
    x+w,
    y-visualH
  );

  ctx.lineTo(
    x+w+25*s,
    y-visualH-14*s
  );

  ctx.lineTo(
    x+25*s,
    y-visualH-14*s
  );

  ctx.closePath();

  ctx.fill();


  if (
    options.glow
  ) {

    glow(
      options.glow,
      10*s
    );


    ctx.strokeStyle =
      options.glow;

    ctx.lineWidth =
      2*s;


    ctx.strokeRect(
      x+6*s,
      y-visualH+8*s,
      w-12*s,
      15*s
    );


    noGlow();
  }
}


/* ==========================================================
   CONVENIENCE STORE
========================================================== */

function drawConvenience(time) {

  const interior =
    INTERIORS.convenience;


  drawInteriorFloor(
    interior,
    {
      floor:"#11191c",
      tileA:"#182226",
      tileB:"#151e22"
    }
  );


  const objects=[];


  const shelves = [

    {x:130,y:190,w:150,h:390},

    {x:355,y:190,w:120,h:390},

    {x:575,y:190,w:120,h:390},

    {x:790,y:190,w:130,h:390}
  ];


  shelves.forEach(
    (shelf,index) => {

      objects.push({

        y:
          shelf.y+
          shelf.h,

        draw:()=>{

          drawFurniture(
            shelf,
            {
              height:78,
              side:"#283236",
              top:"#47565b",
              glow:
                index%2
                ? "#45e7ff"
                : "#ff536c"
            }
          );


          /* products */

          const p =
            project(
              shelf.x+
              shelf.w/2,
              shelf.y+
              shelf.h
            );


          const sc=p.scale;


          for (
            let i=0;
            i<8;
            i++
          ) {

            ctx.fillStyle =
              [
                "#e6a94a",
                "#59b6c7",
                "#ce5f75",
                "#83a95c"
              ][i%4];


            ctx.fillRect(
              p.x-
              shelf.w*
              sc*.36+
              i*
              shelf.w*
              sc*.09,

              p.y-68*sc,

              6*sc,

              14*sc
            );
          }
        }
      });
    }
  );


  /* fridge */

  objects.push({

    y:160,

    draw:()=>{

      const fridge =
        {x:120,y:70,w:800,h:90};


      drawFurniture(
        fridge,
        {
          height:135,
          side:"#162a30",
          top:"#334c52",
          glow:"#45e7ff"
        }
      );


      const p =
        project(
          520,
          160
        );


      const s=p.scale;


      for (
        let i=0;
        i<8;
        i++
      ) {

        ctx.strokeStyle =
          "rgba(117,219,235,.35)";


        ctx.strokeRect(
          p.x-
          400*s+
          i*100*s,

          p.y-125*s,

          92*s,

          110*s
        );
      }
    }
  });


  /* counter */

  const counter =
    {x:630,y:610,w:300,h:70};


  objects.push({

    y:680,

    draw:()=>{

      drawFurniture(
        counter,
        {
          height:90,
          side:"#26353a",
          top:"#56676c",
          glow:"#ff536c"
        }
      );


      const p =
        project(
          780,
          680
        );


      const s=p.scale;


      ctx.fillStyle =
        "#182126";


      ctx.fillRect(
        p.x-30*s,
        p.y-125*s,
        60*s,
        42*s
      );


      ctx.fillStyle =
        "#59e5ff";


      ctx.fillRect(
        p.x-24*s,
        p.y-119*s,
        48*s,
        28*s
      );
    }
  });


  /* cashier */

  objects.push({

    y:590,

    draw:()=>{

      drawCharacter(
        780,
        590,
        "#754958"
      );
    }
  });


  /* player */

  objects.push({

    y:player.y,

    draw:()=>{

      drawCharacter(
        player.x,
        player.y,
        "#27535a",
        true
      );
    }
  });


  objects.sort(
    (a,b)=>a.y-b.y
  );


  objects.forEach(
    o=>o.draw()
  );


  drawExitMarker(
    interior.exit.x,
    interior.exit.y
  );
}


/* ==========================================================
   RESTAURANT
========================================================== */

function drawRestaurant(time) {

  const interior =
    INTERIORS.restaurant;


  drawInteriorFloor(
    interior,
    {
      floor:"#17100d",
      tileA:"#241713",
      tileB:"#20130f"
    }
  );


  const objects=[];


  /* kitchen */

  objects.push({

    y:200,

    draw:()=>{

      drawFurniture(
        {
          x:100,
          y:80,
          w:850,
          h:120
        },
        {
          height:150,
          side:"#332522",
          top:"#5a4037"
        }
      );


      const p =
        project(
          525,
          200
        );


      const s=p.scale;


      ctx.fillStyle =
        "#e5c69c";


      ctx.font =
        `bold ${14*s}px sans-serif`;


      ctx.textAlign =
        "center";


      ctx.fillText(
        "杭帮菜 · 面 · 夜宵 · 小笼",
        p.x,
        p.y-95*s
      );
    }
  });


  /* long counter */

  objects.push({

    y:340,

    draw:()=>{

      drawFurniture(
        {
          x:140,
          y:260,
          w:600,
          h:80
        },
        {
          height:78,
          side:"#4c2d22",
          top:"#7c4b35",
          glow:"#ff604e"
        }
      );
    }
  });


  /* stools */

  for (
    let i=0;
    i<6;
    i++
  ) {

    const x =
      190+i*92;


    objects.push({

      y:390,

      draw:()=>{

        const p =
          project(
            x,
            390
          );


        const s=p.scale;


        ctx.fillStyle =
          "#472b22";


        ctx.fillRect(
          p.x-11*s,
          p.y-31*s,
          22*s,
          31*s
        );


        ctx.fillStyle =
          "#744433";


        ctx.beginPath();

        ctx.ellipse(
          p.x,
          p.y-31*s,
          15*s,
          7*s,
          0,
          0,
          Math.PI*2
        );

        ctx.fill();
      }
    });
  }


  /* tables */

  const tables = [

    {x:130,y:470,w:140,h:100},

    {x:340,y:470,w:140,h:100},

    {x:550,y:470,w:140,h:100}
  ];


  tables.forEach(
    table => {

      objects.push({

        y:
          table.y+
          table.h,

        draw:()=>{

          drawFurniture(
            table,
            {
              height:55,
              side:"#3c281f",
              top:"#704936"
            }
          );
        }
      });
    }
  );


  /* chef */

  objects.push({

    y:230,

    draw:()=>{

      drawCharacter(
        520,
        230,
        "#e4ddd1"
      );
    }
  });


  /* customers */

  objects.push({

    y:430,

    draw:()=>{

      drawCharacter(
        310,
        430,
        "#565e72"
      );
    }
  });


  objects.push({

    y:610,

    draw:()=>{

      drawCharacter(
        620,
        610,
        "#74544b"
      );
    }
  });


  objects.push({

    y:player.y,

    draw:()=>{

      drawCharacter(
        player.x,
        player.y,
        "#27535a",
        true
      );
    }
  });


  objects.sort(
    (a,b)=>a.y-b.y
  );


  objects.forEach(
    o=>o.draw()
  );


  /* lanterns */

  for (
    let i=0;
    i<6;
    i++
  ) {

    const p =
      project(
        180+i*130,
        120,
        180
      );


    glow(
      "#ff493e",
      16
    );


    ctx.fillStyle =
      "#dc3f36";


    ctx.beginPath();

    ctx.ellipse(
      p.x,
      p.y,
      13*p.scale,
      19*p.scale,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();


    noGlow();
  }


  /* steam */

  for (
    let i=0;
    i<5;
    i++
  ) {

    const p =
      project(
        410+i*28,
        245,
        50
      );


    const life =
      (
        time*.0002+
        i*.19
      )%1;


    ctx.fillStyle =
      `rgba(230,225,215,${
        .13*(1-life)
      })`;


    ctx.beginPath();

    ctx.arc(
      p.x+
      Math.sin(
        time*.001+i
      )*8,

      p.y-
      life*70,

      (
        8+
        life*15
      )*
      p.scale,

      0,
      Math.PI*2
    );

    ctx.fill();
  }


  drawExitMarker(
    interior.exit.x,
    interior.exit.y
  );
}


/* ==========================================================
   OFFICE
========================================================== */

function drawOffice(time) {

  const interior =
    INTERIORS.office;


  drawInteriorFloor(
    interior,
    {
      floor:"#0d151a",
      tileA:"#152127",
      tileB:"#111b20"
    }
  );


  const objects=[];


  /* reception wall */

  objects.push({

    y:200,

    draw:()=>{

      drawFurniture(
        {
          x:120,
          y:100,
          w:860,
          h:100
        },
        {
          height:170,
          side:"#15262e",
          top:"#29424b",
          glow:"#d55cff"
        }
      );


      const p =
        project(
          550,
          200
        );


      const s=p.scale;


      glow(
        "#d55cff",
        15*s
      );


      ctx.fillStyle =
        "#d55cff";


      ctx.font =
        `bold ${22*s}px sans-serif`;


      ctx.textAlign =
        "center";


      ctx.fillText(
        "未来都市研究所",
        p.x,
        p.y-105*s
      );


      noGlow();


      ctx.fillStyle =
        "#8fcbd7";


      ctx.font =
        `${9*s}px sans-serif`;


      ctx.fillText(
        "FUTURE CITY LAB · HANGZHOU",
        p.x,
        p.y-83*s
      );
    }
  });


  /* reception desk */

  objects.push({

    y:420,

    draw:()=>{

      drawFurniture(
        {
          x:150,
          y:300,
          w:250,
          h:120
        },
        {
          height:85,
          side:"#25333a",
          top:"#52646b",
          glow:"#48e6ff"
        }
      );
    }
  });


  /* holographic display */

  objects.push({

    y:420,

    draw:()=>{

      const p =
        project(
          825,
          420
        );


      const s=p.scale;


      ctx.fillStyle =
        "#17242a";


      ctx.fillRect(
        p.x-100*s,
        p.y-70*s,
        200*s,
        70*s
      );


      glow(
        "#48e6ff",
        18*s
      );


      ctx.strokeStyle =
        "#48e6ff";


      ctx.strokeRect(
        p.x-80*s,
        p.y-145*s,
        160*s,
        70*s
      );


      ctx.fillStyle =
        "rgba(72,230,255,.08)";


      ctx.fillRect(
        p.x-80*s,
        p.y-145*s,
        160*s,
        70*s
      );


      noGlow();


      ctx.fillStyle =
        "#9af5ff";


      ctx.font =
        `${10*s}px monospace`;


      ctx.textAlign =
        "center";


      ctx.fillText(
        "HANGZHOU // CITY DATA",
        p.x,
        p.y-113*s
      );
    }
  });


  /* sofas */

  [
    {x:170,y:520,w:220,h:90},
    {x:710,y:520,w:220,h:90}
  ]
  .forEach(
    sofa => {

      objects.push({

        y:
          sofa.y+
          sofa.h,

        draw:()=>{

          drawFurniture(
            sofa,
            {
              height:65,
              side:"#25323b",
              top:"#3e505a"
            }
          );
        }
      });
    }
  );


  /* receptionist */

  objects.push({

    y:285,

    draw:()=>{

      drawCharacter(
        275,
        285,
        "#495e73"
      );
    }
  });


  objects.push({

    y:player.y,

    draw:()=>{

      drawCharacter(
        player.x,
        player.y,
        "#27535a",
        true
      );
    }
  });


  objects.sort(
    (a,b)=>a.y-b.y
  );


  objects.forEach(
    o=>o.draw()
  );


  drawExitMarker(
    interior.exit.x,
    interior.exit.y
  );
}


/* ==========================================================
   EXIT MARKER
========================================================== */

function drawExitMarker(
  x,y
) {

  const p =
    project(x,y);


  glow(
    "#55eaff",
    13*p.scale
  );


  ctx.strokeStyle =
    "rgba(85,234,255,.75)";


  ctx.lineWidth =
    2*p.scale;


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    38*p.scale,
    12*p.scale,
    0,
    0,
    Math.PI*2
  );

  ctx.stroke();


  noGlow();
}


/* ==========================================================
   RAIN
========================================================== */

function drawRain(time) {

  ctx.save();


  ctx.strokeStyle =
    "rgba(165,215,225,.14)";


  ctx.lineWidth=1;


  for (
    let i=0;
    i<70;
    i++
  ) {

    const x =
      (
        noise(i*91)*W+
        time*.05
      )%W;


    const y =
      (
        noise(i*37)*H+
        time*.13
      )%H;


    const len =
      8+
      noise(i)*12;


    ctx.beginPath();

    ctx.moveTo(x,y);

    ctx.lineTo(
      x-3,
      y+len
    );

    ctx.stroke();
  }


  ctx.restore();
}


/* ==========================================================
   CITY ATMOSPHERE
========================================================== */

function drawCityAtmosphere() {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  let g =
    ctx.createRadialGradient(
      W*.12,
      H*.60,
      0,
      W*.12,
      H*.60,
      W*.45
    );


  g.addColorStop(
    0,
    "rgba(33,180,220,.07)"
  );


  g.addColorStop(
    1,
    "rgba(33,180,220,0)"
  );


  ctx.fillStyle=g;

  ctx.fillRect(
    0,0,W,H
  );


  g =
    ctx.createRadialGradient(
      W*.88,
      H*.48,
      0,
      W*.88,
      H*.48,
      W*.40
    );


  g.addColorStop(
    0,
    "rgba(205,48,180,.055)"
  );


  g.addColorStop(
    1,
    "rgba(205,48,180,0)"
  );


  ctx.fillStyle=g;

  ctx.fillRect(
    0,0,W,H
  );


  ctx.restore();
}


/* ==========================================================
   DRAW CITY
========================================================== */

function drawCity(time) {

  drawNightBackground();

  drawCityFloor();

  drawCityObjects(time);

  drawRain(time);

  drawCityAtmosphere();
}


/* ==========================================================
   DRAW INTERIOR
========================================================== */

function drawInterior(time) {

  drawNightBackground();


  if (
    currentInterior===
    "convenience"
  ) {

    drawConvenience(time);
  }


  else if (
    currentInterior===
    "restaurant"
  ) {

    drawRestaurant(time);
  }


  else if (
    currentInterior===
    "office"
  ) {

    drawOffice(time);
  }
}


/* ==========================================================
   MAIN DRAW
========================================================== */

function draw(time) {

  ctx.clearRect(
    0,0,W,H
  );


  if (
    scene==="city"
  ) {

    drawCity(time);
  }

  else {

    drawInterior(time);
  }
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
        time-previous
      )/1000,
      .05
    );


  previous=time;


  updatePlayer(dt);

  updateInteraction();

  draw(time);


  requestAnimationFrame(loop);
}


requestAnimationFrame(loop);
