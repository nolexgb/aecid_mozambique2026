/* ==========================================================
   CONFIGURACIÓN GLOBAL
   AECID MOZAMBIQUE MAP
========================================================== */

const CONFIG = {

  APP: {
    name: "Mapa Interactivo AECID Mozambique",
    version: "2.0",
    language: "es"
  },

  DATA: {

    source: "google",

    googleSheet:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?gid=0&single=true&output=csv",

    refresh: false,

    refreshInterval: 300000

  },

  MAP: {

    center: [-18.6657,35.5296],

    zoom:5.4,

    minZoom:4,

    maxZoom:12

  },

  SEARCH:{

    placeholder:"Buscar socio o entidad...",

    minCharacters:2,

    maxResults:8

  },

  INTRO:{

    enabled:true,

    duration:3500,

    image:"assets/images/moz1.jpg"

  },

  POPUP:{

    width:620,

    glass:true,

    charts:true,

    timeline:true

  }

};

export default CONFIG;
