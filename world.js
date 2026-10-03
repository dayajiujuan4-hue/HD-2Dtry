/* ==========================================================
   杭州探索録3
   夜行杭州

   WORLD DATA
   Ver.0.6
========================================================== */

const WORLD = {

  width: 3800,

  height: 3900
};


/* ==========================================================
   ROADS
========================================================== */

const ROADS = [

  /* 中央南北大通り */

  {
    x: 1450,
    y: 0,

    w: 720,
    h: 3900,

    type: "main"
  },


  /* 中央東西大通り */

  {
    x: 0,
    y: 1450,

    w: 3800,
    h: 650,

    type: "main"
  },


  /* 北側横断道路 */

  {
    x: 450,
    y: 650,

    w: 2900,
    h: 420,

    type: "street"
  },


  /* 南西 */

  {
    x: 470,
    y: 2050,

    w: 430,
    h: 1450,

    type: "alley"
  },


  /* 南東 */

  {
    x: 2850,
    y: 1950,

    w: 430,
    h: 1500,

    type: "alley"
  },


  /* 西側横道 */

  {
    x: 470,
    y: 2550,

    w: 1200,
    h: 380,

    type: "street"
  },


  /* 東側横道 */

  {
    x: 1950,
    y: 2500,

    w: 1330,
    h: 400,

    type: "street"
  },


  /* 北西路地 */

  {
    x: 720,
    y: 900,

    w: 370,
    h: 700,

    type: "alley"
  },


  /* 北東路地 */

  {
    x: 2650,
    y: 900,

    w: 370,
    h: 700,

    type: "alley"
  }
];


/* ==========================================================
   BUILDINGS

   visualType

   glassOffice
   megaTower
   dataCenter
   oldMixed
   techOffice
   dinerBuilding
   apartmentStore
   futureLab
   residential
========================================================== */

const BUILDINGS = [

  {
    id:
      "westTower",

    x: 180,
    y: 160,

    w: 1100,
    h: 440,

    floors: 17,

    sign:
      "钱江未来中心",

    neon:
      "#43e8ff",

    visualType:
      "glassOffice"
  },


  {
    id:
      "northCenter",

    x: 1240,
    y: 100,

    w: 1100,
    h: 470,

    floors: 26,

    sign:
      "HANGZHOU 2049",

    neon:
      "#d45cff",

    visualType:
      "megaTower"
  },


  {
    id:
      "northEast",

    x: 2470,
    y: 160,

    w: 1000,
    h: 430,

    floors: 21,

    sign:
      "城市数据中心",

    neon:
      "#ff4d9f",

    visualType:
      "dataCenter"
  },


  /* ===============================================
     WEST OLD DISTRICT
  =============================================== */

  {
    id:
      "westBlock",

    x: 100,
    y: 1110,

    w: 1160,
    h: 290,

    floors: 9,

    sign:
      "夜杭州",

    neon:
      "#ff5757",

    visualType:
      "oldMixed"
  },


  {
    id:
      "westMiddle",

    x: 80,
    y: 1910,

    w: 350,
    h: 590,

    floors: 11,

    sign:
      "夜行街区",

    neon:
      "#e154ff",

    visualType:
      "oldMixed"
  },


  {
    id:
      "westSouthA",

    x: 930,
    y: 2130,

    w: 430,
    h: 340,

    floors: 6,

    sign:
      "钱塘生活",

    neon:
      "#ff8b55",

    visualType:
      "residential"
  },


  /* ===============================================
     RESTAURANT
  =============================================== */

  {
    id:
      "restaurant",

    x: 930,
    y: 2980,

    w: 430,
    h: 330,

    floors: 4,

    sign:
      "钱塘深夜食堂",

    neon:
      "#ff5a55",

    visualType:
      "dinerBuilding",

    enter:
      "restaurant",

    entrance: {

      x: 1145,

      y: 3320
    }
  },


  /* ===============================================
     EAST DISTRICT
  =============================================== */

  {
    id:
      "eastBlock",

    x: 2330,
    y: 1110,

    w: 1200,
    h: 290,

    floors: 13,

    sign:
      "未来通信",

    neon:
      "#43e8ff",

    visualType:
      "techOffice"
  },


  {
    id:
      "eastMiddle",

    x: 3330,
    y: 1970,

    w: 350,
    h: 970,

    floors: 18,

    sign:
      "钱江国际",

    neon:
      "#46e5ff",

    visualType:
      "glassOffice"
  },


  /* ===============================================
     CONVENIENCE STORE
  =============================================== */

  {
    id:
      "convenience",

    x: 2200,
    y: 2180,

    w: 520,
    h: 300,

    floors: 7,

    sign:
      "24H 便利店",

    neon:
      "#43e8ff",

    visualType:
      "apartmentStore",

    enter:
      "convenience",

    entrance: {

      x: 2460,

      y: 2490
    }
  },


  /* ===============================================
     FUTURE LAB
  =============================================== */

  {
    id:
      "office",

    x: 2200,
    y: 3000,

    w: 650,
    h: 420,

    floors: 16,

    sign:
      "未来都市研究所",

    neon:
      "#d55cff",

    visualType:
      "futureLab",

    enter:
      "office",

    entrance: {

      x: 2525,

      y: 2990
    }
  },


  /* ===============================================
     SOUTH WEST
  =============================================== */

  {
    id:
      "southWest",

    x: 100,
    y: 3450,

    w: 1250,
    h: 350,

    floors: 13,

    sign:
      "杭州生活",

    neon:
      "#ffae45",

    visualType:
      "residential"
  }
];


