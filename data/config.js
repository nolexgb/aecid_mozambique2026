/* ======================================================================
   CONFIG.JS
   Mapa Interactivo
   Cooperación Española - AECID Mozambique
   ====================================================================== */

export const CONFIG = {

  /* ==================================================================
     INFORMACIÓN GENERAL
     ================================================================== */

  APP: {

    TITLE: "Mapa interactivo de proyectos",

    SUBTITLE:
      "Cooperación Española en Mozambique",

    DESCRIPTION:
      "Explore los proyectos financiados por la AECID en Mozambique.",

    VERSION: "2.0 Premium",

    LANGUAGE: "es"

  },



  /* ==================================================================
     GOOGLE SHEETS
     ================================================================== */

  DATA: {

    SOURCE: "google",

    URL:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?gid=0&single=true&output=csv",

    AUTO_REFRESH: false,

    REFRESH_INTERVAL: 300000

  },



  /* ==================================================================
     MAPA
     ================================================================== */

  MAP: {

    CENTER: [-18.6657, 35.5296],

    INITIAL_ZOOM: 5.4,

    MIN_ZOOM: 4,

    MAX_ZOOM: 12,

    FIT_PADDING: [80, 80],

    TILE_LAYER:
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",

    ATTRIBUTION:
      "&copy; OpenStreetMap &copy; CARTO",

    SUBDOMAINS: "abcd"

  },



  /* ==================================================================
     IDENTIDAD VISUAL
     ================================================================== */

  BRAND: {

    PRIMARY: "#D0001B",

    SECONDARY: "#003B79",

    ACCENT: "#FFCC00",

    SUCCESS: "#16A34A",

    WARNING: "#F59E0B",

    PURPLE: "#8E24AA",

    DEFAULT: "#9CA3AF"

  },



  /* ==================================================================
     MODALIDADES
     ================================================================== */

  MODALITIES: {

    Bilateral: {

      color: "#003B79",

      icon: "●"

    },

    "Convocatoria ONGD": {

      color: "#F59E0B",

      icon: "●"

    },

    Convenio: {

      color: "#16A34A",

      icon: "●"

    },

    Innovación: {

      color: "#8E24AA",

      icon: "●"

    }

  },



  /* ==================================================================
     MARCADORES
     ================================================================== */

  MARKERS: {

    MIN_RADIUS: 18,

    MAX_RADIUS: 40,

    SCALE_FACTOR: 2.5,

    BORDER_WIDTH: 3,

    BORDER_COLOR: "#FFFFFF",

    SHADOW: true

  },



  /* ==================================================================
     FILTROS
     ================================================================== */

  FILTERS: [

    "modalidad",

    "sector",

    "ods",

    "estado"

  ],



  /* ==================================================================
     BUSCADOR
     ================================================================== */

  SEARCH: {

    ENABLED: true,

    PLACEHOLDER:
      "Buscar socio o entidad colaboradora...",

    SEARCH_FIELDS: [

      "partners",

      "province",

      "district",

      "locality",

      "title"

    ],

    MIN_CHARACTERS: 2,

    MAX_RESULTS: 8

  },



  /* ==================================================================
     KPIs
     ================================================================== */

  KPI: {

    SHOW_AMOUNT: true,

    SHOW_PROJECTS: true,

    SHOW_YEARS: true,

    SHOW_TERRITORY: true,

    TERRITORY_TEXT:
      "6 provincias + ámbito nacional"

  },



  /* ==================================================================
     INTRO
     ================================================================== */

  INTRO: {

    ENABLED: true,

    IMAGE:
      "assets/images/moz1.jpg",

    DURATION: 3500,

    ENABLE_ZOOM: true,

    ENABLE_FADE: true

  },



  /* ==================================================================
     POPUPS
     ================================================================== */

  POPUP: {

    MAX_WIDTH: 620,

    ENABLE_GLASS: true,

    ENABLE_TIMELINE: true,

    ENABLE_CHARTS: true,

    ENABLE_SECTOR_CHART: true,

    ENABLE_MODALITY_CHART: true,

    ENABLE_ODS_BADGES: true,

    ENABLE_ANIMATIONS: true

  },



  /* ==================================================================
     RESPONSIVE
     ================================================================== */

  MOBILE: {

    BREAKPOINT: 768,

    USE_BOTTOM_SHEET: true

  },



  /* ==================================================================
     LOGOS
     ================================================================== */

  LOGOS: {

    MAEC:
      "assets/Logo_MAUEC_banderas.png",

    AECID:
      "assets/AECID.png",

    COOPERACION:
      "assets/Logo_Cooperacion_Espanola.png"

  }

};

export default CONFIG;