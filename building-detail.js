/* ==========================================================
   杭州探索録3｜夜行杭州
   BUILDING DETAIL SYSTEM
   Ver.0.6

   Ver.0.5 の街・室内システムを維持したまま
   屋外建築の情報量を大幅に増やす。
========================================================== */


/* ==========================================================
   BUILDING PERSONALITY
========================================================== */

function getBuildingStyle(b) {

  const styles = {

    westTower: {
      glass: "#173746",
      glass2: "#102731",
      frame: "#31505a",
      neon: "#43e8ff",
      windowType: "office",
      groundType: "commercial",
      signType: "vertical",
      ac: true,
      pipes: true,
      fireEscape: false
    },

    northCenter: {
      glass: "#241b39",
      glass2: "#12172b",
      frame: "#49365c",
      neon: "#d45cff",
      windowType: "corporate",
      groundType: "luxury",
      signType: "mega",
      ac: false,
      pipes: false,
      fireEscape: false
    },

    northEast: {
      glass: "#1b2832",
      glass2: "#10181e",
      frame: "#35444a",
      neon: "#ff4d9f",
      windowType: "data",
      groundType: "secure",
      signType: "horizontal",
      ac: true,
      pipes: true,
      fireEscape: true
    },

    westBlock: {
      glass: "#302321",
      glass2: "#191413",
      frame: "#49352e",
      neon: "#ff5757",
      windowType: "oldOffice",
      groundType: "restaurant",
      signType: "chaotic",
      ac: true,
      pipes: true,
      fireEscape: true
    },

    eastBlock: {
      glass: "#17303a",
      glass2: "#0c1d23",
      frame: "#2c4a51",
      neon: "#43e8ff",
      windowType: "tech",
      groundType: "mobile",
      signType: "mega",
      ac: true,
      pipes: true,
      fireEscape: false
    },

    restaurant: {
      glass: "#39241e",
      glass2: "#1d1311",
      frame: "#53342b",
      neon: "#ff5a55",
      windowType: "apartment",
      groundType: "diner",
      signType: "traditional",
      ac: true,
      pipes: true,
      fireEscape: true
    },

    convenience: {
      glass: "#18313a",
      glass2: "#102329",
      frame: "#36505a",
      neon: "#43e8ff",
      windowType: "apartment",
      groundType: "convenience",
      signType: "horizontal",
      ac: true,
      pipes: true,
      fireEscape: false
    },

    office: {
      glass: "#191d36",
      glass2: "#0e1325",
      frame: "#34385b",
      neon: "#d55cff",
      windowType: "lab",
      groundType: "futureLobby",
      signType: "mega",
      ac: false,
      pipes: false,
      fireEscape: false
    },

    southWest: {
      glass: "#302a25",
      glass2: "#191716",
      frame: "#4b443c",
      neon: "#ffae45",
      windowType: "apartment",
      groundType: "shops",
      signType: "chaotic",
      ac: true,
      pipes: true,
      fireEscape: true
    },

    eastMiddle: {
      glass: "#142d38",
      glass2: "#0c1c24",
      frame: "#31515c",
      neon: "#46e5ff",
      windowType: "corporate",
      groundType: "luxury",
      signType: "vertical",
      ac: false,
      pipes: true,
      fireEscape: false
    },

    westMiddle: {
      glass: "#29202d",
      glass2: "#17131a",
      frame: "#47384a",
      neon: "#e154ff",
      windowType: "oldOffice",
      groundType: "nightShops",
      signType: "chaotic",
      ac: true,
      pipes: true,
      fireEscape: true
    }
  };

  return styles[b.id] || {
    glass: "#172a32",
    glass2: "#0d1920",
    frame: "#33464c",
    neon: b.neon || "#55eaff",
    windowType: "office",
    groundType: "commercial",
    signType: "horizontal",
    ac: true,
    pipes: true,
    fireEscape: false
  };
}


/* ==========================================================
   WINDOW INTERIOR
========================================================== */