/* ==========================================================
   STREET TREES
========================================================== */

const TREES = [

  {x:1370,y:390},
  {x:2250,y:430},

  {x:1370,y:820},
  {x:2250,y:850},

  {x:1370,y:1220},
  {x:2250,y:1230},

  {x:1370,y:2210},
  {x:2250,y:2220},

  {x:1370,y:2670},
  {x:2180,y:2700},

  {x:1380,y:3400},
  {x:2170,y:3400},

  {x:500,y:1510},
  {x:850,y:1510},
  {x:1150,y:1510},

  {x:2520,y:1510},
  {x:2900,y:1510},
  {x:3300,y:1510}
];


/* ==========================================================
   STREET LIGHTS
========================================================== */

const STREET_LIGHTS = [

  {x:1400,y:620},
  {x:2210,y:670},

  {x:1400,y:1160},
  {x:2210,y:1160},

  {x:1400,y:2180},
  {x:2210,y:2180},

  {x:1400,y:2780},
  {x:2210,y:2780},

  {x:1400,y:3420},
  {x:2210,y:3420},

  {x:680,y:1420},
  {x:1080,y:1420},

  {x:2570,y:1420},
  {x:3060,y:1420}
];


/* ==========================================================
   STREET SIGNS
========================================================== */

const STREET_SIGNS = [

  {
    x: 1400,
    y: 1860,

    text:
      "← 夜市　钱江新城 →",

    color:
      "#45e7ff"
  },


  {
    x: 2200,
    y: 890,

    text:
      "市民中心 ↑",

    color:
      "#52eaff"
  },


  {
    x: 890,
    y: 2760,

    text:
      "深夜食堂 ↓",

    color:
      "#ff5555"
  },


  {
    x: 2800,
    y: 2620,

    text:
      "24H · 商业街",

    color:
      "#44e8ff"
  }
];


/* ==========================================================
   NPCS
========================================================== */

const NPCS = [

  {
    x: 1580,
    y: 1800,
    color: "#526c7a"
  },

  {
    x: 1980,
    y: 1700,
    color: "#704d69"
  },

  {
    x: 720,
    y: 2700,
    color: "#536e5e"
  },

  {
    x: 2950,
    y: 2700,
    color: "#67556e"
  },

  {
    x: 1600,
    y: 800,
    color: "#6b654e"
  },

  {
    x: 2010,
    y: 1110,
    color: "#466174"
  },

  {
    x: 1570,
    y: 3150,
    color: "#574d67"
  }
];


/* ==========================================================
   INTERIORS
========================================================== */

const INTERIORS = {

  convenience: {

    title:
      "24H 便利店",

    sub:
      "QIANJIANG · CONVENIENCE STORE",

    width:
      1050,

    height:
      800,

    spawn: {

      x:525,
      y:690
    },

    exit: {

      x:525,
      y:735
    }
  },


  restaurant: {

    title:
      "钱塘深夜食堂",

    sub:
      "LATE NIGHT DINER",

    width:
      1050,

    height:
      800,

    spawn: {

      x:525,
      y:690
    },

    exit: {

      x:525,
      y:735
    }
  },


  office: {

    title:
      "未来都市研究所",

    sub:
      "FUTURE CITY LAB · LOBBY",

    width:
      1100,

    height:
      850,

    spawn: {

      x:550,
      y:735
    },

    exit: {

      x:550,
      y:790
    }
  }
};
