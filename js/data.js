/**
 * Fuente de datos del mapa interactivo de proyectos.
 * Intenta cargar Google Sheets y, si falla, usa una copia local de respaldo.
 */

export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?output=csv";

export const GVIZ_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/gviz/tq";

const FALLBACK_CSV = 'ID,Ambito,Provincia,Distrito,Localidad,Latitud,Longitud,Proyecto,Año,Socios,Sector,Subsector,Importe_EUR,Modalidad,Estado,ODS,Beneficiarios,Visible_mapa\r\n1,Ámbito Nacional,Nacional,,,"-18,6657","35,5296","Proyecto sanitario para garantizar la atención a pacientes con VIH avanzado en el CRAM Alto Maé, Maputo",2024,CRAM Alto Maé / MISAU,Salud,VIH avanzado,"480.000,00 €",Bilateral sectorial,En ejecución,ODS 3,,Sí\r\n2,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Apoyo a las capacidades de investigación en el sector de la salud en Mozambique,2024,Fundação Manhiça,Salud,Investigación en salud,"1.500.000,00 €",Bilateral,En ejecución,ODS 3,,Sí\r\n3,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Programa para el refuerzo de capacidades profesionales del sector marítimo-pesquero de Mozambique,2024,AMARC,Pesca y economía azul,Formación profesional,"146.000,00 €",Bilateral,En ejecución,ODS 8,,Sí\r\n4,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Fondo Común PROSAÚDE III,2024,MISAU,Salud,Sistema nacional de salud,"500.000,00 €",Bilateral sectorial,En ejecución,ODS 3,,Sí\r\n5,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Fortalecimiento de capacidades del Sistema Nacional de Salud mozambiqueño para formación de médicos especialistas,2024,ISCISA,Salud,Formación médica,"500.000,00 €",Bilateral sectorial,En ejecución,ODS 3,,Sí\r\n6,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Refuerzo del Sistema Nacional de Salud mozambiqueño frente a la crisis sanitaria COVID-19,2022,MISAU,Salud,COVID-19,"500.000,00 €",Bilateral,Finalizado,ODS 3,,Sí\r\n7,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Apoyo al fortalecimiento de capacidades de investigación en salud en Mozambique,2022,CISM,Salud,Investigación en salud,"1.500.000,00 €",Bilateral,Finalizado,ODS 3,,Sí\r\n8,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Viabilizar el impacto de la investigación clínica en la calidad de la asistencia sanitaria,2025,INS,Salud,Investigación clínica,"700.000,00 €",Bilateral,En ejecución,ODS 3,,Sí\r\n9,Ámbito Nacional,Nacional,,,"-18,6657","35,5296",Refuerzo de capacidades del sistema público mozambiqueño de enseñanza técnico profesional en TIC e innovación,2025,ANEP,Educación y empleo,TIC e innovación,"300.000,00 €",Bilateral,En ejecución,ODS 4,,Sí\r\n10,Gaza,Gaza,Chicualacuala,,"-23,0222","32,7181",Fortalecer y diversificar medios de vida sostenibles de cinco comunidades del distrito de Chicualacuala,2021,CIC-Batá,Desarrollo rural,Medios de vida,"500.693,00 €",Convocatoria ONGD,Finalizado,ODS 2,,Sí\r\n11,Gaza,Gaza,,,"-23,0222","32,7181",Promoción del acceso de la juventud a la formación profesional con enfoque de género,2024,Madre Coraje / Asociación Kulima,Educación y empleo,Formación profesional,"600.000,00 €",Convocatoria ONGD,En ejecución,ODS 4,,Sí\r\n12,Gaza,Gaza,,,"-23,0222","32,7181",Mejora del acceso y calidad de la formación profesional de colectivos vulnerables de cuatro distritos de Gaza,2023,Madre Coraje,Educación y empleo,Formación profesional,"800.000,00 €",Convocatoria ONGD,En ejecución,ODS 4,,Sí\r\n13,Gaza,Gaza,,,"-23,0222","32,7181",Fomento de los derechos económicos de mujeres supervivientes de violencia de género en Gaza,2023,FEPF / AIPCC,Género,Autonomía económica,"573.332,00 €",Convocatoria ONGD,En ejecución,ODS 5,,Sí\r\n14,Maputo,Maputo,,Maputo,"-25,9692","32,5732",Recuperación y conservación del manglar en el Municipio de Maputo,2022,Municipio de Maputo,Medio ambiente,Manglar,"476.100,00 €",Bilateral sectorial,Finalizado,ODS 13,,Sí\r\n15,Maputo,Maputo,,Maputo,"-25,9692","32,5732",Proyecto de apoyo para la evaluación de la colección fílmica del Instituto Nacional de las Industrias Culturales y Creativas,2025,INICC,Cultura,Patrimonio fílmico,"123.192,50 €",Bilateral cultural,En ejecución,ODS 11,,Sí\r\n16,Maputo,Maputo,,,"-25,9692","32,5732",Innovación y desarrollo de la cadena de valor de la moringa para la agricultura familiar comunitaria,2021,Enraíza,Desarrollo rural,Moringa,"623.656,00 €",Innovación,Finalizado,ODS 2,,Sí\r\n17,Maputo,Maputo,Magude,,"-25,9692","32,5732",Mejora de la seguridad alimentaria y nutrición en población vulnerable de Magude,2025,ONGAWA,Seguridad alimentaria,Nutrición,"900.798,00 €",Convocatoria ONGD,En ejecución,ODS 2,,Sí\r\n18,Maputo,Maputo,,Maputo,"-25,9692","32,5732",HabitAR 6: contribuir al derecho a la ciudad con énfasis en mujeres e infancia,2024,ASF,Hábitat y ciudad,Derecho a la ciudad,"1.000.000,00 €",Convocatoria ONGD,En ejecución,ODS 11,,Sí\r\n19,Inhambane,Inhambane,,,"-23,8650","35,3833",Formación profesional de calidad para la inserción laboral de la juventud más vulnerable,2022,Jóvenes y Desarrollo,Educación y empleo,Inserción laboral,"3.000.000,00 €",Convenio,En ejecución,ODS 4,,Sí\r\n20,Inhambane,Inhambane,,,"-23,8650","35,3833",Fomento de vida libre de violencia contra mujeres mediante refuerzo de liderazgo y autonomía económica,2023,APS,Género,Violencia de género,"356.000,00 €",Convocatoria ONGD,En ejecución,ODS 5,,Sí\r\n21,Zambézia,Zambézia,,,"-16,5639","36,6094",Promoción de la economía circular basada en el bambú para creación de empleo y adaptación climática en Etiopia y Mozambique,2025,INBAR,Medio ambiente,Economía circular,"790.000,00 €",Bilateral sectorial,En ejecución,ODS 13,,Sí\r\n22,Cabo Delgado,Cabo Delgado,,,"-12,3335","39,3206",Apoyo a la capacitación para la gobernanza descentralizada e inclusiva en Cabo Delgado,2023,SEPF de Cabo Delgado,Gobernanza,Descentralización,"800.000,00 €",Bilateral,En ejecución,ODS 16,,Sí\r\n23,Cabo Delgado,Cabo Delgado,,,"-12,3335","39,3206",Fortalecimiento de la participación de las mujeres en espacios de decisión política,2021,SEPF / GDE,Género,Participación política,"100.000,00 €",Bilateral,Finalizado,ODS 5,,Sí\r\n24,Cabo Delgado,Cabo Delgado,,,"-12,3335","39,3206",Fortalecimiento de RRHH del sector salud de Cabo Delgado mediante formación técnica,2024,SEPF / CPD,Salud,Recursos humanos,"214.950,00 €",Bilateral,En ejecución,ODS 3,,Sí\r\n25,Cabo Delgado,Cabo Delgado,,,"-12,3335","39,3206","Mejora de la calidad, cobertura y resiliencia del sistema de salud de Cabo Delgado",2022,FAMME,Salud,Sistema de salud,"1.300.000,00 €",Convenio,En ejecución,ODS 3,,Sí\r\n26,Niassa y Cabo Delgado,Niassa / Cabo Delgado,,,"-13,5000","37,8000",Fase III: mejora de la seguridad alimentaria de familias de Niassa y Cabo Delgado,2025,Mundukide,Seguridad alimentaria,Agricultura familiar,"600.000,00 €",Convocatoria ONGD,En ejecución,ODS 2,,Sí\r\n27,Niassa y Cabo Delgado,Niassa / Cabo Delgado,,,"-13,5000","37,8000",Mejorar la seguridad alimentaria de campesinos de Niassa y Cabo Delgado,2023,Mundukide,Seguridad alimentaria,Agricultura familiar,"534.932,00 €",Convocatoria ONGD,En ejecución,ODS 2,,Sí\r\n28,ONGD Región Norte y Sur,Norte / Sur,,,"-19,5000","33,5000",Sistemas de teledetección agroclimática para una agricultura resiliente y de precisión en Mozambique,2024,CESAL / Universidad de Córdoba,Innovación,Teledetección agroclimática,"600.000,00 €",Innovación,En ejecución,ODS 13,,Sí\r\n';