function drawWindowInterior(
  x,
  y,
  w,
  h,
  seed,
  style,
  s,
  time
) {

  const lit =
    noise(seed) > .40;

  const warm =
    noise(seed + 14) > .52;

  const occupied =
    noise(seed + 28) > .68;

  const blinds =
    noise(seed + 41) > .73;

  const plant =
    noise(seed + 62) > .78;

  const monitor =
    noise(seed + 91) > .58;


  /* window cavity */

  ctx.fillStyle =
    lit
      ? warm
        ? "rgba(255,184,105,.30)"
        : "rgba(72,190,225,.23)"
      : "rgba(3,8,12,.88)";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );


  /* room back wall */

  if (lit) {

    ctx.fillStyle =
      warm
        ? "rgba(105,67,45,.22)"
        : "rgba(38,72,86,.20)";

    ctx.fillRect(
      x + w*.06,
      y + h*.08,
      w*.88,
      h*.77
    );


    /* ceiling light */

    ctx.fillStyle =
      warm
        ? "rgba(255,224,171,.60)"
        : "rgba(170,238,255,.47)";

    ctx.fillRect(
      x+w*.25,
      y+h*.10,
      w*.50,
      Math.max(1,2*s)
    );


    /* desk */

    if (
      style.windowType !== "data" &&
      noise(seed+100)>.34
    ) {

      ctx.fillStyle =
        "rgba(20,25,28,.78)";

      ctx.fillRect(
        x+w*.14,
        y+h*.62,
        w*.62,
        h*.08
      );

      ctx.fillRect(
        x+w*.20,
        y+h*.69,
        w*.06,
        h*.20
      );

      ctx.fillRect(
        x+w*.66,
        y+h*.69,
        w*.06,
        h*.20
      );
    }


    /* monitor */

    if (monitor) {

      glow(
        noise(seed+103)>.5
          ? "#5ee8ff"
          : "#d35cff",
        5*s
      );

      ctx.fillStyle =
        noise(seed+103)>.5
          ? "rgba(72,225,255,.70)"
          : "rgba(211,92,255,.62)";

      ctx.fillRect(
        x+w*.35,
        y+h*.42,
        w*.22,
        h*.17
      );

      noGlow();

      ctx.fillStyle =
        "rgba(6,11,14,.9)";

      ctx.fillRect(
        x+w*.445,
        y+h*.59,
        w*.03,
        h*.07
      );
    }


    /* person silhouette */

    if (occupied) {

      const px =
        x+w*(
          .32+
          noise(seed+120)*.32
        );

      const headY =
        y+h*.48;

      ctx.fillStyle =
        "rgba(7,10,12,.78)";

      ctx.beginPath();

      ctx.arc(
        px,
        headY,
        Math.max(2,4*s),
        0,
        Math.PI*2
      );

      ctx.fill();

      ctx.fillRect(
        px-4*s,
        headY+4*s,
        8*s,
        15*s
      );
    }


    /* plant */

    if (plant) {

      ctx.fillStyle =
        "rgba(18,40,29,.88)";

      ctx.fillRect(
        x+w*.78,
        y+h*.67,
        7*s,
        14*s
      );

      ctx.fillStyle =
        "rgba(48,102,66,.82)";

      for (let i=0;i<4;i++) {

        ctx.beginPath();

        ctx.ellipse(
          x+w*.81+
          (i-1.5)*3*s,
          y+h*.60+
          Math.abs(i-1.5)*2*s,
          4*s,
          8*s,
          (i-1.5)*.3,
          0,
          Math.PI*2
        );

        ctx.fill();
      }
    }
  }


  /* blinds */

  if (blinds) {

    ctx.strokeStyle =
      "rgba(185,200,201,.18)";

    ctx.lineWidth =
      Math.max(.5,s*.7);

    for (
      let yy=y+4*s;
      yy<y+h;
      yy+=6*s
    ) {

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
    "rgba(150,230,255,.055)";

  ctx.beginPath();

  ctx.moveTo(
    x+w*.08,
    y
  );

  ctx.lineTo(
    x+w*.28,
    y
  );

  ctx.lineTo(
    x+w*.72,
    y+h
  );

  ctx.lineTo(
    x+w*.52,
    y+h
  );

  ctx.closePath();

  ctx.fill();


  /* frame */

  ctx.strokeStyle =
    "rgba(80,112,122,.42)";

  ctx.lineWidth =
    Math.max(1,1.2*s);

  ctx.strokeRect(
    x,y,w,h
  );
}


/* ==========================================================
   AIR CONDITIONER
========================================================== */

function drawACUnit(
  x,
  y,
  s,
  seed
) {

  const w=38*s;
  const h=20*s;

  ctx.fillStyle =
    "#8b9696";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );

  ctx.fillStyle =
    "#667173";

  ctx.fillRect(
    x+4*s,
    y+4*s,
    19*s,
    12*s
  );


  /* fan */

  ctx.strokeStyle =
    "#353f42";

  ctx.lineWidth =
    Math.max(1,s);

  ctx.beginPath();

  ctx.arc(
    x+13*s,
    y+10*s,
    6*s,
    0,
    Math.PI*2
  );

  ctx.stroke();


  for(let i=0;i<4;i++){

    const a=
      i*Math.PI/2+
      noise(seed)*.5;

    ctx.beginPath();

    ctx.moveTo(
      x+13*s,
      y+10*s
    );

    ctx.lineTo(
      x+13*s+
      Math.cos(a)*5*s,
      y+10*s+
      Math.sin(a)*5*s
    );

    ctx.stroke();
  }


  /* vents */

  ctx.strokeStyle =
    "rgba(30,38,40,.65)";

  for(let i=0;i<4;i++){

    ctx.beginPath();

    ctx.moveTo(
      x+27*s+i*2*s,
      y+4*s
    );

    ctx.lineTo(
      x+27*s+i*2*s,
      y+16*s
    );

    ctx.stroke();
  }


  /* bracket */

  ctx.strokeStyle =
    "#535d5e";

  ctx.beginPath();

  ctx.moveTo(
    x+5*s,
    y+h
  );

  ctx.lineTo(
    x+5*s,
    y+h+5*s
  );

  ctx.lineTo(
    x+14*s,
    y+h+5*s
  );

  ctx.stroke();
}


