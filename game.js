/* ==========================================================
   杭州探索録3｜夜行杭州
   OPEN DISTRICT Ver.0.6

   ・複雑な道路網
   ・建物衝突
   ・3つの入れる建物
   ・3/4 perspective
   ・大型窓
   ・窓越しの室内
   ・室外機
   ・配管
   ・非常階段
   ・店舗
   ・屋上設備
========================================================== */


/* ==========================================================
   CANVAS
========================================================== */

const canvas =
  document.getElementById(
    "gameCanvas"
  );

const ctx =
  canvas.getContext("2d");


const interactionBox =
  document.getElementById(
    "interaction"
  );

const interactionText =
  document.getElementById(
    "interactionText"
  );

const locationTitle =
  document.getElementById(
    "locationTitle"
  );

const locationSub =
  document.getElementById(
    "locationSub"
  );


let W=0;
let H=0;


const DPR =
  Math.min(
    window.devicePixelRatio || 1,
    2
  );


function resize(){

  W =
    window.innerWidth;

  H =
    window.innerHeight;


  canvas.width =
    W*DPR;

  canvas.height =
    H*DPR;


  canvas.style.width =
    W+"px";

  canvas.style.height =
    H+"px";


  ctx.setTransform(
    DPR,0,0,DPR,0,0
  );
}


window.addEventListener(
  "resize",
  resize
);


resize();


/* ==========================================================
   STATE
========================================================== */

let scene =
  "city";

let currentInterior =
  null;

let interactionTarget =
  null;


let returnPosition = {

  x:1800,
  y:3500
};


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x:1800,
  y:3500,

  radius:18,

  speed:260,

  moving:false,

  step:0,

  direction:"up"
};


const camera = {

  x:player.x,
  y:player.y
};


/* ==========================================================
   INPUT
========================================================== */

const keys={};

let ePressed=false;


window.addEventListener(
  "keydown",
  e=>{

    const key =
      e.key.toLowerCase();

    keys[key]=true;


    if(
      key==="e" &&
      !e.repeat
    ){

      ePressed=true;
    }
  }
);


window.addEventListener(
  "keyup",
  e=>{

    keys[
      e.key.toLowerCase()
    ]=false;
  }
);


/* ==========================================================
   HELPERS
========================================================== */

