/* ==========================================================
   杭州探索録 3
   夜行杭州
   NIGHT CITY PROTOTYPE Ver.0.4

   ・3/4 perspective
   ・wet asphalt
   ・neon reflections
   ・LED billboards
   ・night traffic
   ・headlights / taillights
   ・elevated highway
   ・steam
   ・power cables
   ・dense storefronts
   ・future Hangzhou
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
========================================================== */

const WORLD = {
  width: 2200,
  height: 4600
};

const road = {
  center: 1100,
  halfWidth: 335
};


/* ==========================================================
   PLAYER
========================================================== */

const player = {

  x: 1100,
  y: 3700,

  speed: 270,

  moving: false,

  direction: "up",

  step: 0
};

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

function noise(n) {

  const x =
    Math.sin(
      n * 12.9898
    ) *
    43758.5453;

  return x -
    Math.floor(x);
}

function glow(
  color,
  blur
) {

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    blur;
}

function noGlow() {

  ctx.shadowBlur = 0;

  ctx.shadowColor =
    "transparent";
}


/* ==========================================================
   PERSPECTIVE
========================================================== */

const VIEW = {

  playerScreenY: .72,

  depthScale: .48,

  perspective: .00034
};

function project(
  x,
  y,
  z=0
) {

  const dy =
    y -
    camera.y;

  let scale =
    1 +
    dy *
    VIEW.perspective;

  scale =
    clamp(
      scale,
      .43,
      1.60
    );

  return {

    x:
      W/2 +
      (
        x -
        camera.x
      ) *
      scale,

    y:
      H *
      VIEW.playerScreenY +
      dy *
      VIEW.depthScale -
      z *
      scale,

    scale
  };
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

    player.x +=
      dx *
      player.speed *
      dt;

    player.y +=
      dy *
      player.speed *
      dt;

    player.step +=
      dt*10;
  }

  player.x =
    clamp(
      player.x,
      685,
      1515
    );

  player.y =
    clamp(
      player.y,
      250,
      WORLD.height-100
    );

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
   NIGHT SKY
========================================================== */

function drawSky() {

  const g =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  g.addColorStop(
    0,
    "#02050d"
  );

  g.addColorStop(
    .25,
    "#07101c"
  );

  g.addColorStop(
    .50,
    "#101323"
  );

  g.addColorStop(
    .72,
    "#12101c"
  );

  g.addColorStop(
    1,
    "#08080e"
  );

  ctx.fillStyle = g;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* subtle city glow */

  const glowGradient =
    ctx.createRadialGradient(
      W*.5,
      270,
      20,
      W*.5,
      270,
      W*.55
    );

  glowGradient.addColorStop(
    0,
    "rgba(77,77,145,.15)"
  );

  glowGradient.addColorStop(
    .45,
    "rgba(30,52,89,.07)"
  );

  glowGradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle =
    glowGradient;

  ctx.fillRect(
    0,
    0,
    W,
    H*.7
  );
}


/* ==========================================================
   STARS / AIR PARTICLES
========================================================== */

function drawSkyParticles(time) {

  ctx.save();

  for (
    let i=0;
    i<55;
    i++
  ) {

    const x =
      noise(i*22) *
      W;

    const y =
      noise(i*47) *
      H*.42;

    const flicker =
      .15 +
      (
        Math.sin(
          time*.001 +
          i
        ) + 1
      ) *
      .08;

    ctx.fillStyle =
      `rgba(170,210,230,${flicker})`;

    ctx.fillRect(
      x,
      y,
      1,
      1
    );
  }

  ctx.restore();
}


/* ==========================================================
   DISTANT NIGHT SKYLINE
========================================================== */

function drawSkyline(time) {

  const base = 340;

  const towers = [
    [0,180,70],
    [72,250,76],
    [155,150,65],
    [220,330,90],
    [320,220,72],
    [400,390,100],
    [510,195,70],
    [580,305,88],
    [680,445,110],
    [800,250,75],
    [890,355,96],
    [995,190,65],
    [1065,470,112],
    [1190,285,85],
    [1285,210,70],
    [1360,405,105],
    [1480,240,75],
    [1560,340,95],
    [1670,190,65],
    [1740,295,85]
  ];

  ctx.save();

  ctx.globalAlpha =
    .72;

  towers.forEach(
    (b,i) => {

      const x =
        b[0] /
        1800 *
        (W+170) -
        70;

      const h=b[1];
      const w=b[2];

      ctx.fillStyle =
        i%3===0
        ? "#0c1824"
        : "#101b28";

      ctx.fillRect(
        x,
        base-h,
        w,
        h
      );


      /* windows */

      for (
        let yy =
          base-h+13;
        yy <
          base-12;
        yy+=15
      ) {

        for (
          let xx =
            x+8;
          xx <
            x+w-8;
          xx+=12
        ) {

          const seed =
            i*999 +
            yy*4 +
            xx;

          if (
            noise(seed) >
            .73
          ) {

            const warm =
              noise(seed+3)>.45;

            ctx.fillStyle =
              warm
              ? "rgba(255,197,108,.48)"
              : "rgba(74,204,231,.42)";

            ctx.fillRect(
              xx,
              yy,
              4,
              3
            );
          }
        }
      }


      /* roof light */

      if (
        i%4===0
      ) {

        glow(
          "#f34f77",
          8
        );

        ctx.fillStyle =
          "#f34f77";

        ctx.fillRect(
          x+w*.45,
          base-h-12,
          w*.1,
          12
        );

        noGlow();
      }
    }
  );

  ctx.restore();


  /* city haze */

  const haze =
    ctx.createLinearGradient(
      0,
      120,
      0,
      410
    );

  haze.addColorStop(
    0,
    "rgba(22,39,65,0)"
  );

  haze.addColorStop(
    .65,
    "rgba(35,45,73,.10)"
  );

  haze.addColorStop(
    1,
    "rgba(51,34,70,.25)"
  );

  ctx.fillStyle =
    haze;

  ctx.fillRect(
    0,
    100,
    W,
    330
  );
}


/* ==========================================================
   ROAD
========================================================== */