export async function loadRawProjectsCsv() {
  try {
    return await fetchCsvWithTimeout(SHEET_URL, 3500);
  } catch (csvError) {
    console.warn("No se pudo cargar el CSV publicado. Intentando Google Visualization API...", csvError);
  }

  try {
    return await loadGvizAsCsv(GVIZ_URL, 2500);
  } catch (gvizError) {
    console.warn("No se pudo cargar Google Visualization API. Usando datos locales de respaldo.", gvizError);
    return FALLBACK_CSV;
  }
}

async function fetchCsvWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text || !text.includes("Proyecto")) {
      throw new Error("La respuesta no parece contener la tabla de proyectos.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function loadGvizAsCsv(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const callbackName = `__aecidMozGviz_${Date.now()}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    let timeout;

    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};

    const previousHandler = window.google.visualization.Query.setResponse;

    function cleanup() {
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];

      if (previousHandler) {
        window.google.visualization.Query.setResponse = previousHandler;
      } else if (window.google?.visualization?.Query) {
        delete window.google.visualization.Query.setResponse;
      }
    }

    window[callbackName] = response => {
      try {
        cleanup();
        resolve(gvizResponseToCsv(response));
      } catch (error) {
        reject(error);
      }
    };

    window.google.visualization.Query.setResponse = window[callbackName];

    timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Tiempo de espera agotado cargando Google Visualization API."));
    }, timeoutMs);

    script.onerror = () => {
      cleanup();
      reject(new Error("Error cargando el script de Google Visualization API."));
    };

    script.src = `${url}${separator}tqx=out:json`;
    document.head.appendChild(script);
  });
}

function gvizResponseToCsv(response) {
  if (!response || !response.table || !Array.isArray(response.table.cols)) {
    throw new Error("Respuesta GViz inválida.");
  }

  const headers = response.table.cols.map((col, index) => col.label || col.id || `Columna_${index + 1}`);
  const rows = (response.table.rows || []).map(row =>
    headers.map((_, index) => {
      const cell = row.c?.[index];
      return cell?.f ?? cell?.v ?? "";
    })
  );

  const csvRows = [headers, ...rows];
  return csvRows.map(row => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
