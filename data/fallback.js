/* ==========================================================
   DATOS LOCALES
   Utilizados únicamente cuando Google Sheets
   no responde.
========================================================== */

const FALLBACK=[

{

name:"Ámbito Nacional",

lat:-18.6657,

lng:35.5296,

projects:[

{

title:"Proyecto sanitario para garantizar la atención a pacientes con VIH avanzado",

year:2024,

partners:"CRAM Alto Maé / MISAU",

amount:480000,

modality:"Bilateral",

sector:"Salud",

ods:[3],

status:"Activo"

},

{

title:"Apoyo a capacidades de investigación",

year:2024,

partners:"Fundação Manhiça",

amount:1500000,

modality:"Bilateral",

sector:"Salud",

ods:[3,9],

status:"Activo"

}

]

},

{

name:"Maputo",

lat:-25.9692,

lng:32.5732,

projects:[

{

title:"HabitAR 6",

year:2024,

partners:"Arquitectura Sin Fronteras",

amount:1000000,

modality:"Convocatoria ONGD",

sector:"Gobernanza",

ods:[5,11],

status:"Activo"

},

{

title:"Recuperación del manglar",

year:2022,

partners:"Municipio de Maputo",

amount:476100,

modality:"Bilateral",

sector:"Medio Ambiente",

ods:[13,14,15],

status:"Finalizado"

}

]

},

{

name:"Cabo Delgado",

lat:-12.3335,

lng:39.3206,

projects:[

{

title:"Mejora del sistema de salud",

year:2022,

partners:"FAMME",

amount:1300000,

modality:"Convenio",

sector:"Salud",

ods:[3],

status:"Activo"

}

]

}

];

export default FALLBACK;