function drawRoad() {

  const farY =
    camera.y-1800;

  const nearY =
    camera.y+1050;

  const FL =
    project(
      road.center-road.halfWidth,
      farY
    );

  const FR =
    project(
      road.center+road.halfWidth,
      farY
    );

  const NL =
    project(
      road.center-road.halfWidth,
      nearY
    );

  const NR =
    project(
      road.center+road.halfWidth,
      nearY
    );


  /* sidewalk */

  ctx.fillStyle =
    "#151a20";

  ctx.beginPath();

  ctx.moveTo(
    FL.x-260,
    FL.y
  );

  ctx.lineTo(
    FR.x+260,
    FR.y
  );

  ctx.lineTo(
    NR.x+530,
    NR.y
  );

  ctx.lineTo(
    NL.x-530,
    NL.y
  );

  ctx.closePath();

  ctx.fill();


  /* wet asphalt */

  const asphalt =
    ctx.createLinearGradient(
      0,
      FL.y,
      0,
      H
    );

  asphalt.addColorStop(
    0,
    "#10151b"
  );

  asphalt.addColorStop(
    .5,
    "#11161c"
  );

  asphalt.addColorStop(
    1,
    "#080c11"
  );

  ctx.fillStyle =
    asphalt;

  ctx.beginPath();

  ctx.moveTo(
    FL.x,
    FL.y
  );

  ctx.lineTo(
    FR.x,
    FR.y
  );

  ctx.lineTo(
    NR.x,
    NR.y
  );

  ctx.lineTo(
    NL.x,
    NL.y
  );

  ctx.closePath();

  ctx.fill();


  /* wet streaks */

  for (
    let i=0;
    i<250;
    i++
  ) {

    const y =
      camera.y -
      1700 +
      noise(i*31) *
      2600;

    const x =
      road.center -
      road.halfWidth +
      noise(i*71) *
      road.halfWidth*2;

    const p =
      project(x,y);

    if (
      p.y<260 ||
      p.y>H+50
    ) continue;

    ctx.strokeStyle =
      i%3===0
      ? "rgba(105,168,181,.06)"
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
      p.x +
      noise(i)*12*p.scale,
      p.y +
      20*p.scale
    );

    ctx.stroke();
  }
}


/* ==========================================================
   NEON REFLECTIONS ON ROAD
========================================================== */

function drawRoadReflections(time) {

  const reflections = [

    {
      x:850,
      y:3550,
      color:"70,225,255",
      width:50,
      length:300
    },

    {
      x:1390,
      y:3250,
      color:"255,55,184",
      width:65,
      length:360
    },

    {
      x:930,
      y:2750,
      color:"255,70,80",
      width:55,
      length:300
    },

    {
      x:1320,
      y:2350,
      color:"70,215,255",
      width:70,
      length:380
    },

    {
      x:880,
      y:1750,
      color:"177,75,255",
      width:65,
      length:350
    },

    {
      x:1380,
      y:1300,
      color:"255,175,55",
      width:50,
      length:300
    }

  ];

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  reflections.forEach(
    (r,index) => {

      const p =
        project(
          r.x,
          r.y
        );

      if (
        p.y<200 ||
        p.y>H+300
      ) return;

      const flicker =
        .11 +
        Math.sin(
          time*.002 +
          index*2
        ) *
        .025;

      const gradient =
        ctx.createLinearGradient(
          p.x,
          p.y,
          p.x,
          p.y+r.length*p.scale
        );

      gradient.addColorStop(
        0,
        `rgba(${r.color},${flicker+.08})`
      );

      gradient.addColorStop(
        .4,
        `rgba(${r.color},${flicker})`
      );

      gradient.addColorStop(
        1,
        `rgba(${r.color},0)`
      );

      ctx.fillStyle =
        gradient;

      ctx.beginPath();

      ctx.moveTo(
        p.x-r.width*p.scale*.25,
        p.y
      );

      ctx.lineTo(
        p.x+r.width*p.scale*.25,
        p.y
      );

      ctx.lineTo(
        p.x+r.width*p.scale,
        p.y+r.length*p.scale
      );

      ctx.lineTo(
        p.x-r.width*p.scale,
        p.y+r.length*p.scale
      );

      ctx.closePath();

      ctx.fill();
    }
  );

  ctx.restore();
}


/* ==========================================================
   SIDEWALK
========================================================== */