/* ==========================================================
   PIPES
========================================================== */

function drawBuildingPipes(
  x,
  y,
  height,
  width,
  s,
  seed
) {

  const px =
    x+
    width*
    (
      noise(seed)>.5
        ? .08
        : .91
    );

  ctx.strokeStyle =
    "rgba(105,119,120,.70)";

  ctx.lineWidth =
    Math.max(1.3,3*s);

  ctx.beginPath();

  ctx.moveTo(
    px,
    y-height*.84
  );

  ctx.lineTo(
    px,
    y-30*s
  );

  ctx.lineTo(
    px+15*s,
    y-15*s
  );

  ctx.stroke();


  /* pipe clamps */

  ctx.strokeStyle =
    "rgba(170,175,170,.55)";

  ctx.lineWidth =
    Math.max(1,s);

  for(let yy=y-height*.75;
      yy<y-50*s;
      yy+=70*s){

    ctx.beginPath();

    ctx.moveTo(
      px-5*s,
      yy
    );

    ctx.lineTo(
      px+5*s,
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
  height,
  width,
  s
) {

  const fx =
    x+width-50*s;

  const top =
    y-height*.72;

  const bottom =
    y-145*s;

  ctx.strokeStyle =
    "rgba(93,103,104,.65)";

  ctx.lineWidth =
    Math.max(1,2*s);


  for(
    let yy=top;
    yy<bottom;
    yy+=75*s
  ){

    ctx.strokeRect(
      fx-34*s,
      yy,
      62*s,
      9*s
    );


    ctx.beginPath();

    ctx.moveTo(
      fx-27*s,
      yy+9*s
    );

    ctx.lineTo(
      fx+20*s,
      yy+70*s
    );

    ctx.stroke();
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
    fx+28*s,
    top
  );

  ctx.lineTo(
    fx+28*s,
    bottom+20*s
  );

  ctx.stroke();
}


/* ==========================================================
   ROOFTOP DETAILS
========================================================== */

function drawRooftopDetails(
  x,
  roofY,
  width,
  s,
  seed,
  neon,
  time
) {

  /* machinery room */

  ctx.fillStyle =
    "#1e3036";

  ctx.fillRect(
    x+width*.12,
    roofY-42*s,
    width*.18,
    42*s
  );

  ctx.fillStyle =
    "#30454b";

  ctx.fillRect(
    x+width*.12,
    roofY-45*s,
    width*.18,
    5*s
  );


  /* rooftop AC */

  for(let i=0;i<3;i++){

    const ax =
      x+
      width*(
        .43+i*.12
      );

    ctx.fillStyle =
      "#455459";

    ctx.fillRect(
      ax,
      roofY-22*s,
      32*s,
      22*s
    );

    ctx.strokeStyle =
      "#1c282c";

    ctx.beginPath();

    ctx.arc(
      ax+16*s,
      roofY-11*s,
      7*s,
      0,
      Math.PI*2
    );

    ctx.stroke();
  }


  /* water tank */

  if(noise(seed+500)>.48){

    ctx.fillStyle =
      "#263b40";

    ctx.fillRect(
      x+width*.72,
      roofY-50*s,
      46*s,
      50*s
    );

    ctx.strokeStyle =
      "#51676b";

    for(let i=0;i<4;i++){

      ctx.beginPath();

      ctx.moveTo(
        x+width*.72,
        roofY-
        (10+i*10)*s
      );

      ctx.lineTo(
        x+width*.72+
        46*s,
        roofY-
        (10+i*10)*s
      );

      ctx.stroke();
    }
  }


  /* antenna */

  const antennaX =
    x+width*.84;

  ctx.strokeStyle =
    "#52646a";

  ctx.lineWidth =
    Math.max(1,2*s);

  ctx.beginPath();

  ctx.moveTo(
    antennaX,
    roofY
  );

  ctx.lineTo(
    antennaX,
    roofY-110*s
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    antennaX-25*s,
    roofY-65*s
  );

  ctx.lineTo(
    antennaX+25*s,
    roofY-65*s
  );

  ctx.stroke();


  /* aircraft warning light */

  if(
    Math.floor(time/700)%2===0
  ){

    glow(
      "#ff334d",
      13*s
    );

    ctx.fillStyle =
      "#ff4055";

    ctx.beginPath();

    ctx.arc(
      antennaX,
      roofY-112*s,
      4*s,
      0,
      Math.PI*2
    );

    ctx.fill();

    noGlow();
  }
}


/* ==========================================================
   GROUND FLOOR DETAILS
========================================================== */

function drawGroundFloor(
  b,
  style,
  x,
  y,
  width,
  s,
  time
) {

  const floorH =
    112*s;


  ctx.fillStyle =
    "#071014";

  ctx.fillRect(
    x,
    y-floorH,
    width,
    floorH
  );


  /* large storefront windows */

  const bays =
    Math.max(
      3,
      Math.floor(
        width/(120*s)
      )
    );

  const bayW =
    width/bays;


  for(let i=0;i<bays;i++){

    const wx =
      x+
      i*bayW+
      8*s;

    const ww =
      bayW-
      16*s;


    const seed =
      b.x+
      b.y+
      i*913;


    ctx.fillStyle =
      noise(seed)>.35
        ? "rgba(58,166,190,.16)"
        : "rgba(244,166,91,.12)";

    ctx.fillRect(
      wx,
      y-83*s,
      ww,
      62*s
    );


    /* interior counter/table */

    if(
      noise(seed+11)>.35
    ){

      ctx.fillStyle =
        "rgba(25,30,31,.85)";

      ctx.fillRect(
        wx+ww*.15,
        y-43*s,
        ww*.65,
        8*s
      );
    }


    /* silhouettes */

    if(
      noise(seed+42)>.65
    ){

      const px =
        wx+ww*.55;

      ctx.fillStyle =
        "rgba(3,7,8,.75)";

      ctx.beginPath();

      ctx.arc(
        px,
        y-55*s,
        5*s,
        0,
        Math.PI*2
      );

      ctx.fill();

      ctx.fillRect(
        px-4*s,
        y-50*s,
        8*s,
        17*s
      );
    }


    /* glass reflection */

    ctx.fillStyle =
      "rgba(130,225,245,.06)";

    ctx.beginPath();

    ctx.moveTo(
      wx,
      y-83*s
    );

    ctx.lineTo(
      wx+ww*.24,
      y-83*s
    );

    ctx.lineTo(
      wx+ww*.70,
      y-21*s
    );

    ctx.lineTo(
      wx+ww*.48,
      y-21*s
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
      "rgba(70,118,130,.40)";

    ctx.strokeRect(
      wx,
      y-83*s,
      ww,
      62*s
    );
  }


  /* entrance */

  const doorX =
    x+
    width*.5;

  ctx.fillStyle =
    "rgba(16,36,43,.92)";

  ctx.fillRect(
    doorX-31*s,
    y-85*s,
    62*s,
    85*s
  );


  ctx.strokeStyle =
    b.enter
      ? style.neon
      : "rgba(81,120,130,.65)";

  ctx.lineWidth =
    Math.max(1,2*s);

  ctx.strokeRect(
    doorX-31*s,
    y-85*s,
    62*s,
    85*s
  );


  if(b.enter){

    glow(
      style.neon,
      16*s
    );

    ctx.strokeStyle =
      style.neon;

    ctx.strokeRect(
      doorX-35*s,
      y-90*s,
      70*s,
      90*s
    );

    noGlow();
  }


  /* awning */

  if(
    [
      "diner",
      "shops",
      "nightShops",
      "convenience"
    ].includes(
      style.groundType
    )
  ){

    ctx.fillStyle =
      style.groundType==="diner"
        ? "#74332b"
        : "#183b43";

    ctx.fillRect(
      x+15*s,
      y-115*s,
      width-30*s,
      17*s
    );

    ctx.fillStyle =
      style.neon;

    ctx.fillRect(
      x+15*s,
      y-99*s,
      width-30*s,
      3*s
    );
  }


  /* vending machine */

  if(
    noise(b.x+b.y+900)>.38
  ){

    const vx =
      x+width*.08;

    ctx.fillStyle =
      "#b7c3c5";

    ctx.fillRect(
      vx,
      y-66*s,
      29*s,
      66*s
    );

    glow(
      "#70e8ff",
      7*s
    );

    ctx.fillStyle =
      "#8eefff";

    ctx.fillRect(
      vx+4*s,
      y-59*s,
      21*s,
      26*s
    );

    noGlow();

    ctx.fillStyle =
      "#273236";

    for(let r=0;r<3;r++){

      for(let c=0;c<3;c++){

        ctx.fillRect(
          vx+
          6*s+
          c*6*s,
          y-
          55*s+
          r*7*s,
          3*s,
          4*s
        );
      }
    }
  }


  /* trash bins */

  ctx.fillStyle =
    "#263338";

  ctx.fillRect(
    x+width*.88,
    y-28*s,
    18*s,
    28*s
  );

  ctx.fillStyle =
    "#3b4a4e";

  ctx.fillRect(
    x+width*.88-2*s,
    y-30*s,
    22*s,
    5*s
  );


  /* cardboard boxes */

  if(
    noise(b.x+731)>.55
  ){

    ctx.fillStyle =
      "#6b5137";

    ctx.fillRect(
      x+width*.80,
      y-18*s,
      25*s,
      18*s
    );

    ctx.fillStyle =
      "#806345";

    ctx.fillRect(
      x+width*.83,
      y-31*s,
      20*s,
      13*s
    );
  }
}


/* ==========================================================
   BUILDING SIGNAGE
========================================================== */

function drawBuildingSigns(
  b,
  style,
  x,
  y,
  width,
  height,
  s
) {

  /* main horizontal sign */

  const signW =
    Math.min(
      width*.52,
      310*s
    );

  const signX =
    x+25*s;

  const signY =
    y-142*s;


  glow(
    style.neon,
    13*s
  );

  ctx.strokeStyle =
    style.neon;

  ctx.lineWidth =
    Math.max(1,2*s);

  ctx.strokeRect(
    signX,
    signY,
    signW,
    37*s
  );

  noGlow();


  ctx.fillStyle =
    "#e9fdff";

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
    signX+10*s,
    signY+24*s
  );


  /* vertical sign */

  if(
    style.signType==="vertical" ||
    style.signType==="chaotic"
  ){

    const vx =
      x+
      width-
      46*s;

    const vy =
      y-
      Math.min(
        height*.48,
        430*s
      );

    const vh =
      Math.min(
        height*.28,
        250*s
      );


    glow(
      style.neon,
      15*s
    );

    ctx.fillStyle =
      "rgba(5,10,14,.86)";

    ctx.fillRect(
      vx,
      vy,
      34*s,
      vh
    );

    ctx.strokeStyle =
      style.neon;

    ctx.strokeRect(
      vx,
      vy,
      34*s,
      vh
    );

    noGlow();


    const chars =
      b.sign
      .replace(/\s/g,"")
      .slice(0,6)
      .split("");


    ctx.fillStyle =
      style.neon;

    ctx.textAlign =
      "center";

    ctx.font =
      `bold ${12*s}px sans-serif`;


    chars.forEach(
      (char,i)=>{

        ctx.fillText(
          char,
          vx+17*s,
          vy+
          24*s+
          i*24*s
        );
      }
    );
  }


  /* huge LED screen */

  if(
    style.signType==="mega"
  ){

    const mw =
      Math.min(
        width*.40,
        270*s
      );

    const mh =
      115*s;

    const mx =
      x+
      width-
      mw-
      28*s;

    const my =
      y-
      height*.56;


    const gradient =
      ctx.createLinearGradient(
        mx,my,
        mx+mw,
        my+mh
      );

    gradient.addColorStop(
      0,
      "rgba(41,220,255,.65)"
    );

    gradient.addColorStop(
      .48,
      "rgba(118,73,255,.48)"
    );

    gradient.addColorStop(
      1,
      "rgba(239,65,186,.57)"
    );


    glow(
      style.neon,
      19*s
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      mx,my,mw,mh
    );

    noGlow();


    ctx.fillStyle =
      "rgba(240,255,255,.92)";

    ctx.font =
      `bold ${16*s}px sans-serif`;

    ctx.textAlign =
      "center";

    ctx.fillText(
      "HANGZHOU",
      mx+mw/2,
      my+43*s
    );

    ctx.font =
      `${9*s}px monospace`;

    ctx.fillText(
      "CITY // FUTURE",
      mx+mw/2,
      my+66*s
    );


    /* scan lines */

    ctx.fillStyle =
      "rgba(0,0,0,.11)";

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
   MAIN DETAILED BUILDING RENDERER

   IMPORTANT:
   game.js の既存 drawBuilding() より後から
   この関数で上書きされる。
========================================================== */

function drawDetailedBuilding(
  b,
  time
) {

  const style =
    getBuildingStyle(b);


  const p =
    project(
      b.x+b.w/2,
      b.y+b.h
    );


  if(
    p.y < -1200 ||
    p.y > H+1000
  )
    return;


  const s=p.scale;

  const width =
    b.w*s;

  const height =
    (
      190+
      b.floors*28
    )*s;


  const x =
    p.x-
    width/2;

  const y =
    p.y;


  /* ======================================================
     SHADOW
  ====================================================== */

  ctx.fillStyle =
    "rgba(0,0,0,.55)";

  ctx.beginPath();

  ctx.ellipse(
    p.x+35*s,
    y+13*s,
    width*.51,
    32*s,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* ======================================================
     MAIN FACADE
  ====================================================== */

  const facade =
    ctx.createLinearGradient(
      x,
      y-height,
      x+width,
      y
    );

  facade.addColorStop(
    0,
    style.glass
  );

  facade.addColorStop(
    .48,
    style.glass2
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


  /* ======================================================
     SIDE WALL
  ====================================================== */

  const depthX =
    72*s;

  const depthY =
    37*s;


  ctx.fillStyle =
    "#071016";

  ctx.beginPath();

  ctx.moveTo(
    x+width,
    y-height
  );

  ctx.lineTo(
    x+width+depthX,
    y-height-depthY
  );

  ctx.lineTo(
    x+width+depthX,
    y-depthY
  );

  ctx.lineTo(
    x+width,
    y
  );

  ctx.closePath();

  ctx.fill();


  /* side facade lines */

  ctx.strokeStyle =
    "rgba(75,108,116,.22)";

  ctx.lineWidth =
    Math.max(.5,s);

  for(
    let yy=y-height+50*s;
    yy<y-110*s;
    yy+=55*s
  ){

    ctx.beginPath();

    ctx.moveTo(
      x+width,
      yy
    );

    ctx.lineTo(
      x+width+depthX,
      yy-depthY
    );

    ctx.stroke();
  }


  /* ======================================================
     LARGE WINDOWS
  ====================================================== */

  const upperBottom =
    y-155*s;

  const upperTop =
    y-height+50*s;

  const available =
    upperBottom-
    upperTop;


  const cols =
    clamp(
      Math.floor(
        b.w/145
      ),
      4,
      10
    );


  const rows =
    clamp(
      Math.floor(
        b.floors*.58
      ),
      4,
      12
    );


  const marginX =
    24*s;

  const gapX =
    10*s;

  const gapY =
    10*s;

  const cellW =
    (
      width-
      marginX*2-
      gapX*(cols-1)
    )/cols;

  const cellH =
    (
      available-
      gapY*(rows-1)
    )/rows;


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
        b.x*1.3+
        b.y*.7+
        row*137+
        col*67;


      drawWindowInterior(
        wx,
        wy,
        cellW,
        cellH,
        seed,
        style,
        s,
        time
      );


      /* AC under selected windows */

      if(
        style.ac &&
        row>0 &&
        noise(seed+200)>.74
      ){

        drawACUnit(
          wx+
          cellW-
          34*s,

          wy+
          cellH-
          4*s,

          s*.70,

          seed
        );
      }
    }
  }


  /* ======================================================
     FACADE FRAME
  ====================================================== */

  ctx.strokeStyle =
    style.frame;

  ctx.lineWidth =
    Math.max(1,2*s);

  for(let c=1;c<cols;c++){

    const xx =
      x+
      marginX+
      c*
      (
        cellW+
        gapX
      )-
      gapX*.5;

    ctx.beginPath();

    ctx.moveTo(
      xx,
      upperTop
    );

    ctx.lineTo(
      xx,
      upperBottom
    );

    ctx.stroke();
  }


  /* ======================================================
     PIPES / FIRE ESCAPE
  ====================================================== */

  if(style.pipes){

    drawBuildingPipes(
      x,
      y,
      height,
      width,
      s,
      b.x+b.y
    );
  }


  if(style.fireEscape){

    drawFireEscape(
      x,
      y,
      height,
      width,
      s
    );
  }


  /* ======================================================
     GROUND FLOOR
  ====================================================== */

  drawGroundFloor(
    b,
    style,
    x,
    y,
    width,
    s,
    time
  );


  /* ======================================================
     SIGNS
  ====================================================== */

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
    "#1b2c32";

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
    y-height-depthY
  );

  ctx.lineTo(
    x+depthX,
    y-height-depthY
  );

  ctx.closePath();

  ctx.fill();


  ctx.strokeStyle =
    "rgba(83,125,135,.38)";

  ctx.lineWidth =
    Math.max(1,s);

  ctx.stroke();


  /* roof edge */

  ctx.fillStyle =
    "#31464c";

  ctx.fillRect(
    x,
    y-height-5*s,
    width,
    7*s
  );


  /* ======================================================
     ROOFTOP EQUIPMENT
  ====================================================== */

  drawRooftopDetails(
    x,
    y-height,
    width,
    s,
    b.x+b.y,
    style.neon,
    time
  );


  /* ======================================================
     SMALL FACADE DETAILS
  ====================================================== */

  /* electrical box */

  if(
    style.pipes
  ){

    ctx.fillStyle =
      "#596466";

    ctx.fillRect(
      x+18*s,
      y-76*s,
      25*s,
      32*s
    );

    ctx.strokeStyle =
      "#293336";

    ctx.strokeRect(
      x+18*s,
      y-76*s,
      25*s,
      32*s
    );


    ctx.fillStyle =
      "#c8a850";

    ctx.fillRect(
      x+28*s,
      y-62*s,
      5*s,
      5*s
    );
  }


  /* exhaust vents */

  for(let i=0;i<2;i++){

    if(
      noise(
        b.x+
        b.y+
        i*61
      )>.45
    ){

      const vx =
        x+
        width*
        (
          .17+
          i*.62
        );

      const vy =
        y-
        130*s;


      ctx.fillStyle =
        "#303d41";

      ctx.fillRect(
        vx,
        vy,
        26*s,
        18*s
      );

      ctx.strokeStyle =
        "#161f22";

      for(let j=0;j<4;j++){

        ctx.beginPath();

        ctx.moveTo(
          vx+4*s,
          vy+
          4*s+
          j*3*s
        );

        ctx.lineTo(
          vx+22*s,
          vy+
          4*s+
          j*3*s
        );

        ctx.stroke();
      }
    }
  }
}


/* ==========================================================
   OVERRIDE HOOK

   game.js に元の drawBuilding があるため、
   window load 後ではなく script 読み込み順の関係上、
   game.js 側からこの関数を呼べるよう公開する。
========================================================== */

window.drawDetailedBuilding =
  drawDetailedBuilding;