function clamp(
  value,
  min,
  max
){

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function distance(
  x1,y1,
  x2,y2
){

  return Math.hypot(
    x2-x1,
    y2-y1
  );
}


function noise(n){

  const x =
    Math.sin(
      n*12.9898
    )*
    43758.5453;

  return x-
    Math.floor(x);
}


function glow(
  color,
  blur
){

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    blur;
}


function noGlow(){

  ctx.shadowBlur=0;

  ctx.shadowColor=
    "transparent";
}


/* ==========================================================
   ROUND RECT

   Browser compatibility helper.
========================================================== */

function roundRectPath(
  x,y,w,h,r
){

  r=
    Math.min(
      r,
      w/2,
      h/2
    );


  ctx.beginPath();

  ctx.moveTo(
    x+r,
    y
  );

  ctx.lineTo(
    x+w-r,
    y
  );

  ctx.quadraticCurveTo(
    x+w,
    y,
    x+w,
    y+r
  );

  ctx.lineTo(
    x+w,
    y+h-r
  );

  ctx.quadraticCurveTo(
    x+w,
    y+h,
    x+w-r,
    y+h
  );

  ctx.lineTo(
    x+r,
    y+h
  );

  ctx.quadraticCurveTo(
    x,
    y+h,
    x,
    y+h-r
  );

  ctx.lineTo(
    x,
    y+r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x+r,
    y
  );

  ctx.closePath();
}


/* ==========================================================
   PROJECTION
========================================================== */

const VIEW = {

  playerScreenY:.70,

  depthScale:.51,

  perspective:.00029
};


function project(
  x,
  y,
  z=0
){

  const dy =
    y-camera.y;


  let scale =
    1+
    dy*
    VIEW.perspective;


  scale=
    clamp(
      scale,
      .46,
      1.54
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
){

  const closestX =
    clamp(
      cx,
      rect.x,
      rect.x+
      rect.w
    );


  const closestY =
    clamp(
      cy,
      rect.y,
      rect.y+
      rect.h
    );


  const dx =
    cx-
    closestX;

  const dy =
    cy-
    closestY;


  return (
    dx*dx+
    dy*dy
    <
    radius*radius
  );
}


function getCityColliders(){

  return BUILDINGS.map(
    b=>({

      x:b.x,
      y:b.y,
      w:b.w,
      h:b.h
    })
  );
}


function getInteriorColliders(){

  if(
    currentInterior===
    "convenience"
  ){

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


  if(
    currentInterior===
    "restaurant"
  ){

    return [

      {x:100,y:80,w:850,h:120},

      {x:140,y:260,w:600,h:80},

      {x:780,y:260,w:150,h:300},

      {x:130,y:470,w:140,h:100},

      {x:340,y:470,w:140,h:100},

      {x:550,y:470,w:140,h:100}
    ];
  }


  if(
    currentInterior===
    "office"
  ){

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
   MOVEMENT CHECK
========================================================== */

function canMoveTo(
  x,
  y
){

  if(
    scene==="city"
  ){

    if(
      x<40 ||
      y<40 ||
      x>
      WORLD.width-40 ||
      y>
      WORLD.height-40
    ){

      return false;
    }


    for(
      const rect of
      getCityColliders()
    ){

      if(
        circleRectCollision(
          x,
          y,
          player.radius,
          rect
        )
      ){

        return false;
      }
    }


    return true;
  }


  const interior =
    INTERIORS[
      currentInterior
    ];


  if(
    x<50 ||
    y<50 ||
    x>
    interior.width-50 ||
    y>
    interior.height-50
  ){

    return false;
  }


  for(
    const rect of
    getInteriorColliders()
  ){

    if(
      circleRectCollision(
        x,
        y,
        player.radius,
        rect
      )
    ){

      return false;
    }
  }


  return true;
}


/* ==========================================================
   PLAYER UPDATE
========================================================== */

function updatePlayer(dt){

  let dx=0;
  let dy=0;


  if(
    keys["w"] ||
    keys["arrowup"]
  ){

    dy--;
    player.direction="up";
  }


  if(
    keys["s"] ||
    keys["arrowdown"]
  ){

    dy++;
    player.direction="down";
  }


  if(
    keys["a"] ||
    keys["arrowleft"]
  ){

    dx--;
    player.direction="left";
  }


  if(
    keys["d"] ||
    keys["arrowright"]
  ){

    dx++;
    player.direction="right";
  }


  player.moving =
    dx!==0 ||
    dy!==0;


  if(player.moving){

    const len =
      Math.hypot(
        dx,
        dy
      );


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


    if(
      canMoveTo(
        nx,
        player.y
      )
    ){

      player.x=nx;
    }


    if(
      canMoveTo(
        player.x,
        ny
      )
    ){

      player.y=ny;
    }


    player.step +=
      dt*10;
  }


  camera.x +=
    (
      player.x-
      camera.x
    )*.11;


  camera.y +=
    (
      player.y-
      camera.y
    )*.10;
}


/* ==========================================================
   INTERACTION
========================================================== */

function updateInteraction(){

  interactionTarget=
    null;


  if(
    scene==="city"
  ){

    for(
      const building of
      BUILDINGS
    ){

      if(
        !building.enter ||
        !building.entrance
      ){

        continue;
      }


      if(
        distance(
          player.x,
          player.y,
          building.entrance.x,
          building.entrance.y
        )<100
      ){

        interactionTarget={

          type:"enter",

          building
        };

        break;
      }
    }
  }


  else{

    const interior =
      INTERIORS[
        currentInterior
      ];


    if(
      distance(
        player.x,
        player.y,
        interior.exit.x,
        interior.exit.y
      )<78
    ){

      interactionTarget={

        type:"exit"
      };
    }
  }


  if(interactionTarget){

    interactionBox
      .classList
      .remove("hidden");


    if(
      interactionTarget.type===
      "enter"
    ){

      interactionText.textContent =
        interactionTarget
        .building
        .sign+
        " に入る";
    }

    else{

      interactionText.textContent =
        "街へ出る";
    }
  }


  else{

    interactionBox
      .classList
      .add("hidden");
  }


  if(
    ePressed &&
    interactionTarget
  ){

    if(
      interactionTarget.type===
      "enter"
    ){

      enterBuilding(
        interactionTarget
        .building
      );
    }

    else{

      exitBuilding();
    }
  }


  ePressed=false;
}


/* ==========================================================
   ENTER / EXIT
========================================================== */

function enterBuilding(building){

  returnPosition={

    x:
      building
      .entrance
      .x,

    y:
      building
      .entrance
      .y+
      110
  };


  currentInterior =
    building.enter;


  scene=
    "interior";


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


function exitBuilding(){

  scene=
    "city";


  currentInterior=
    null;


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
   BACKGROUND
========================================================== */

function drawNightBackground(){

  const g =
    ctx.createLinearGradient(
      0,0,
      0,H
    );


  g.addColorStop(
    0,
    "#01030a"
  );


  g.addColorStop(
    .35,
    "#06101a"
  );


  g.addColorStop(
    .72,
    "#10131d"
  );


  g.addColorStop(
    1,
    "#07090e"
  );


  ctx.fillStyle=g;

  ctx.fillRect(
    0,0,W,H
  );


  /* distant glow */

  const glowG =
    ctx.createRadialGradient(
      W*.5,
      H*.22,
      0,

      W*.5,
      H*.22,
      W*.58
    );


  glowG.addColorStop(
    0,
    "rgba(42,85,115,.13)"
  );


  glowG.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  ctx.fillStyle =
    glowG;


  ctx.fillRect(
    0,0,W,H
  );
}


/* ==========================================================
   CITY FLOOR
========================================================== */

function drawCityFloor(){

  ctx.fillStyle =
    "#11171c";

  ctx.fillRect(
    0,0,W,H
  );


  for(
    const road of
    ROADS
  ){

    const a =
      project(
        road.x,
        road.y
      );

    const b =
      project(
        road.x+
        road.w,
        road.y
      );

    const c =
      project(
        road.x+
        road.w,
        road.y+
        road.h
      );

    const d =
      project(
        road.x,
        road.y+
        road.h
      );


    ctx.fillStyle =
      road.type==="alley"
      ? "#0b0e11"
      : "#0a1015";


    ctx.beginPath();

    ctx.moveTo(
      a.x,a.y
    );

    ctx.lineTo(
      b.x,b.y
    );

    ctx.lineTo(
      c.x,c.y
    );

    ctx.lineTo(
      d.x,d.y
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
      "rgba(90,126,139,.19)";

    ctx.lineWidth=2;

    ctx.stroke();
  }


  drawRoadDetails();
}


/* ==========================================================
   ROAD DETAILS
========================================================== */

function drawRoadDetails(){

  /* main road markings */

  for(
    const x of
    [1600,1810,2020]
  ){

    for(
      let y=80;
      y<3850;
      y+=155
    ){

      const a =
        project(
          x,y
        );

      const b =
        project(
          x,
          y+72
        );


      ctx.strokeStyle =
        "rgba(210,220,221,.32)";


      ctx.lineWidth =
        Math.max(
          1,
          4*a.scale
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


  /* asphalt patches */

  for(
    let i=0;
    i<110;
    i++
  ){

    const x =
      noise(
        i*37
      )*
      WORLD.width;


    const y =
      noise(
        i*79
      )*
      WORLD.height;


    const p =
      project(x,y);


    if(
      p.y<-30 ||
      p.y>H+30
    ){

      continue;
    }


    ctx.strokeStyle =
      i%3===0
      ? "rgba(68,180,205,.055)"
      : "rgba(255,255,255,.025)";


    ctx.lineWidth =
      Math.max(
        .5,
        p.scale
      );


    ctx.beginPath();

    ctx.moveTo(
      p.x,
      p.y
    );

    ctx.lineTo(
      p.x+
      9*p.scale,

      p.y+
      20*p.scale
    );

    ctx.stroke();
  }


  /* manholes */

  for(
    let i=0;
    i<22;
    i++
  ){

    const x =
      1520+
      noise(i*61)*
      560;


    const y =
      180+
      i*165;


    const p =
      project(x,y);


    if(
      p.y<-50 ||
      p.y>H+50
    ) continue;


    ctx.fillStyle =
      "#1d2529";


    ctx.beginPath();

    ctx.ellipse(
      p.x,
      p.y,
      16*p.scale,
      7*p.scale,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.strokeStyle =
      "#39464a";

    ctx.stroke();
  }
}


/* ==========================================================
   BUILDING STYLE
========================================================== */

function getBuildingStyle(b){

  switch(
    b.visualType
  ){

    case "megaTower":

      return {
        wall:"#101827",
        wall2:"#090f1c",
        frame:"#44395c",
        glass:"#15283b",
        neon:b.neon,
        warmChance:.18,
        acChance:.04,
        pipes:false,
        fireEscape:false,
        megaScreen:true,
        old:false
      };


    case "dataCenter":

      return {
        wall:"#121c22",
        wall2:"#091116",
        frame:"#39484e",
        glass:"#10232d",
        neon:b.neon,
        warmChance:.08,
        acChance:.22,
        pipes:true,
        fireEscape:true,
        megaScreen:false,
        old:false
      };


    case "oldMixed":

      return {
        wall:"#25201e",
        wall2:"#121110",
        frame:"#55433b",
        glass:"#1e2425",
        neon:b.neon,
        warmChance:.52,
        acChance:.47,
        pipes:true,
        fireEscape:true,
        megaScreen:false,
        old:true
      };


    case "dinerBuilding":

      return {
        wall:"#2d211d",
        wall2:"#16110f",
        frame:"#60463b",
        glass:"#272322",
        neon:b.neon,
        warmChance:.68,
        acChance:.52,
        pipes:true,
        fireEscape:true,
        megaScreen:false,
        old:true
      };


    case "apartmentStore":

      return {
        wall:"#20292a",
        wall2:"#111718",
        frame:"#465457",
        glass:"#16282d",
        neon:b.neon,
        warmChance:.58,
        acChance:.50,
        pipes:true,
        fireEscape:false,
        megaScreen:false,
        old:true
      };


    case "futureLab":

      return {
        wall:"#12192c",
        wall2:"#090d19",
        frame:"#383d65",
        glass:"#122d3c",
        neon:b.neon,
        warmChance:.12,
        acChance:.02,
        pipes:false,
        fireEscape:false,
        megaScreen:true,
        old:false
      };


    case "residential":

      return {
        wall:"#292521",
        wall2:"#151412",
        frame:"#504a43",
        glass:"#252729",
        neon:b.neon,
        warmChance:.66,
        acChance:.55,
        pipes:true,
        fireEscape:true,
        megaScreen:false,
        old:true
      };


    case "techOffice":

      return {
        wall:"#10232a",
        wall2:"#081418",
        frame:"#34515a",
        glass:"#10313d",
        neon:b.neon,
        warmChance:.16,
        acChance:.20,
        pipes:true,
        fireEscape:false,
        megaScreen:true,
        old:false
      };


    default:

      return {
        wall:"#13252c",
        wall2:"#091419",
        frame:"#38535b",
        glass:"#12313d",
        neon:b.neon,
        warmChance:.23,
        acChance:.13,
        pipes:false,
        fireEscape:false,
        megaScreen:false,
        old:false
      };
  }
}


/* ==========================================================
   WINDOW ROOM
========================================================== */

function drawWindowRoom(
  x,
  y,
  w,
  h,
  seed,
  style,
  s
){

  const active =
    noise(seed)>.31;


  const warm =
    noise(seed+14)<
    style.warmChance;


  const person =
    noise(seed+25)>.72;


  const monitor =
    noise(seed+31)>.50;


  const plant =
    noise(seed+45)>.78;


  const blinds =
    noise(seed+59)>.76;


  /* deep room */

  ctx.fillStyle =
    active
    ? (
        warm
        ? "rgba(172,103,55,.31)"
        : "rgba(31,103,128,.27)"
      )
    : "rgba(2,7,10,.91)";


  ctx.fillRect(
    x,y,w,h
  );


  if(active){

    /* back wall */

    ctx.fillStyle =
      warm
      ? "rgba(100,65,43,.23)"
      : "rgba(31,67,79,.22)";


    ctx.fillRect(
      x+w*.08,
      y+h*.08,
      w*.84,
      h*.77
    );


    /* ceiling light */

    ctx.fillStyle =
      warm
      ? "rgba(255,218,159,.70)"
      : "rgba(153,231,255,.54)";


    ctx.fillRect(
      x+w*.25,
      y+h*.11,
      w*.48,
      Math.max(
        1,
        2*s
      )
    );


    /* desk */

    if(
      noise(seed+70)>.28
    ){

      ctx.fillStyle =
        "rgba(14,18,20,.85)";


      ctx.fillRect(
        x+w*.13,
        y+h*.65,
        w*.66,
        h*.07
      );


      ctx.fillRect(
        x+w*.18,
        y+h*.72,
        w*.055,
        h*.17
      );


      ctx.fillRect(
        x+w*.70,
        y+h*.72,
        w*.055,
        h*.17
      );
    }


    /* monitor */

    if(monitor){

      const cyan =
        noise(seed+91)>.42;


      glow(
        cyan
        ? "#57eaff"
        : "#c65cff",

        5*s
      );


      ctx.fillStyle =
        cyan
        ? "rgba(70,225,255,.70)"
        : "rgba(199,86,255,.62)";


      ctx.fillRect(
        x+w*.34,
        y+h*.43,
        w*.23,
        h*.18
      );


      noGlow();


      ctx.fillStyle =
        "#080d10";


      ctx.fillRect(
        x+w*.445,
        y+h*.61,
        w*.025,
        h*.07
      );
    }


    /* chair */

    if(
      noise(seed+95)>.45
    ){

      ctx.fillStyle =
        "rgba(12,16,18,.82)";


      ctx.fillRect(
        x+w*.56,
        y+h*.62,
        w*.10,
        h*.18
      );
    }


    /* human */

    if(person){

      const px =
        x+
        w*
        (
          .30+
          noise(seed+120)*.35
        );


      const py =
        y+h*.52;


      ctx.fillStyle =
        "rgba(4,7,9,.83)";


      ctx.beginPath();

      ctx.arc(
        px,
        py,
        Math.max(
          2,
          4*s
        ),
        0,
        Math.PI*2
      );

      ctx.fill();


      ctx.fillRect(
        px-4*s,
        py+4*s,
        8*s,
        15*s
      );
    }


    /* plant */

    if(plant){

      ctx.fillStyle =
        "#273b2d";


      ctx.fillRect(
        x+w*.80,
        y+h*.68,
        7*s,
        13*s
      );


      ctx.fillStyle =
        "#3e7252";


      for(
        let i=0;
        i<4;
        i++
      ){

        ctx.beginPath();

        ctx.ellipse(
          x+w*.82+
          (i-1.5)*3*s,

          y+h*.62+
          Math.abs(
            i-1.5
          )*2*s,

          4*s,
          8*s,

          (
            i-1.5
          )*.3,

          0,
          Math.PI*2
        );

        ctx.fill();
      }
    }
  }


  /* blinds */

  if(blinds){

    ctx.strokeStyle =
      "rgba(190,205,207,.20)";


    ctx.lineWidth =
      Math.max(
        .5,
        .7*s
      );


    for(
      let yy=y+5*s;
      yy<y+h;
      yy+=6*s
    ){

      ctx.beginPath();

      ctx.moveTo(
        x,
        yy
      );

      ctx.lineTo(
        x+w,
        yy
      );

      ctx.stroke();
    }
  }


  /* glass reflection */

  ctx.fillStyle =
    "rgba(152,232,255,.055)";


  ctx.beginPath();

  ctx.moveTo(
    x+w*.07,
    y
  );

  ctx.lineTo(
    x+w*.27,
    y
  );

  ctx.lineTo(
    x+w*.70,
    y+h
  );

  ctx.lineTo(
    x+w*.49,
    y+h
  );

  ctx.closePath();

  ctx.fill();


  /* frame */

  ctx.strokeStyle =
    "rgba(92,124,132,.47)";


  ctx.lineWidth =
    Math.max(
      1,
      1.2*s
    );


  ctx.strokeRect(
    x,y,w,h
  );
}


/* ==========================================================
   AIR CONDITIONER
========================================================== */

function drawAC(
  x,
  y,
  s,
  seed
){

  const w =
    40*s;

  const h =
    22*s;


  ctx.fillStyle =
    "#899395";


  ctx.fillRect(
    x,y,w,h
  );


  ctx.fillStyle =
    "#606b6d";


  ctx.fillRect(
    x+4*s,
    y+4*s,
    20*s,
    13*s
  );


  ctx.strokeStyle =
    "#30393c";


  ctx.lineWidth =
    Math.max(
      1,
      s
    );


  ctx.beginPath();

  ctx.arc(
    x+14*s,
    y+10.5*s,
    6*s,
    0,
    Math.PI*2
  );

  ctx.stroke();


  const rot =
    noise(seed)*
    Math.PI;


  for(
    let i=0;
    i<4;
    i++
  ){

    const a =
      rot+
      i*
      Math.PI/2;


    ctx.beginPath();

    ctx.moveTo(
      x+14*s,
      y+10.5*s
    );

    ctx.lineTo(
      x+14*s+
      Math.cos(a)*5*s,

      y+10.5*s+
      Math.sin(a)*5*s
    );

    ctx.stroke();
  }


  /* vent lines */

  for(
    let i=0;
    i<4;
    i++
  ){

    ctx.beginPath();

    ctx.moveTo(
      x+28*s+
      i*2*s,
      y+4*s
    );

    ctx.lineTo(
      x+28*s+
      i*2*s,
      y+17*s
    );

    ctx.stroke();
  }


  /* bracket */

  ctx.strokeStyle =
    "#4e595b";


  ctx.beginPath();

  ctx.moveTo(
    x+5*s,
    y+h
  );

  ctx.lineTo(
    x+5*s,
    y+h+6*s
  );

  ctx.lineTo(
    x+16*s,
    y+h+6*s
  );

  ctx.stroke();


  /* drain pipe */

  ctx.strokeStyle =
    "rgba(120,130,130,.6)";


  ctx.beginPath();

  ctx.moveTo(
    x+w-3*s,
    y+h*.7
  );

  ctx.lineTo(
    x+w+6*s,
    y+h*.7
  );

  ctx.lineTo(
    x+w+6*s,
    y+h+10*s
  );

  ctx.stroke();
}


/* ==========================================================
   EXTERNAL PIPES
========================================================== */

function drawPipes(
  x,
  y,
  width,
  height,
  s,
  seed
){

  const px =
    noise(seed)>.5
    ? x+width*.08
    : x+width*.92;


  ctx.strokeStyle =
    "rgba(111,121,121,.72)";


  ctx.lineWidth =
    Math.max(
      1.5,
      3*s
    );


  ctx.beginPath();

  ctx.moveTo(
    px,
    y-height*.82
  );

  ctx.lineTo(
    px,
    y-42*s
  );

  ctx.lineTo(
    px+17*s,
    y-25*s
  );

  ctx.stroke();


  /* second thinner pipe */

  ctx.strokeStyle =
    "rgba(75,88,90,.68)";


  ctx.lineWidth =
    Math.max(
      1,
      1.6*s
    );


  ctx.beginPath();

  ctx.moveTo(
    px+9*s,
    y-height*.62
  );

  ctx.lineTo(
    px+9*s,
    y-70*s
  );

  ctx.stroke();


  /* clamps */

  ctx.strokeStyle =
    "rgba(175,178,172,.52)";


  for(
    let yy=
      y-height*.70;

    yy<
      y-80*s;

    yy+=70*s
  ){

    ctx.beginPath();

    ctx.moveTo(
      px-5*s,
      yy
    );

    ctx.lineTo(
      px+6*s,
      yy
    );

    ctx.stroke();
  }
}


/* ==========================================================
   FIRE ESCAPE
========================================================== */

function drawFireEscape(
  x,
  y,
  width,
  height,
  s
){

  const fx =
    x+
    width-
    55*s;


  const top =
    y-
    height*.70;


  const bottom =
    y-
    150*s;


  ctx.strokeStyle =
    "rgba(100,109,110,.68)";


  ctx.lineWidth =
    Math.max(
      1,
      2*s
    );


  for(
    let yy=top;
    yy<bottom;
    yy+=78*s
  ){

    ctx.strokeRect(
      fx-34*s,
      yy,
      64*s,
      10*s
    );


    ctx.beginPath();

    ctx.moveTo(
      fx-27*s,
      yy+10*s
    );

    ctx.lineTo(
      fx+21*s,
      yy+72*s
    );

    ctx.stroke();


    /* railings */

    for(
      let i=0;
      i<5;
      i++
    ){

      const rx =
        fx-30*s+
        i*14*s;


      ctx.beginPath();

      ctx.moveTo(
        rx,
        yy
      );

      ctx.lineTo(
        rx,
        yy-16*s
      );

      ctx.stroke();
    }
  }


  ctx.beginPath();

  ctx.moveTo(
    fx-34*s,
    top
  );

  ctx.lineTo(
    fx-34*s,
    bottom+20*s
  );

  ctx.moveTo(
    fx+30*s,
    top
  );

  ctx.lineTo(
    fx+30*s,
    bottom+20*s
  );

  ctx.stroke();
}


/* ==========================================================
   GROUND FLOOR
========================================================== */

function drawGroundFloor(
  b,
  style,
  x,
  y,
  width,
  s
){

  const floorH =
    118*s;


  ctx.fillStyle =
    "#061014";


  ctx.fillRect(
    x,
    y-floorH,
    width,
    floorH
  );


  const bays =
    clamp(
      Math.floor(
        width/
        (125*s)
      ),
      3,
      9
    );


  const bayW =
    width/bays;


  for(
    let i=0;
    i<bays;
    i++
  ){

    const bx =
      x+
      i*bayW+
      7*s;


    const bw =
      bayW-
      14*s;


    const seed =
      b.x+
      b.y+
      i*811;


    const warm =
      noise(seed)>.52;


    /* shop interior */

    ctx.fillStyle =
      warm
      ? "rgba(192,116,60,.20)"
      : "rgba(48,166,190,.18)";


    ctx.fillRect(
      bx,
      y-86*s,
      bw,
      64*s
    );


    /* back wall */

    ctx.fillStyle =
      warm
      ? "rgba(92,55,38,.24)"
      : "rgba(23,65,75,.24)";


    ctx.fillRect(
      bx+bw*.07,
      y-80*s,
      bw*.86,
      52*s
    );


    /* shelves */

    if(
      noise(seed+9)>.45
    ){

      ctx.fillStyle =
        "rgba(18,22,23,.78)";


      ctx.fillRect(
        bx+bw*.13,
        y-46*s,
        bw*.67,
        6*s
      );


      for(
        let j=0;
        j<5;
        j++
      ){

        ctx.fillStyle =
          [
            "#ba8053",
            "#528c9a",
            "#a05265",
            "#708c55"
          ][j%4];


        ctx.fillRect(
          bx+
          bw*.17+
          j*bw*.11,

          y-57*s,

          4*s,
          10*s
        );
      }
    }


    /* people */

    if(
      noise(seed+29)>.68
    ){

      const px =
        bx+bw*.55;


      ctx.fillStyle =
        "rgba(3,7,8,.80)";


      ctx.beginPath();

      ctx.arc(
        px,
        y-58*s,
        5*s,
        0,
        Math.PI*2
      );

      ctx.fill();


      ctx.fillRect(
        px-4*s,
        y-53*s,
        8*s,
        20*s
      );
    }


    /* reflection */

    ctx.fillStyle =
      "rgba(142,230,250,.06)";


    ctx.beginPath();

    ctx.moveTo(
      bx,
      y-86*s
    );

    ctx.lineTo(
      bx+bw*.25,
      y-86*s
    );

    ctx.lineTo(
      bx+bw*.72,
      y-22*s
    );

    ctx.lineTo(
      bx+bw*.48,
      y-22*s
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
      "rgba(83,130,140,.40)";


    ctx.strokeRect(
      bx,
      y-86*s,
      bw,
      64*s
    );
  }


  /* ======================================================
     ENTRANCE
  ====================================================== */

  const doorX =
    x+
    width*.5;


  ctx.fillStyle =
    "#0d2229";


  ctx.fillRect(
    doorX-33*s,
    y-88*s,
    66*s,
    88*s
  );


  ctx.fillStyle =
    "rgba(77,182,202,.17)";


  ctx.fillRect(
    doorX-27*s,
    y-81*s,
    25*s,
    73*s
  );


  ctx.fillRect(
    doorX+2*s,
    y-81*s,
    25*s,
    73*s
  );


  ctx.strokeStyle =
    b.enter
    ? style.neon
    : "#46646c";


  ctx.lineWidth =
    Math.max(
      1,
      2*s
    );


  ctx.strokeRect(
    doorX-33*s,
    y-88*s,
    66*s,
    88*s
  );


  if(b.enter){

    glow(
      style.neon,
      18*s
    );


    ctx.strokeStyle =
      style.neon;


    ctx.strokeRect(
      doorX-37*s,
      y-92*s,
      74*s,
      92*s
    );


    noGlow();
  }


  /* ======================================================
     AWNING
  ====================================================== */

  if(style.old){

    ctx.fillStyle =
      b.visualType===
      "dinerBuilding"
      ? "#7b342b"
      : "#243f42";


    ctx.fillRect(
      x+15*s,
      y-119*s,
      width-30*s,
      18*s
    );


    ctx.fillStyle =
      style.neon;


    ctx.fillRect(
      x+15*s,
      y-102*s,
      width-30*s,
      3*s
    );
  }


  /* ======================================================
     VENDING MACHINE
  ====================================================== */

  if(
    noise(
      b.x+
      b.y+
      999
    )>.35
  ){

    const vx =
      x+
      width*.08;


    ctx.fillStyle =
      "#b4c0c2";


    ctx.fillRect(
      vx,
      y-70*s,
      31*s,
      70*s
    );


    glow(
      "#68e7ff",
      8*s
    );


    ctx.fillStyle =
      "#8cefff";


    ctx.fillRect(
      vx+4*s,
      y-63*s,
      23*s,
      27*s
    );


    noGlow();


    for(
      let row=0;
      row<3;
      row++
    ){

      for(
        let col=0;
        col<3;
        col++
      ){

        ctx.fillStyle =
          [
            "#da7659",
            "#5e9db1",
            "#d5b058"
          ][
            (
              row+
              col
            )%3
          ];


        ctx.fillRect(
          vx+
          6*s+
          col*7*s,

          y-
          59*s+
          row*8*s,

          4*s,
          5*s
        );
      }
    }
  }


  /* bins */

  ctx.fillStyle =
    "#263438";


  ctx.fillRect(
    x+
    width*.90,
    y-30*s,
    20*s,
    30*s
  );


  ctx.fillStyle =
    "#415055";


  ctx.fillRect(
    x+
    width*.90-
    2*s,
    y-32*s,
    24*s,
    5*s
  );


  /* cardboard */

  if(
    noise(
      b.x+711
    )>.50
  ){

    ctx.fillStyle =
      "#74563a";


    ctx.fillRect(
      x+
      width*.80,
      y-20*s,
      28*s,
      20*s
    );


    ctx.fillStyle =
      "#896647";


    ctx.fillRect(
      x+
      width*.83,
      y-34*s,
      22*s,
      14*s
    );
  }
}


/* ==========================================================
   SIGNAGE
========================================================== */

function drawBuildingSigns(
  b,
  style,
  x,
  y,
  width,
  height,
  s
){

  const signW =
    Math.min(
      width*.52,
      320*s
    );


  const sx =
    x+25*s;


  const sy =
    y-149*s;


  glow(
    style.neon,
    14*s
  );


  ctx.strokeStyle =
    style.neon;


  ctx.lineWidth =
    Math.max(
      1,
      2*s
    );


  ctx.strokeRect(
    sx,
    sy,
    signW,
    39*s
  );


  noGlow();


  ctx.fillStyle =
    "#edffff";


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
    sx+10*s,
    sy+25*s
  );


  /* vertical sign for old districts */

  if(style.old){

    const vx =
      x+
      width-
      48*s;


    const vh =
      Math.min(
        height*.31,
        250*s
      );


    const vy =
      y-
      height*.52;


    glow(
      style.neon,
      15*s
    );


    ctx.fillStyle =
      "rgba(5,9,11,.91)";


    ctx.fillRect(
      vx,
      vy,
      35*s,
      vh
    );


    ctx.strokeStyle =
      style.neon;


    ctx.strokeRect(
      vx,
      vy,
      35*s,
      vh
    );


    noGlow();


    const chars =
      b.sign
      .replace(
        /\s/g,
        ""
      )
      .slice(
        0,
        6
      )
      .split("");


    ctx.fillStyle =
      style.neon;


    ctx.font =
      `bold ${12*s}px sans-serif`;


    ctx.textAlign =
      "center";


    chars.forEach(
      (
        char,
        index
      )=>{

        ctx.fillText(
          char,
          vx+17.5*s,
          vy+
          25*s+
          index*
          24*s
        );
      }
    );
  }


  /* MEGA LED */

  if(style.megaScreen){

    const mw =
      Math.min(
        width*.42,
        290*s
      );


    const mh =
      125*s;


    const mx =
      x+
      width-
      mw-
      28*s;


    const my =
      y-
      height*.58;


    const g =
      ctx.createLinearGradient(
        mx,my,
        mx+mw,
        my+mh
      );


    g.addColorStop(
      0,
      "rgba(38,217,255,.72)"
    );


    g.addColorStop(
      .48,
      "rgba(115,70,255,.56)"
    );


    g.addColorStop(
      1,
      "rgba(237,62,183,.65)"
    );


    glow(
      style.neon,
      22*s
    );


    ctx.fillStyle=g;


    ctx.fillRect(
      mx,my,mw,mh
    );


    noGlow();


    ctx.fillStyle =
      "rgba(240,255,255,.94)";


    ctx.textAlign =
      "center";


    ctx.font =
      `bold ${17*s}px sans-serif`;


    ctx.fillText(
      "HANGZHOU",
      mx+mw/2,
      my+45*s
    );


    ctx.font =
      `${9*s}px monospace`;


    ctx.fillText(
      "CITY // 2049",
      mx+mw/2,
      my+69*s
    );


    ctx.fillStyle =
      "rgba(0,0,0,.12)";


    for(
      let yy=my;
      yy<my+mh;
      yy+=5*s
    ){

      ctx.fillRect(
        mx,
        yy,
        mw,
        1*s
      );
    }
  }
}


/* ==========================================================
   ROOFTOP
========================================================== */

function drawRoofDetails(
  b,
  x,
  roofY,
  width,
  s,
  time
){

  /* machine room */

  ctx.fillStyle =
    "#1c3037";


  ctx.fillRect(
    x+
    width*.13,
    roofY-
    44*s,
    width*.19,
    44*s
  );


  ctx.fillStyle =
    "#30474d";


  ctx.fillRect(
    x+
    width*.13,
    roofY-
    48*s,
    width*.19,
    5*s
  );


  /* rooftop HVAC */

  for(
    let i=0;
    i<3;
    i++
  ){

    const ax =
      x+
      width*
      (
        .43+
        i*.12
      );


    ctx.fillStyle =
      "#47565b";


    ctx.fillRect(
      ax,
      roofY-
      23*s,
      34*s,
      23*s
    );


    ctx.strokeStyle =
      "#1b282c";


    ctx.beginPath();

    ctx.arc(
      ax+17*s,
      roofY-11*s,
      7*s,
      0,
      Math.PI*2
    );

    ctx.stroke();
  }


  /* tank */

  if(
    noise(
      b.x+
      b.y+
      500
    )>.43
  ){

    const tx =
      x+
      width*.72;


    ctx.fillStyle =
      "#263d42";


    ctx.fillRect(
      tx,
      roofY-
      54*s,
      49*s,
      54*s
    );


    ctx.strokeStyle =
      "#526a6f";


    for(
      let i=0;
      i<4;
      i++
    ){

      ctx.beginPath();

      ctx.moveTo(
        tx,
        roofY-
        (
          11+
          i*11
        )*s
      );

      ctx.lineTo(
        tx+49*s,
        roofY-
        (
          11+
          i*11
        )*s
      );

      ctx.stroke();
    }
  }


  /* antenna */

  const antennaX =
    x+
    width*.86;


  ctx.strokeStyle =
    "#53676d";


  ctx.lineWidth =
    Math.max(
      1,
      2*s
    );


  ctx.beginPath();

  ctx.moveTo(
    antennaX,
    roofY
  );

  ctx.lineTo(
    antennaX,
    roofY-
    118*s
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    antennaX-
    25*s,
    roofY-
    67*s
  );

  ctx.lineTo(
    antennaX+
    25*s,
    roofY-
    67*s
  );

  ctx.stroke();


  if(
    Math.floor(
      time/700
    )%2===0
  ){

    glow(
      "#ff3b51",
      13*s
    );


    ctx.fillStyle =
      "#ff4056";


    ctx.beginPath();

    ctx.arc(
      antennaX,
      roofY-
      120*s,
      4*s,
      0,
      Math.PI*2
    );

    ctx.fill();


    noGlow();
  }
}


/* ==========================================================
   BUILDING
========================================================== */

function drawBuilding(
  b,
  time
){

  const style =
    getBuildingStyle(b);


  const p =
    project(
      b.x+
      b.w/2,

      b.y+
      b.h
    );


  if(
    p.y<-1200 ||
    p.y>H+1000
  ){

    return;
  }


  const s =
    p.scale;


  const width =
    b.w*s;


  const height =
    (
      195+
      b.floors*30
    )*s;


  const x =
    p.x-
    width/2;


  const y =
    p.y;


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.56)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+
    38*s,
    y+
    14*s,

    width*.51,
    33*s,

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
    style.wall
  );


  facade.addColorStop(
    .52,
    style.wall2
  );


  facade.addColorStop(
    1,
    "#071014"
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

  const depthX =
    74*s;


  const depthY =
    39*s;


  ctx.fillStyle =
    "#061015";


  ctx.beginPath();

  ctx.moveTo(
    x+width,
    y-height
  );

  ctx.lineTo(
    x+width+
    depthX,

    y-height-
    depthY
  );

  ctx.lineTo(
    x+width+
    depthX,

    y-
    depthY
  );

  ctx.lineTo(
    x+width,
    y
  );

  ctx.closePath();

  ctx.fill();


  /* ======================================================
     WINDOWS
  ====================================================== */

  const upperTop =
    y-
    height+
    55*s;


  const upperBottom =
    y-
    166*s;


  const availableH =
    upperBottom-
    upperTop;


  const cols =
    clamp(
      Math.floor(
        b.w/150
      ),
      4,
      9
    );


  const rows =
    clamp(
      Math.floor(
        b.floors*.52
      ),
      3,
      11
    );


  const marginX =
    27*s;


  const gapX =
    11*s;


  const gapY =
    11*s;


  const cellW =
    (
      width-
      marginX*2-
      gapX*
      (
        cols-1
      )
    )/
    cols;


  const cellH =
    (
      availableH-
      gapY*
      (
        rows-1
      )
    )/
    rows;


  for(
    let row=0;
    row<rows;
    row++
  ){

    for(
      let col=0;
      col<cols;
      col++
    ){

      const wx =
        x+
        marginX+
        col*
        (
          cellW+
          gapX
        );


      const wy =
        upperTop+
        row*
        (
          cellH+
          gapY
        );


      const seed =
        b.x*1.31+
        b.y*.77+
        row*137+
        col*67;


      drawWindowRoom(
        wx,
        wy,
        cellW,
        cellH,
        seed,
        style,
        s
      );


      /* AC */

      if(
        noise(
          seed+200
        )<
        style.acChance
      ){

        drawAC(
          wx+
          cellW-
          30*s,

          wy+
          cellH-
          2*s,

          s*.68,

          seed
        );
      }
    }
  }


  /* structural bands */

  ctx.strokeStyle =
    style.frame;


  ctx.lineWidth =
    Math.max(
      1,
      2*s
    );


  for(
    let row=1;
    row<rows;
    row++
  ){

    const yy =
      upperTop+
      row*
      (
        cellH+
        gapY
      )-
      gapY*.5;


    ctx.beginPath();

    ctx.moveTo(
      x+
      12*s,
      yy
    );

    ctx.lineTo(
      x+
      width-
      12*s,
      yy
    );

    ctx.stroke();
  }


  /* pipes */

  if(style.pipes){

    drawPipes(
      x,
      y,
      width,
      height,
      s,
      b.x+b.y
    );
  }


  /* fire escape */

  if(style.fireEscape){

    drawFireEscape(
      x,
      y,
      width,
      height,
      s
    );
  }


  /* ground */

  drawGroundFloor(
    b,
    style,
    x,
    y,
    width,
    s
  );


  /* signs */

  drawBuildingSigns(
    b,
    style,
    x,
    y,
    width,
    height,
    s
  );


  /* ======================================================
     ROOF
  ====================================================== */

  ctx.fillStyle =
    "#1a2c32";


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
    x+width+
    depthX,

    y-height-
    depthY
  );

  ctx.lineTo(
    x+
    depthX,

    y-height-
    depthY
  );

  ctx.closePath();

  ctx.fill();


  ctx.strokeStyle =
    "rgba(88,130,140,.38)";


  ctx.stroke();


  ctx.fillStyle =
    "#31474e";


  ctx.fillRect(
    x,
    y-height-
    5*s,
    width,
    7*s
  );


  drawRoofDetails(
    b,
    x,
    y-height,
    width,
    s,
    time
  );


  /* ======================================================
     WALL VENTS / BOXES
  ====================================================== */

  if(style.old){

    ctx.fillStyle =
      "#596467";


    ctx.fillRect(
      x+18*s,
      y-82*s,
      27*s,
      34*s
    );


    ctx.strokeStyle =
      "#273235";


    ctx.strokeRect(
      x+18*s,
      y-82*s,
      27*s,
      34*s
    );


    /* warning sticker */

    ctx.fillStyle =
      "#d5b04e";


    ctx.fillRect(
      x+29*s,
      y-67*s,
      5*s,
      5*s
    );
  }
}


/* ==========================================================
   TREE
========================================================== */

function drawTree(
  tree,
  time
){

  const p =
    project(
      tree.x,
      tree.y
    );


  const s =
    p.scale;


  const sway =
    Math.sin(
      time*.001+
      tree.y*.01
    )*
    3*s;


  ctx.fillStyle =
    "rgba(0,0,0,.34)";


  ctx.beginPath();

  ctx.ellipse(
    p.x+
    18*s,
    p.y+
    4*s,

    49*s,
    14*s,

    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.strokeStyle =
    "#263a30";


  ctx.lineWidth =
    9*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x+sway,
    p.y-
    78*s
  );

  ctx.stroke();


  const leaves=[

    [-28,-91,29],
    [7,-108,36],
    [38,-90,27],
    [-8,-71,32],
    [26,-122,24],
    [-35,-115,20]
  ];


  leaves.forEach(
    (
      leaf,
      i
    )=>{

      ctx.fillStyle =
        i%2
        ? "#153a32"
        : "#21483d";


      ctx.beginPath();

      ctx.arc(
        p.x+
        leaf[0]*s+
        sway,

        p.y+
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
   STREET LIGHT
========================================================== */

function drawStreetLight(
  light
){

  const p =
    project(
      light.x,
      light.y
    );


  const s =
    p.scale;


  ctx.strokeStyle =
    "#384a50";


  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,p.y
  );

  ctx.lineTo(
    p.x,
    p.y-
    118*s
  );

  ctx.lineTo(
    p.x+
    31*s,
    p.y-
    118*s
  );

  ctx.stroke();


  /* light cone */

  const cone =
    ctx.createLinearGradient(
      p.x,
      p.y-
      112*s,

      p.x,
      p.y+
      10*s
    );


  cone.addColorStop(
    0,
    "rgba(193,243,255,.10)"
  );


  cone.addColorStop(
    1,
    "rgba(193,243,255,0)"
  );


  ctx.fillStyle =
    cone;


  ctx.beginPath();

  ctx.moveTo(
    p.x+
    31*s,
    p.y-
    112*s
  );

  ctx.lineTo(
    p.x+
    72*s,
    p.y+
    5*s
  );

  ctx.lineTo(
    p.x-
    20*s,
    p.y+
    5*s
  );

  ctx.closePath();

  ctx.fill();


  glow(
    "#dff9ff",
    17*s
  );


  ctx.fillStyle =
    "#effdff";


  ctx.beginPath();

  ctx.ellipse(
    p.x+
    34*s,

    p.y-
    118*s,

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

function drawStreetSign(
  sign
){

  const p =
    project(
      sign.x,
      sign.y
    );


  const s =
    p.scale;


  ctx.strokeStyle =
    "#354950";


  ctx.lineWidth =
    5*s;


  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x,
    p.y-
    98*s
  );

  ctx.stroke();


  glow(
    sign.color,
    11*s
  );


  ctx.fillStyle =
    "#071419";


  ctx.fillRect(
    p.x-
    88*s,
    p.y-
    125*s,

    176*s,
    34*s
  );


  ctx.strokeStyle =
    sign.color;


  ctx.lineWidth =
    2*s;


  ctx.strokeRect(
    p.x-
    88*s,
    p.y-
    125*s,

    176*s,
    34*s
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
    p.y-
    103*s
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
){

  const p =
    project(x,y);


  const s =
    p.scale;


  let bob=0;


  if(
    isPlayer &&
    player.moving
  ){

    bob =
      Math.sin(
        player.step
      )*
      2.2*s;
  }


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.43)";


  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+
    4*s,

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
    p.x-
    7*s,
    p.y-
    18*s+
    bob,

    5*s,
    20*s
  );


  ctx.fillRect(
    p.x+
    2*s,
    p.y-
    18*s+
    bob,

    5*s,
    20*s
  );


  /* coat */

  ctx.fillStyle =
    color;


  roundRectPath(
    p.x-
    12*s,

    p.y-
    49*s+
    bob,

    24*s,
    33*s,

    5*s
  );

  ctx.fill();


  /* face */

  ctx.fillStyle =
    "#c99778";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-
    60*s+
    bob,

    10*s,

    0,
    Math.PI*2
  );

  ctx.fill();


  /* hair */

  ctx.fillStyle =
    "#131619";


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-
    64*s+
    bob,

    10*s,

    Math.PI,
    Math.PI*2
  );

  ctx.fill();


  if(isPlayer){

    glow(
      "#55eaff",
      8*s
    );


    ctx.fillStyle =
      "#55eaff";


    ctx.fillRect(
      p.x-
      12*s,

      p.y-
      47*s+
      bob,

      24*s,
      3*s
    );


    noGlow();
  }
}


/* ==========================================================
   STREET PROPS
========================================================== */

function drawStreetProps(){

  /* bikes */

  const bikes=[

    [1320,2350],
    [1320,2390],
    [1320,2430],

    [2290,2740],
    [2290,2780],

    [3050,2130]
  ];


  bikes.forEach(
    (
      bike,
      index
    )=>{

      const p =
        project(
          bike[0],
          bike[1]
        );


      const s =
        p.scale;


      ctx.strokeStyle =
        index%2
        ? "#55c7c9"
        : "#d7b74f";


      ctx.lineWidth =
        2*s;


      ctx.beginPath();

      ctx.arc(
        p.x-
        10*s,
        p.y,
        8*s,
        0,
        Math.PI*2
      );


      ctx.arc(
        p.x+
        10*s,
        p.y,
        8*s,
        0,
        Math.PI*2
      );


      ctx.moveTo(
        p.x-
        10*s,
        p.y
      );


      ctx.lineTo(
        p.x,
        p.y-
        13*s
      );


      ctx.lineTo(
        p.x+
        10*s,
        p.y
      );


      ctx.lineTo(
        p.x-
        2*s,
        p.y
      );


      ctx.closePath();

      ctx.stroke();
    }
  );


  /* bollards */

  const bollards=[

    [1390,1900],
    [1390,1950],
    [1390,2000],

    [2230,1900],
    [2230,1950],
    [2230,2000]
  ];


  bollards.forEach(
    item=>{

      const p =
        project(
          item[0],
          item[1]
        );


      const s =
        p.scale;


      ctx.fillStyle =
        "#343f43";


      ctx.fillRect(
        p.x-
        4*s,
        p.y-
        24*s,

        8*s,
        24*s
      );


      ctx.fillStyle =
        "#7c969d";


      ctx.fillRect(
        p.x-
        4*s,
        p.y-
        20*s,

        8*s,
        4*s
      );
    }
  );
}


/* ==========================================================
   CITY OBJECT SORT
========================================================== */

function drawCityObjects(
  time
){

  const objects=[];


  BUILDINGS.forEach(
    b=>{

      objects.push({

        y:
          b.y+
          b.h,

        draw:
          ()=>drawBuilding(
            b,time
          )
      });
    }
  );


  TREES.forEach(
    tree=>{

      objects.push({

        y:tree.y,

        draw:
          ()=>drawTree(
            tree,
            time
          )
      });
    }
  );


  STREET_LIGHTS.forEach(
    light=>{

      objects.push({

        y:light.y,

        draw:
          ()=>drawStreetLight(
            light
          )
      });
    }
  );


  STREET_SIGNS.forEach(
    sign=>{

      objects.push({

        y:sign.y,

        draw:
          ()=>drawStreetSign(
            sign
          )
      });
    }
  );


  NPCS.forEach(
    npc=>{

      objects.push({

        y:npc.y,

        draw:
          ()=>drawCharacter(
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
      ()=>drawCharacter(
        player.x,
        player.y,
        "#27535a",
        true
      )
  });


  objects.sort(
    (
      a,b
    )=>
      a.y-b.y
  );


  objects.forEach(
    object=>
      object.draw()
  );


  drawStreetProps();
}


/* ==========================================================
   INTERIOR FLOOR
========================================================== */

function drawInteriorFloor(
  interior,
  theme
){

  ctx.fillStyle =
    theme.floor;


  ctx.fillRect(
    0,0,W,H
  );


  const tile=80;


  for(
    let x=0;
    x<interior.width;
    x+=tile
  ){

    for(
      let y=0;
      y<interior.height;
      y+=tile
    ){

      const a =
        project(x,y);


      const b =
        project(
          x+tile,
          y
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

      ctx.moveTo(
        a.x,a.y
      );

      ctx.lineTo(
        b.x,b.y
      );

      ctx.lineTo(
        c.x,c.y
      );

      ctx.lineTo(
        d.x,d.y
      );

      ctx.closePath();

      ctx.fill();


      ctx.strokeStyle =
        "rgba(255,255,255,.035)";


      ctx.stroke();
    }
  }
}


/* ==========================================================
   FURNITURE
========================================================== */

function drawFurniture(
  rect,
  options={}
){

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


  const s =
    p.scale;


  const w =
    rect.w*s;


  const visualH =
    (
      options.height ||
      80
    )*s;


  const x =
    p.x-
    w/2;


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
    x+25*s+w,
    y-visualH-
    14*s
  );

  ctx.lineTo(
    x+25*s,
    y-visualH-
    14*s
  );

  ctx.closePath();

  ctx.fill();


  if(options.glow){

    glow(
      options.glow,
      10*s
    );


    ctx.strokeStyle =
      options.glow;


    ctx.strokeRect(
      x+6*s,
      y-visualH+
      8*s,

      w-12*s,
      15*s
    );


    noGlow();
  }
}


/* ==========================================================
   EXIT MARKER
========================================================== */

function drawExitMarker(
  x,
  y
){

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
   CONVENIENCE STORE
========================================================== */

function drawConvenience(){

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


  const shelves=[

    {x:130,y:190,w:150,h:390},

    {x:355,y:190,w:120,h:390},

    {x:575,y:190,w:120,h:390},

    {x:790,y:190,w:130,h:390}
  ];


  shelves.forEach(
    (
      shelf,
      index
    )=>{

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
        }
      });
    }
  );


  objects.push({

    y:160,

    draw:()=>{

      drawFurniture(
        {
          x:120,
          y:70,
          w:800,
          h:90
        },
        {
          height:135,
          side:"#162a30",
          top:"#334c52",
          glow:"#45e7ff"
        }
      );
    }
  });


  objects.push({

    y:680,

    draw:()=>{

      drawFurniture(
        {
          x:630,
          y:610,
          w:300,
          h:70
        },
        {
          height:90,
          side:"#26353a",
          top:"#56676c",
          glow:"#ff536c"
        }
      );
    }
  });


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
    (
      a,b
    )=>
      a.y-b.y
  );


  objects.forEach(
    object=>
      object.draw()
  );


  drawExitMarker(
    interior.exit.x,
    interior.exit.y
  );
}


/* ==========================================================
   RESTAURANT
========================================================== */

function drawRestaurant(
  time
){

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


      ctx.fillStyle =
        "#e5c69c";


      ctx.font =
        `bold ${
          14*p.scale
        }px sans-serif`;


      ctx.textAlign =
        "center";


      ctx.fillText(
        "杭帮菜 · 面 · 夜宵 · 小笼",
        p.x,
        p.y-
        95*p.scale
      );
    }
  });


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


  const tables=[

    {x:130,y:470,w:140,h:100},

    {x:340,y:470,w:140,h:100},

    {x:550,y:470,w:140,h:100}
  ];


  tables.forEach(
    table=>{

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
    (
      a,b
    )=>
      a.y-b.y
  );


  objects.forEach(
    object=>
      object.draw()
  );


  /* lanterns */

  for(
    let i=0;
    i<6;
    i++
  ){

    const p =
      project(
        180+
        i*130,
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

  for(
    let i=0;
    i<5;
    i++
  ){

    const p =
      project(
        410+
        i*28,
        245,
        50
      );


    const life =
      (
        time*.0002+
        i*.19
      )%1;


    ctx.fillStyle =
      `rgba(
        230,
        225,
        215,
        ${.13*(1-life)}
      )`;


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

function drawOffice(){

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


      glow(
        "#d55cff",
        15*p.scale
      );


      ctx.fillStyle =
        "#d55cff";


      ctx.font =
        `bold ${
          22*p.scale
        }px sans-serif`;


      ctx.textAlign =
        "center";


      ctx.fillText(
        "未来都市研究所",
        p.x,
        p.y-
        105*p.scale
      );


      noGlow();
    }
  });


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


  objects.push({

    y:420,

    draw:()=>{

      const p =
        project(
          825,
          420
        );


      const s =
        p.scale;


      ctx.fillStyle =
        "#17242a";


      ctx.fillRect(
        p.x-
        100*s,

        p.y-
        70*s,

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
        p.x-
        80*s,

        p.y-
        145*s,

        160*s,
        70*s
      );


      ctx.fillStyle =
        "rgba(72,230,255,.08)";


      ctx.fillRect(
        p.x-
        80*s,

        p.y-
        145*s,

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
        p.y-
        113*s
      );
    }
  });


  [
    {x:170,y:520,w:220,h:90},
    {x:710,y:520,w:220,h:90}
  ]
  .forEach(
    sofa=>{

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
    (
      a,b
    )=>
      a.y-b.y
  );


  objects.forEach(
    object=>
      object.draw()
  );


  drawExitMarker(
    interior.exit.x,
    interior.exit.y
  );
}


/* ==========================================================
   RAIN
========================================================== */

function drawRain(
  time
){

  ctx.save();


  ctx.strokeStyle =
    "rgba(165,215,225,.14)";


  ctx.lineWidth=1;


  for(
    let i=0;
    i<80;
    i++
  ){

    const x =
      (
        noise(
          i*91
        )*W+
        time*.05
      )%W;


    const y =
      (
        noise(
          i*37
        )*H+
        time*.13
      )%H;


    const len =
      8+
      noise(i)*12;


    ctx.beginPath();

    ctx.moveTo(
      x,y
    );

    ctx.lineTo(
      x-3,
      y+len
    );

    ctx.stroke();
  }


  ctx.restore();
}


/* ==========================================================
   ATMOSPHERE
========================================================== */

function drawAtmosphere(){

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
    "rgba(33,180,220,.075)"
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
    "rgba(205,48,180,.065)"
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
   CITY
========================================================== */

function drawCity(
  time
){

  drawNightBackground();

  drawCityFloor();

  drawCityObjects(
    time
  );

  drawRain(
    time
  );

  drawAtmosphere();
}


/* ==========================================================
   INTERIOR
========================================================== */

function drawInterior(
  time
){

  drawNightBackground();


  if(
    currentInterior===
    "convenience"
  ){

    drawConvenience(
      time
    );
  }


  else if(
    currentInterior===
    "restaurant"
  ){

    drawRestaurant(
      time
    );
  }


  else if(
    currentInterior===
    "office"
  ){

    drawOffice(
      time
    );
  }
}


/* ==========================================================
   DRAW
========================================================== */

function draw(
  time
){

  ctx.clearRect(
    0,0,W,H
  );


  if(
    scene==="city"
  ){

    drawCity(
      time
    );
  }

  else{

    drawInterior(
      time
    );
  }
}


/* ==========================================================
   LOOP
========================================================== */

let previous =
  performance.now();


function loop(
  time
){

  const dt =
    Math.min(
      (
        time-
        previous
      )/
      1000,

      .05
    );


  previous =
    time;


  updatePlayer(
    dt
  );


  updateInteraction();


  draw(
    time
  );


  requestAnimationFrame(
    loop
  );
}


requestAnimationFrame(
  loop
);