function drawSidewalk() {

  for (
    let y =
      camera.y-1700;
    y <
      camera.y+1000;
    y+=62
  ) {

    const LA =
      project(
        road.center-
        road.halfWidth-250,
        y
      );

    const LB =
      project(
        road.center-
        road.halfWidth,
        y
      );

    const RA =
      project(
        road.center+
        road.halfWidth,
        y
      );

    const RB =
      project(
        road.center+
        road.halfWidth+250,
        y
      );

    ctx.strokeStyle =
      "rgba(111,133,143,.14)";

    ctx.lineWidth =
      Math.max(
        .5,
        LA.scale
      );

    ctx.beginPath();
    ctx.moveTo(LA.x,LA.y);
    ctx.lineTo(LB.x,LB.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(RA.x,RA.y);
    ctx.lineTo(RB.x,RB.y);
    ctx.stroke();
  }


  /* curb highlights */

  for (
    const x of [
      road.center-road.halfWidth,
      road.center+road.halfWidth
    ]
  ) {

    const A =
      project(
        x,
        camera.y-1700
      );

    const B =
      project(
        x,
        camera.y+1000
      );

    ctx.strokeStyle =
      "rgba(117,157,167,.5)";

    ctx.lineWidth=7;

    ctx.beginPath();

    ctx.moveTo(
      A.x,
      A.y
    );

    ctx.lineTo(
      B.x,
      B.y
    );

    ctx.stroke();
  }
}


/* ==========================================================
   TACTILE PAVING
========================================================== */

function drawTactile() {

  for (
    const x of [
      road.center-
      road.halfWidth-75,

      road.center+
      road.halfWidth+75
    ]
  ) {

    for (
      let y =
        camera.y-1700;
      y <
        camera.y+1000;
      y+=25
    ) {

      const A =
        project(x,y);

      const B =
        project(
          x,
          y+28
        );

      ctx.strokeStyle =
        "rgba(208,170,60,.55)";

      ctx.lineWidth =
        Math.max(
          3,
          10*A.scale
        );

      ctx.beginPath();

      ctx.moveTo(
        A.x,
        A.y
      );

      ctx.lineTo(
        B.x,
        B.y
      );

      ctx.stroke();
    }
  }
}


/* ==========================================================
   ROAD LINES
========================================================== */

function drawRoadLines() {

  for (
    const lane of [
      road.center-110,
      road.center+110
    ]
  ) {

    for (
      let y =
        camera.y-1700;
      y <
        camera.y+1000;
      y+=155
    ) {

      const A =
        project(
          lane,
          y
        );

      const B =
        project(
          lane,
          y+70
        );

      ctx.strokeStyle =
        "rgba(210,218,218,.60)";

      ctx.lineWidth =
        Math.max(
          2,
          5*A.scale
        );

      ctx.beginPath();

      ctx.moveTo(
        A.x,
        A.y
      );

      ctx.lineTo(
        B.x,
        B.y
      );

      ctx.stroke();
    }
  }
}


/* ==========================================================
   CROSSWALK
========================================================== */

function drawCrosswalk(y) {

  for (
    let x =
      road.center-
      road.halfWidth+25;

    x <
      road.center+
      road.halfWidth-20;

    x+=55
  ) {

    const A =
      project(x,y);

    const B =
      project(x+34,y);

    const C =
      project(
        x+34,
        y+105
      );

    const D =
      project(
        x,
        y+105
      );

    ctx.fillStyle =
      "rgba(205,215,216,.55)";

    ctx.beginPath();

    ctx.moveTo(A.x,A.y);
    ctx.lineTo(B.x,B.y);
    ctx.lineTo(C.x,C.y);
    ctx.lineTo(D.x,D.y);

    ctx.closePath();

    ctx.fill();
  }
}


/* ==========================================================
   BUILDINGS
========================================================== */

const buildings = [

  {
    side:-1,
    x:560,
    y:4250,
    width:420,
    height:650,
    depth:190,
    type:"dark",
    shops:["24H便利店","深夜食堂","龙井茶"],
    neon:"#41e7ff",
    ad:"杭州夜行"
  },

  {
    side:1,
    x:1640,
    y:4140,
    width:440,
    height:720,
    depth:200,
    type:"glass",
    shops:["咖啡","未来通信","面馆"],
    neon:"#ff48bd",
    ad:"FUTURE"
  },

  {
    side:-1,
    x:525,
    y:3450,
    width:450,
    height:780,
    depth:190,
    type:"glass",
    shops:["无人便利","茶饮","书房"],
    neon:"#ff4f62",
    ad:"钱塘 2049"
  },

  {
    side:1,
    x:1650,
    y:3270,
    width:450,
    height:850,
    depth:205,
    type:"dark",
    shops:["夜宵","数码","咖啡"],
    neon:"#54e6ff",
    ad:"HANGZHOU"
  },

  {
    side:-1,
    x:540,
    y:2600,
    width:435,
    height:850,
    depth:185,
    type:"dark",
    shops:["杭州面馆","药房","便利店"],
    neon:"#c95bff",
    ad:"城市生活"
  },

  {
    side:1,
    x:1650,
    y:2410,
    width:455,
    height:930,
    depth:205,
    type:"glass",
    shops:["茶饮","杭帮菜","银行"],
    neon:"#ffae45",
    ad:"夜·杭州"
  },

  {
    side:-1,
    x:560,
    y:1740,
    width:420,
    height:950,
    depth:180,
    type:"glass",
    shops:["咖啡","未来生活","甜品"],
    neon:"#41e7ff",
    ad:"未来城市"
  },

  {
    side:1,
    x:1625,
    y:1520,
    width:450,
    height:1020,
    depth:195,
    type:"dark",
    shops:["便利店","餐厅","智能生活"],
    neon:"#ff4ba7",
    ad:"CITY 24H"
  },

  {
    side:-1,
    x:585,
    y:850,
    width:395,
    height:1000,
    depth:175,
    type:"dark",
    shops:["龙井茶","面包","夜食"],
    neon:"#ff525e",
    ad:"钱江"
  },

  {
    side:1,
    x:1610,
    y:620,
    width:435,
    height:1060,
    depth:190,
    type:"glass",
    shops:["咖啡","茶饮","餐厅"],
    neon:"#45dfff",
    ad:"NIGHT"
  }
];


/* ==========================================================
   WINDOW
========================================================== */

function drawWindows(
  b,
  x,
  y,
  width,
  height,
  groundH,
  time
) {

  const floors =
    Math.max(
      11,
      Math.floor(
        b.height/47
      )
    );

  const columns =
    Math.max(
      6,
      Math.floor(
        b.width/46
      )
    );

  const upperH =
    height-groundH;

  const cellW =
    width/columns;

  const cellH =
    upperH/floors;


  for (
    let floor=0;
    floor<floors;
    floor++
  ) {

    for (
      let col=0;
      col<columns;
      col++
    ) {

      const seed =
        b.x +
        b.y +
        floor*57 +
        col*91;

      const lit =
        noise(seed)>.61;

      if (
        !lit
      ) {

        ctx.fillStyle =
          "rgba(7,17,24,.58)";
      }

      else {

        const choice =
          noise(seed+77);

        if (
          choice>.7
        ) {

          ctx.fillStyle =
            "rgba(77,205,232,.38)";
        }

        else if (
          choice>.36
        ) {

          ctx.fillStyle =
            "rgba(255,190,99,.40)";
        }

        else {

          ctx.fillStyle =
            "rgba(210,117,220,.26)";
        }
      }

      ctx.fillRect(

        x +
        col*cellW +
        cellW*.16,

        y -
        height +
        floor*cellH +
        cellH*.18,

        cellW*.66,

        cellH*.56
      );
    }
  }
}


/* ==========================================================
   BUILDING
========================================================== */

function drawBuilding(
  b,
  time
) {

  const base =
    project(
      b.x,
      b.y
    );

  if (
    base.y<-1000 ||
    base.y>H+800
  ) return;

  const s =
    base.scale;

  const width =
    b.width*s;

  const height =
    b.height*s;

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
      b.side<0
      ? width
      : 0
    );

  const y =
    base.y;

  const groundH =
    105*s;


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.42)";

  ctx.beginPath();

  ctx.moveTo(x,y);
  ctx.lineTo(x+width,y);
  ctx.lineTo(
    x+width+110*s,
    y+45*s
  );
  ctx.lineTo(
    x+65*s,
    y+48*s
  );

  ctx.closePath();

  ctx.fill();


  /* facade */

  let front =
    "#101b24";

  if (
    b.type==="glass"
  )
    front="#142633";

  ctx.fillStyle =
    front;

  ctx.fillRect(
    x,
    y-height,
    width,
    height
  );


  /* side */

  ctx.fillStyle =
    b.side<0
    ? "#08121a"
    : "#172833";

  ctx.beginPath();

  if (
    b.side<0
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


  /* rooftop */

  ctx.fillStyle =
    "#1b2930";

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


  /* windows */

  drawWindows(
    b,
    x,
    y,
    width,
    height,
    groundH,
    time
  );


  /* facade grid */

  const columns =
    Math.max(
      6,
      Math.floor(
        b.width/46
      )
    );

  for (
    let col=1;
    col<columns;
    col++
  ) {

    const fx =
      x +
      col *
      width/columns;

    ctx.strokeStyle =
      "rgba(67,99,113,.25)";

    ctx.lineWidth =
      Math.max(
        1,
        1.5*s
      );

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


  /* glass reflection */

  if (
    b.type==="glass"
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
      "rgba(60,151,182,.16)"
    );

    reflection.addColorStop(
      .35,
      "rgba(0,0,0,0)"
    );

    reflection.addColorStop(
      .62,
      "rgba(165,50,170,.08)"
    );

    reflection.addColorStop(
      1,
      "rgba(0,0,0,0)"
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
    "#202d33";

  ctx.fillRect(
    x+width*.16,
    y-height-22*s,
    width*.20,
    22*s
  );

  ctx.fillRect(
    x+width*.62,
    y-height-31*s,
    width*.15,
    31*s
  );


  /* antenna */

  ctx.strokeStyle =
    "#4b5c63";

  ctx.lineWidth =
    2*s;

  ctx.beginPath();

  ctx.moveTo(
    x+width*.7,
    y-height-30*s
  );

  ctx.lineTo(
    x+width*.7,
    y-height-90*s
  );

  ctx.stroke();


  /* antenna light */

  const blink =
    Math.floor(
      time/650
    )%2;

  if (
    blink
  ) {

    glow(
      "#ff435b",
      12
    );

    ctx.fillStyle =
      "#ff435b";

    ctx.beginPath();

    ctx.arc(
      x+width*.7,
      y-height-91*s,
      3*s,
      0,
      Math.PI*2
    );

    ctx.fill();

    noGlow();
  }


  /* pipes */

  ctx.strokeStyle =
    "#33464b";

  ctx.lineWidth =
    5*s;

  ctx.beginPath();

  ctx.moveTo(
    x+width*.09,
    y-height*.73
  );

  ctx.lineTo(
    x+width*.09,
    y-groundH
  );

  ctx.lineTo(
    x+width*.14,
    y-groundH
  );

  ctx.stroke();


  /* AC units */

  for (
    let i=0;
    i<4;
    i++
  ) {

    const acX =
      x +
      width*
      (
        .14+i*.21
      );

    const acY =
      y -
      groundH -
      (
        75 +
        noise(
          b.x+i*19
        ) *
        190
      )*s;

    drawACNight(
      acX,
      acY,
      26*s,
      time,
      i+b.y
    );
  }


  /* ground floor */

  ctx.fillStyle =
    "#071014";

  ctx.fillRect(
    x,
    y-groundH,
    width,
    groundH
  );


  const count =
    b.shops.length;

  const shopW =
    width/count;


  b.shops.forEach(
    (shop,i) => {

      const sx =
        x+i*shopW;

      const shopColors = [
        "#ff4f68",
        "#39d7e7",
        "#d95cff",
        "#f1aa45"
      ];

      const c =
        shopColors[
          (
            i+
            Math.floor(b.y/500)
          )%
          shopColors.length
        ];


      /* interior */

      ctx.fillStyle =
        "#101a1c";

      ctx.fillRect(
        sx+5*s,
        y-groundH+29*s,
        shopW-10*s,
        groundH-34*s
      );


      /* interior glow */

      const interior =
        ctx.createLinearGradient(
          sx,
          y-groundH,
          sx,
          y
        );

      interior.addColorStop(
        0,
        "rgba(255,183,93,.18)"
      );

      interior.addColorStop(
        1,
        "rgba(255,139,77,.38)"
      );

      ctx.fillStyle =
        interior;

      ctx.fillRect(
        sx+11*s,
        y-groundH+34*s,
        shopW-22*s,
        groundH-46*s
      );


      /* shelf */

      ctx.fillStyle =
        "rgba(20,20,18,.55)";

      for (
        let shelf=0;
        shelf<2;
        shelf++
      ) {

        ctx.fillRect(
          sx+17*s,
          y-24*s-
          shelf*19*s,
          shopW-34*s,
          3*s
        );
      }


      /* neon shop sign */

      glow(
        c,
        13*s
      );

      ctx.fillStyle = c;

      ctx.fillRect(
        sx+7*s,
        y-groundH+5*s,
        shopW-14*s,
        22*s
      );

      noGlow();


      ctx.fillStyle =
        "#f6fbf8";

      ctx.font =
        `${Math.max(
          7,
          11*s
        )}px sans-serif`;

      ctx.textAlign =
        "center";

      ctx.fillText(
        shop,
        sx+shopW/2,
        y-groundH+21*s
      );
    }
  );


  /* huge vertical neon */

  const signX =
    b.side<0
    ? x+width-36*s
    : x+10*s;

  glow(
    b.neon,
    18*s
  );

  ctx.fillStyle =
    b.neon;

  ctx.fillRect(
    signX,
    y-groundH-175*s,
    32*s,
    140*s
  );

  noGlow();


  ctx.fillStyle =
    "#f8ffff";

  ctx.font =
    `bold ${Math.max(
      8,
      13*s
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  const text =
    "杭州";

  ctx.fillText(
    text[0],
    signX+16*s,
    y-groundH-125*s
  );

  ctx.fillText(
    text[1],
    signX+16*s,
    y-groundH-90*s
  );


  /* giant LED billboard */

  const ledW =
    width*.53;

  const ledH =
    90*s;

  const ledX =
    x+width*.23;

  const ledY =
    y-height*.63;

  ctx.fillStyle =
    "#030609";

  ctx.fillRect(
    ledX,
    ledY,
    ledW,
    ledH
  );


  const pulse =
    .72 +
    Math.sin(
      time*.002+
      b.y
    )*.18;

  glow(
    b.neon,
    25*s
  );

  ctx.strokeStyle =
    b.neon;

  ctx.globalAlpha =
    pulse;

  ctx.lineWidth =
    3*s;

  ctx.strokeRect(
    ledX,
    ledY,
    ledW,
    ledH
  );

  ctx.globalAlpha=1;

  noGlow();


  ctx.fillStyle =
    b.neon;

  ctx.font =
    `bold ${Math.max(
      11,
      20*s
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    b.ad,
    ledX+ledW/2,
    ledY+ledH*.45
  );


  ctx.fillStyle =
    "rgba(235,250,250,.7)";

  ctx.font =
    `${Math.max(
      6,
      9*s
    )}px sans-serif`;

  ctx.fillText(
    "HANGZHOU // NIGHT DISTRICT",
    ledX+ledW/2,
    ledY+ledH*.70
  );
}


/* ==========================================================
   NIGHT AC
========================================================== */

function drawACNight(
  x,y,size,time,seed
) {

  ctx.fillStyle =
    "#46545a";

  ctx.fillRect(
    x,
    y,
    size,
    size*.68
  );

  ctx.strokeStyle =
    "#718087";

  ctx.lineWidth=1;

  ctx.strokeRect(
    x,
    y,
    size,
    size*.68
  );

  ctx.fillStyle =
    "#182429";

  ctx.beginPath();

  ctx.arc(
    x+size*.5,
    y+size*.34,
    size*.20,
    0,
    Math.PI*2
  );

  ctx.fill();

  const angle =
    time*.004+
    seed;

  ctx.strokeStyle =
    "#65777c";

  ctx.beginPath();

  for (
    let i=0;
    i<4;
    i++
  ) {

    const a =
      angle+
      i*Math.PI/2;

    ctx.moveTo(
      x+size*.5,
      y+size*.34
    );

    ctx.lineTo(
      x+size*.5+
      Math.cos(a)*size*.17,

      y+size*.34+
      Math.sin(a)*size*.17
    );
  }

  ctx.stroke();
}


/* ==========================================================
   STREET TREES
========================================================== */

const trees=[];

for (
  let y=450;
  y<WORLD.height;
  y+=245
) {

  trees.push({
    x:
      road.center-
      road.halfWidth-
      145,
    y
  });

  trees.push({
    x:
      road.center+
      road.halfWidth+
      145,
    y:y+110
  });
}

function drawTree(
  x,y,time
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  const sway =
    Math.sin(
      time*.001+
      y*.01
    ) *
    3*s;


  ctx.fillStyle =
    "rgba(0,0,0,.35)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+25*s,
    p.y+5*s,
    58*s,
    15*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.strokeStyle =
    "#28362f";

  ctx.lineWidth =
    10*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    p.y
  );

  ctx.lineTo(
    p.x+sway,
    p.y-80*s
  );

  ctx.stroke();


  const leaves = [
    [-32,-93,32],
    [3,-109,38],
    [39,-89,29],
    [-8,-74,35],
    [24,-125,26],
    [-45,-68,23]
  ];

  leaves.forEach(
    (l,i) => {

      ctx.fillStyle =
        i%2
        ? "#183c35"
        : "#21473d";

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


  /* neon edge light */

  ctx.strokeStyle =
    "rgba(49,214,220,.14)";

  ctx.lineWidth =
    2*s;

  ctx.beginPath();

  ctx.arc(
    p.x+5*s+sway,
    p.y-105*s,
    38*s,
    -2.5,
    .3
  );

  ctx.stroke();
}


/* ==========================================================
   STREET LIGHTS
========================================================== */

const lamps=[];

for (
  let y=500;
  y<WORLD.height;
  y+=390
) {

  lamps.push([
    690,
    y
  ]);

  lamps.push([
    1510,
    y+170
  ]);
}

function drawLamp(
  x,y
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.strokeStyle =
    "#34434a";

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
    p.x+31*s,
    p.y-120*s
  );

  ctx.stroke();


  glow(
    "#cfefff",
    18*s
  );

  ctx.fillStyle =
    "#dff8ff";

  ctx.beginPath();

  ctx.ellipse(
    p.x+35*s,
    p.y-120*s,
    11*s,
    5*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  noGlow();


  /* pool of light */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  const g =
    ctx.createRadialGradient(
      p.x+35*s,
      p.y-15*s,
      0,
      p.x+35*s,
      p.y-15*s,
      75*s
    );

  g.addColorStop(
    0,
    "rgba(155,224,255,.10)"
  );

  g.addColorStop(
    1,
    "rgba(155,224,255,0)"
  );

  ctx.fillStyle=g;

  ctx.beginPath();

  ctx.ellipse(
    p.x+35*s,
    p.y,
    75*s,
    20*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.restore();
}


/* ==========================================================
   METRO
========================================================== */

function drawMetro(
  x,y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  /* glow */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  const light =
    ctx.createRadialGradient(
      p.x,
      p.y,
      0,
      p.x,
      p.y,
      100*s
    );

  light.addColorStop(
    0,
    "rgba(104,226,255,.18)"
  );

  light.addColorStop(
    1,
    "rgba(104,226,255,0)"
  );

  ctx.fillStyle=light;

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    100*s,
    30*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.restore();


  ctx.fillStyle =
    "#09141a";

  ctx.beginPath();

  ctx.moveTo(
    p.x-50*s,
    p.y
  );

  ctx.lineTo(
    p.x+50*s,
    p.y
  );

  ctx.lineTo(
    p.x+33*s,
    p.y+60*s
  );

  ctx.lineTo(
    p.x-33*s,
    p.y+60*s
  );

  ctx.closePath();

  ctx.fill();


  ctx.strokeStyle =
    "#456b76";

  ctx.lineWidth =
    5*s;

  ctx.strokeRect(
    p.x-55*s,
    p.y-70*s,
    110*s,
    70*s
  );


  ctx.fillStyle =
    "rgba(68,179,202,.13)";

  ctx.fillRect(
    p.x-51*s,
    p.y-66*s,
    102*s,
    62*s
  );


  glow(
    "#41e6ff",
    18*s
  );

  ctx.fillStyle =
    "#41e6ff";

  ctx.beginPath();

  ctx.arc(
    p.x-37*s,
    p.y-84*s,
    14*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  noGlow();


  ctx.fillStyle =
    "#041014";

  ctx.font =
    `bold ${Math.max(
      8,
      13*s
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "M",
    p.x-37*s,
    p.y-79*s
  );


  ctx.fillStyle =
    "#9befff";

  ctx.font =
    `${Math.max(
      7,
      10*s
    )}px sans-serif`;

  ctx.fillText(
    "地铁",
    p.x+10*s,
    p.y-82*s
  );
}


/* ==========================================================
   NEON BUS STOP
========================================================== */

function drawBusStop(
  x,y
) {

  const p =
    project(x,y);

  const s =
    p.scale;


  ctx.strokeStyle =
    "#395863";

  ctx.lineWidth =
    5*s;

  ctx.beginPath();

  ctx.moveTo(
    p.x-38*s,
    p.y
  );

  ctx.lineTo(
    p.x-38*s,
    p.y-100*s
  );

  ctx.lineTo(
    p.x+48*s,
    p.y-100*s
  );

  ctx.lineTo(
    p.x+48*s,
    p.y
  );

  ctx.stroke();


  ctx.fillStyle =
    "rgba(53,112,126,.16)";

  ctx.fillRect(
    p.x-34*s,
    p.y-96*s,
    78*s,
    78*s
  );


  glow(
    "#41e6ff",
    13*s
  );

  ctx.fillStyle =
    "#41e6ff";

  ctx.fillRect(
    p.x-31*s,
    p.y-93*s,
    72*s,
    20*s
  );

  noGlow();


  ctx.fillStyle =
    "#061215";

  ctx.font =
    `${Math.max(
      6,
      9*s
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "市民中心站",
    p.x+5*s,
    p.y-79*s
  );


  ctx.fillStyle =
    "#d7e5e5";

  ctx.fillRect(
    p.x-23*s,
    p.y-64*s,
    56*s,
    32*s
  );

  ctx.fillStyle =
    "#213a40";

  ctx.font =
    `${Math.max(
      5,
      7*s
    )}px sans-serif`;

  ctx.fillText(
    "32  71  108",
    p.x+5*s,
    p.y-46*s
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
      2.2*s;
  }


  ctx.fillStyle =
    "rgba(0,0,0,.38)";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y+3*s,
    16*s,
    6*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* legs */

  ctx.fillStyle =
    "#11171c";

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


  /* head */

  ctx.fillStyle =
    "#c99474";

  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y-60*s+bob,
    10*s,
    0,
    Math.PI*2
  );

  ctx.fill();


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
      "#4fe8ff",
      8*s
    );

    ctx.fillStyle =
      "#4fe8ff";

    ctx.fillRect(
      p.x-12*s,
      p.y-48*s+bob,
      24*s,
      3*s
    );

    noGlow();
  }
}


/* ==========================================================
   PEDESTRIANS
========================================================== */

const pedestrians = [

  {
    x:650,
    y:4000,
    dir:-1,
    speed:25,
    color:"#344d62"
  },

  {
    x:1550,
    y:3700,
    dir:1,
    speed:23,
    color:"#623e58"
  },

  {
    x:675,
    y:3150,
    dir:1,
    speed:29,
    color:"#35544b"
  },

  {
    x:1530,
    y:2800,
    dir:-1,
    speed:25,
    color:"#553b64"
  },

  {
    x:650,
    y:2200,
    dir:-1,
    speed:27,
    color:"#5c4638"
  },

  {
    x:1550,
    y:1900,
    dir:1,
    speed:30,
    color:"#314d60"
  },

  {
    x:675,
    y:1250,
    dir:1,
    speed:22,
    color:"#50513a"
  },

  {
    x:1535,
    y:900,
    dir:-1,
    speed:26,
    color:"#573d54"
  }
];

function updatePedestrians(dt) {

  pedestrians.forEach(
    p => {

      p.y +=
        p.dir *
        p.speed *
        dt;

      if (
        p.y<250
      )
        p.y =
          WORLD.height-200;

      if (
        p.y>WORLD.height
      )
        p.y=300;
    }
  );
}


/* ==========================================================
   CAR
========================================================== */

const cars = [

  {
    x:900,
    y:900,
    speed:115,
    dir:1,
    color:"#202b35"
  },

  {
    x:1040,
    y:3100,
    speed:130,
    dir:-1,
    color:"#313a42"
  },

  {
    x:1190,
    y:1800,
    speed:110,
    dir:1,
    color:"#1b2730"
  },

  {
    x:1370,
    y:4100,
    speed:135,
    dir:-1,
    color:"#2b3944"
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
        car.y>
        WORLD.height+300
      )
        car.y=-300;

      if (
        car.y<-300
      )
        car.y=
          WORLD.height+300;
    }
  );
}

function drawCar(car) {

  const p =
    project(
      car.x,
      car.y
    );

  const s =
    p.scale;

  const w =
    49*s;

  const h =
    74*s;


  ctx.fillStyle =
    "rgba(0,0,0,.42)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+8*s,
    p.y+6*s,
    31*s,
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
    "#12232d";

  ctx.beginPath();

  ctx.moveTo(
    p.x-w*.32,
    p.y-h*.74
  );

  ctx.lineTo(
    p.x+w*.32,
    p.y-h*.74
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


  if (
    car.dir>0
  ) {

    /* headlights */

    glow(
      "#dff7ff",
      14*s
    );

    ctx.fillStyle =
      "#e8fbff";

    ctx.fillRect(
      p.x-w*.35,
      p.y-7*s,
      9*s,
      4*s
    );

    ctx.fillRect(
      p.x+w*.16,
      p.y-7*s,
      9*s,
      4*s
    );

    noGlow();


    /* headlight road cone */

    ctx.save();

    ctx.globalCompositeOperation =
      "screen";

    const g =
      ctx.createLinearGradient(
        p.x,
        p.y,
        p.x,
        p.y+100*s
      );

    g.addColorStop(
      0,
      "rgba(200,240,255,.13)"
    );

    g.addColorStop(
      1,
      "rgba(200,240,255,0)"
    );

    ctx.fillStyle=g;

    ctx.beginPath();

    ctx.moveTo(
      p.x-15*s,
      p.y
    );

    ctx.lineTo(
      p.x+15*s,
      p.y
    );

    ctx.lineTo(
      p.x+45*s,
      p.y+100*s
    );

    ctx.lineTo(
      p.x-45*s,
      p.y+100*s
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }

  else {

    glow(
      "#ff354d",
      13*s
    );

    ctx.fillStyle =
      "#ff354d";

    ctx.fillRect(
      p.x-w*.35,
      p.y-h+5*s,
      9*s,
      4*s
    );

    ctx.fillRect(
      p.x+w*.16,
      p.y-h+5*s,
      9*s,
      4*s
    );

    noGlow();
  }
}


/* ==========================================================
   NIGHT BUS
========================================================== */

const bus = {

  x:960,
  y:4300,
  speed:80
};

function updateBus(dt) {

  bus.y -=
    bus.speed*dt;

  if (
    bus.y<-500
  )
    bus.y=
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
    74*s;

  const h =
    155*s;


  ctx.fillStyle =
    "rgba(0,0,0,.42)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+10*s,
    p.y+7*s,
    46*s,
    14*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "#164c4d";

  ctx.beginPath();

  ctx.roundRect(
    p.x-w/2,
    p.y-h,
    w,
    h,
    10*s
  );

  ctx.fill();


  ctx.fillStyle =
    "#102b35";

  ctx.fillRect(
    p.x-w*.39,
    p.y-h+21*s,
    w*.78,
    70*s
  );


  /* lit interior */

  ctx.fillStyle =
    "rgba(108,213,220,.13)";

  ctx.fillRect(
    p.x-w*.36,
    p.y-h+24*s,
    w*.72,
    64*s
  );


  /* route display */

  glow(
    "#ffb83f",
    9*s
  );

  ctx.fillStyle =
    "#18150b";

  ctx.fillRect(
    p.x-w*.35,
    p.y-h+6*s,
    w*.70,
    13*s
  );

  ctx.fillStyle =
    "#ffbd43";

  ctx.font =
    `${Math.max(
      6,
      8*s
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.fillText(
    "市民中心 → 钱江新城",
    p.x,
    p.y-h+15*s
  );

  noGlow();


  /* rear lamps */

  glow(
    "#ff364c",
    11*s
  );

  ctx.fillStyle =
    "#ff364c";

  ctx.fillRect(
    p.x-w*.38,
    p.y-13*s,
    9*s,
    5*s
  );

  ctx.fillRect(
    p.x+w*.25,
    p.y-13*s,
    9*s,
    5*s
  );

  noGlow();
}


/* ==========================================================
   SCOOTERS
========================================================== */

const scooters = [

  {
    x:760,
    y:2800,
    dir:1,
    speed:88
  },

  {
    x:1450,
    y:1300,
    dir:-1,
    speed:92
  }
];

function updateScooters(dt) {

  scooters.forEach(
    scooter => {

      scooter.y +=
        scooter.dir *
        scooter.speed *
        dt;

      if (
        scooter.y<0
      )
        scooter.y=
          WORLD.height;

      if (
        scooter.y>
        WORLD.height
      )
        scooter.y=0;
    }
  );
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
    "#11171b";

  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y,
    20*s,
    6*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle =
    "#242b2d";

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


  ctx.fillStyle =
    "#d4b43d";

  ctx.fillRect(
    p.x-10*s,
    p.y-18*s,
    21*s,
    12*s
  );


  ctx.fillStyle =
    "#b77c62";

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
    "#caa633";

  ctx.fillRect(
    p.x-8*s,
    p.y-36*s,
    16*s,
    21*s
  );


  /* delivery box */

  glow(
    "#ffcf43",
    6*s
  );

  ctx.fillStyle =
    "#e2b83b";

  ctx.fillRect(
    p.x-19*s,
    p.y-35*s,
    12*s,
    17*s
  );

  noGlow();


  /* headlight */

  glow(
    "#e5fbff",
    8*s
  );

  ctx.fillStyle =
    "#e5fbff";

  ctx.beginPath();

  ctx.arc(
    p.x+12*s,
    p.y-13*s,
    3*s,
    0,
    Math.PI*2
  );

  ctx.fill();

  noGlow();
}


/* ==========================================================
   STEAM
========================================================== */

const steamVents = [

  [730,3350],
  [1480,3000],
  [720,2100],
  [1490,1600],
  [720,850]
];

function drawSteam(
  x,y,time,index
) {

  const p =
    project(x,y);

  const s =
    p.scale;

  ctx.save();

  for (
    let i=0;
    i<7;
    i++
  ) {

    const life =
      (
        time*.00018 +
        i*.13 +
        index*.19
      ) % 1;

    const yy =
      p.y -
      life *
      115*s;

    const xx =
      p.x +
      Math.sin(
        time*.0015+
        i*2+
        index
      ) *
      15*s*
      life;

    const radius =
      (
        8+
        life*20
      )*s;

    ctx.fillStyle =
      `rgba(175,195,201,${
        .10*(1-life)
      })`;

    ctx.beginPath();

    ctx.arc(
      xx,
      yy,
      radius,
      0,
      Math.PI*2
    );

    ctx.fill();
  }

  ctx.restore();
}


/* ==========================================================
   ELEVATED HIGHWAY
========================================================== */

function drawElevatedHighway() {

  /*
    Highway appears in this section of the city.
  */

  if (
    camera.y<1850 ||
    camera.y>3200
  ) return;

  const relative =
    (
      camera.y-1850
    ) /
    1350;

  const y =
    300 +
    relative*170;


  /* pillars */

  ctx.fillStyle =
    "#151b20";

  ctx.fillRect(
    W*.17,
    y,
    44,
    H-y
  );

  ctx.fillRect(
    W*.79,
    y,
    44,
    H-y
  );


  /* underside */

  const underside =
    ctx.createLinearGradient(
      0,
      y,
      0,
      y+100
    );

  underside.addColorStop(
    0,
    "#1d242a"
  );

  underside.addColorStop(
    1,
    "#080b0e"
  );

  ctx.fillStyle =
    underside;

  ctx.beginPath();

  ctx.moveTo(
    -80,
    y-65
  );

  ctx.lineTo(
    W+80,
    y-30
  );

  ctx.lineTo(
    W+80,
    y+45
  );

  ctx.lineTo(
    -80,
    y+20
  );

  ctx.closePath();

  ctx.fill();


  /* structural lines */

  ctx.strokeStyle =
    "rgba(86,103,110,.4)";

  ctx.lineWidth=3;

  for (
    let x=-100;
    x<W+100;
    x+=130
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      y-55
    );

    ctx.lineTo(
      x+60,
      y+25
    );

    ctx.stroke();
  }


  /* edge lights */

  glow(
    "#4bdcf2",
    8
  );

  ctx.strokeStyle =
    "rgba(75,220,242,.55)";

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.moveTo(
    -50,
    y+17
  );

  ctx.lineTo(
    W+50,
    y+42
  );

  ctx.stroke();

  noGlow();
}


/* ==========================================================
   OVERHEAD CABLES
========================================================== */

function drawCables(time) {

  ctx.save();

  ctx.strokeStyle =
    "rgba(18,24,30,.72)";

  ctx.lineWidth=3;


  for (
    let i=0;
    i<4;
    i++
  ) {

    const y =
      120+i*52;

    ctx.beginPath();

    ctx.moveTo(
      -50,
      y
    );

    ctx.bezierCurveTo(
      W*.28,
      y+65+
      Math.sin(
        time*.0004+i
      )*4,

      W*.72,
      y+65,

      W+50,
      y+10
    );

    ctx.stroke();
  }


  /* cable lights */

  glow(
    "#ff4eaf",
    6
  );

  for (
    let i=0;
    i<6;
    i++
  ) {

    ctx.fillStyle =
      i%2
      ? "#ff4eaf"
      : "#4fe6ff";

    ctx.beginPath();

    ctx.arc(
      W*.18+i*W*.13,
      185+
      Math.sin(i)*12,
      2,
      0,
      Math.PI*2
    );

    ctx.fill();
  }

  noGlow();

  ctx.restore();
}


/* ==========================================================
   OBJECT DEPTH
========================================================== */

function drawObjects(time) {

  const objects=[];


  buildings.forEach(
    b => {

      objects.push({

        y:b.y,

        draw:
          () =>
            drawBuilding(
              b,
              time
            )
      });
    }
  );


  trees.forEach(
    t => {

      objects.push({

        y:t.y,

        draw:
          () =>
            drawTree(
              t.x,
              t.y,
              time
            )
      });
    }
  );


  lamps.forEach(
    l => {

      objects.push({

        y:l[1],

        draw:
          () =>
            drawLamp(
              l[0],
              l[1]
            )
      });
    }
  );


  pedestrians.forEach(
    p => {

      objects.push({

        y:p.y,

        draw:
          () =>
            drawPerson(
              p.x,
              p.y,
              p.color
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


  scooters.forEach(
    scooter => {

      objects.push({

        y:scooter.y,

        draw:
          () =>
            drawScooter(
              scooter
            )
      });
    }
  );


  objects.push({

    y:bus.y,

    draw:
      () =>
        drawBus()
  });


  /* metros */

  objects.push({

    y:3900,

    draw:
      () =>
        drawMetro(
          640,
          3900
        )
  });

  objects.push({

    y:1900,

    draw:
      () =>
        drawMetro(
          1560,
          1900
        )
  });


  /* bus stops */

  objects.push({

    y:3250,

    draw:
      () =>
        drawBusStop(
          640,
          3250
        )
  });

  objects.push({

    y:1300,

    draw:
      () =>
        drawBusStop(
          1560,
          1300
        )
  });


  /* steam */

  steamVents.forEach(
    (vent,index) => {

      objects.push({

        y:vent[1],

        draw:
          () =>
            drawSteam(
              vent[0],
              vent[1],
              time,
              index
            )
      });
    }
  );


  /* player */

  objects.push({

    y:player.y,

    draw:
      () =>
        drawPerson(
          player.x,
          player.y,
          "#244e54",
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
   FOREGROUND NEON SIGNS
========================================================== */

function drawForegroundSigns(time) {

  /*
    These deliberately cover parts of the screen.
  */

  if (
    player.y>3300
  ) {

    ctx.save();

    ctx.translate(
      W-60,
      H*.33
    );

    ctx.rotate(.025);

    glow(
      "#ff47bd",
      25
    );

    ctx.fillStyle =
      "#ff47bd";

    ctx.fillRect(
      -75,
      -150,
      65,
      210
    );

    noGlow();


    ctx.fillStyle =
      "#fff";

    ctx.font =
      "bold 21px sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "夜",
      -43,
      -105
    );

    ctx.fillText(
      "杭",
      -43,
      -60
    );

    ctx.fillText(
      "州",
      -43,
      -15
    );

    ctx.restore();
  }


  if (
    player.y>1700 &&
    player.y<2700
  ) {

    ctx.save();

    glow(
      "#4de6ff",
      18
    );

    ctx.fillStyle =
      "rgba(10,25,30,.94)";

    ctx.fillRect(
      -25,
      H*.26,
      190,
      52
    );

    ctx.strokeStyle =
      "#4de6ff";

    ctx.lineWidth=2;

    ctx.strokeRect(
      -25,
      H*.26,
      190,
      52
    );

    noGlow();


    ctx.fillStyle =
      "#9af3ff";

    ctx.font =
      "13px sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "钱江新城 →",
      72,
      H*.26+31
    );

    ctx.restore();
  }
}


/* ==========================================================
   FOREGROUND LEAVES
========================================================== */

function drawForegroundLeaves(time) {

  const sway =
    Math.sin(
      time*.0007
    )*8;

  ctx.fillStyle =
    "rgba(5,22,19,.62)";

  for (
    let i=0;
    i<9;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      -15+i*18+sway,
      H-30-i*17,
      68,
      25,
      -.55,
      0,
      Math.PI*2
    );

    ctx.fill();
  }

  for (
    let i=0;
    i<9;
    i++
  ) {

    ctx.beginPath();

    ctx.ellipse(
      W+15-i*18-sway,
      H-40-i*17,
      68,
      25,
      .55,
      0,
      Math.PI*2
    );

    ctx.fill();
  }
}


/* ==========================================================
   RAIN / MOIST AIR
========================================================== */

function drawRain(time) {

  ctx.save();

  ctx.globalAlpha =
    .13;

  ctx.strokeStyle =
    "#9ed6e2";

  ctx.lineWidth=1;

  for (
    let i=0;
    i<75;
    i++
  ) {

    const x =
      (
        noise(i*81)*W +
        time*.05
      ) %
      W;

    const y =
      (
        noise(i*17)*H +
        time*.14
      ) %
      H;

    const len =
      8+
      noise(i)*13;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
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
   COLOR ATMOSPHERE
========================================================== */

function drawAtmosphere() {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  const cyan =
    ctx.createRadialGradient(
      W*.15,
      H*.65,
      0,
      W*.15,
      H*.65,
      W*.45
    );

  cyan.addColorStop(
    0,
    "rgba(31,171,204,.055)"
  );

  cyan.addColorStop(
    1,
    "rgba(31,171,204,0)"
  );

  ctx.fillStyle =
    cyan;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  const magenta =
    ctx.createRadialGradient(
      W*.85,
      H*.45,
      0,
      W*.85,
      H*.45,
      W*.42
    );

  magenta.addColorStop(
    0,
    "rgba(197,38,158,.045)"
  );

  magenta.addColorStop(
    1,
    "rgba(197,38,158,0)"
  );

  ctx.fillStyle =
    magenta;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.restore();
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


  /* BACKGROUND */

  drawSky();

  drawSkyParticles(time);

  drawSkyline(time);


  /* CITY FLOOR */

  drawRoad();

  drawSidewalk();

  drawTactile();

  drawRoadLines();

  drawCrosswalk(3000);

  drawCrosswalk(1350);


  /* reflected city light */

  drawRoadReflections(time);


  /* WORLD */

  drawObjects(time);


  /* HIGH STRUCTURES */

  drawElevatedHighway();

  drawCables(time);


  /* AIR */

  drawRain(time);

  drawAtmosphere();


  /* FOREGROUND */

  drawForegroundSigns(time);

  drawForegroundLeaves(time);
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

  updateCars(dt);

  updateBus(dt);

  updateScooters(dt);

  updatePedestrians(dt);


  draw(time);


  requestAnimationFrame(
    loop
  );
}

requestAnimationFrame(loop);
