/* ==========================================================================
   GUTIC — Gestión de Mantenimiento de Redes y Comunicaciones Unificadas
   Policía Nacional de Colombia
   Aplicación de un solo archivo. Base de datos: Excel vinculado por el usuario.
   ========================================================================== */

/* ------------------------------- paleta ---------------------------------- */
const T = {
  grafito: "#0D1620", grafito2: "#152234", grafito3: "#1E3049",
  teal: "#0F6E64", teal2: "#12897C", cian: "#22C1B4",
  oro: "#C9A227", oro2: "#E0BE52",
  bg: "#EEF1F4", panel: "#FFFFFF", ink: "#101820", muted: "#65727F", line: "#D7DDE4",
  ok: "#1E8E5A", info: "#2C6FA8", warn: "#C98A16", bad: "#C0392B", off: "#8E9AA6",
};

const SEM = {
  resuelto: { l: "Resuelto", c: T.ok },
  tiempo: { l: "En tiempo", c: T.info },
  porvencer: { l: "Por vencer", c: T.warn },
  vencido: { l: "Vencido", c: T.bad },
};
const ORDEN = ["vencido", "porvencer", "tiempo", "resuelto"];

/* ------------------------------ catálogos -------------------------------- */
/* Los de abajo son los valores de partida. Cuatro de ellos —tipo de actividad,
   categoría técnica, estado y tipo de solución— pasaron a ser catálogos
   editables desde el formulario: con estos valores se siembra la hoja
   Catálogos del Excel la primera vez, y de ahí en adelante manda el Excel.   */
const CAT = {
  tipo_req: ["Ticket de soporte", "Comunicado oficial", "Actividad propia", "Mantenimiento programado",
    "Apoyo a evento", "Revista", "Revista de radios"],
  medio: ["Formulario", "Correo", "GEPOL", "Telefónico", "Presencial", "Teams", "WhatsApp"],
  prioridad: ["Crítica", "Alta", "Media", "Baja"],
  categoria: ["Conectividad", "Equipo activo", "Cableado estructurado", "UPS y energía",
    "Telefonía IP", "Punto de red", "Rack de comunicaciones", "Servidor",
    "Radiocomunicaciones", "CCTV y videovigilancia", "Red inalámbrica",
    "Enlace WAN", "Control de acceso", "Otro"],
  estado_ticket: ["Nuevo", "Asignado", "En proceso", "En espera de tercero", "Resuelto", "Cerrado"],
  tipo_solucion: ["Atención en sitio", "Atención remota", "Configuración", "Reemplazo de elemento",
    "Reinicio de servicio", "Escalado a proveedor", "Sin falla encontrada", "Capacitación al usuario"],
  tipo_elemento: ["Switch", "Router", "Access Point", "Firewall", "UPS", "Rack de comunicaciones",
    "Patch panel", "Punto de red", "Planta telefónica", "Teléfono IP", "Servidor", "Tablero eléctrico",
    "Repetidora de radio", "Radio base", "Radio móvil", "Radio portátil", "Antena", "Fuente de radio",
    "Cámara IP", "Cámara análoga", "Grabador NVR", "Grabador DVR", "Inyector PoE", "Monitor de videovigilancia",
    "Control de acceso", "Otro"],
  estado_op: ["Operativo", "Degradado", "Fuera de servicio", "En mantenimiento", "Dado de baja"],
  periodicidad: ["Mensual", "Trimestral", "Semestral", "Anual", "No aplica"],
  criticidad: ["Alta", "Media", "Baja"],
  tipo_mtto: ["Preventivo", "Correctivo", "Predictivo", "Instalación", "Desmonte", "Reubicación"],
  resultado_mtto: ["Conforme", "Con observaciones", "No conforme", "Requiere reemplazo"],
  tipo_inspeccion: ["UPS y energía", "Rack de comunicaciones", "Cableado estructurado",
    "Equipo activo", "Tablero eléctrico", "Sistema de radiocomunicación",
    "CCTV y videovigilancia", "Red inalámbrica"],
  conforme: ["Conforme", "No conforme", "No aplica"],
  resultado_evento: ["Sin novedad", "Con novedad menor", "Con afectación", "Programado"],
  estado_evento: ["Programado", "En alistamiento", "En ejecución", "Finalizado", "Cancelado"],
  /* Modelos de partida para la revista de radios. Es una lista más: el usuario
     agrega los que le falten con «+ Otro» igual que en cualquier otro campo.  */
  modelo_radio: ["Motorola APX8000", "Motorola APX6000", "Motorola APX4000", "Motorola XPR 7550",
    "Motorola XPR 3300", "Motorola DP4400", "Motorola DP2400", "Kenwood NX-5200", "Hytera PD785",
    "Repetidora o base"],
};

/* ------------------------- revistas de equipos ---------------------------- */
/* Una revista es un recorrido de verificación a los equipos de TI. Se registra
   dentro de Tickets como un tipo de actividad, pero necesita muy pocos campos
   y, sobre todo, fotos: quien la pasa va con el celular en la mano.
   Al elegir «Revista» el formulario deja únicamente estos campos y esconde
   todo lo demás. No los borra: si vuelve a cambiar el tipo, siguen ahí.      */
const ACTIVIDAD_REVISTA = "Revista";
const CAMPOS_REVISTA = ["tipo_req", "sede", "categoria", "descripcion",
  "fecha_revista", "estado", "tipo_solucion", "accion", "atendido_por", "fotos"];
/* Campos que solo tienen sentido en una revista y se esconden en los demás
   tipos de actividad.                                                        */
const SOLO_REVISTA = ["fecha_revista", "fotos"];

/* Fotos. La miniatura es la que viaja dentro del Excel y la que se imprime en
   el informe; el original se conserva aparte, sin recomprimir. A 1200 px de
   lado mayor una foto impresa a 9 cm queda por encima de los 300 puntos por
   pulgada, que es de sobra para identificar un equipo en un informe.         */
const FOTOS_MAX = 5;
const FOTO_LADO = 1200;
const FOTO_CALIDAD = 0.8;
/* El límite de una celda de Excel son 32.767 caracteres, y una miniatura en
   base64 pesa bastante más. Por eso cada foto se guarda partida en trozos, en
   su propia hoja, y se vuelve a unir al leer.                                */
const FOTO_TROZO = 30000;
const HOJA_FOTOS = "Revista-Fotos";

/* Revista de radios: se registra igual que una revista de equipos —dentro de
   Tickets, como otro tipo de actividad—, pero el formato físico que ya se usa
   en la dependencia trae sus propios campos y exige tres fotografías fijas
   por radio, no un álbum libre. Un registro es un radio revisado; si en una
   misma salida se revisan varios, se guarda un registro por cada uno, igual
   que ya se hace con la revista de equipos.                                 */
const ACTIVIDAD_REVISTA_RADIO = "Revista de radios";
const CAMPOS_REVISTA_RADIO = ["tipo_req", "modelo_radio", "serial_radio", "responsable_radio",
  "ticket_sigma", "sede", "novedades_radio", "fotos_radio"];
const SOLO_REVISTA_RADIO = ["modelo_radio", "serial_radio", "responsable_radio",
  "ticket_sigma", "novedades_radio", "fotos_radio"];
/* Las tres fotos del formato físico: radio completo, su serial y la lectura
   del serial con el software de programación. El orden es el de la hoja de
   verificación y es el mismo en que se imprime el informe.                   */
const SLOTS_FOTO_RADIO = [
  { clave: "completo", etiqueta: "Fotografía radio completo" },
  { clave: "serial", etiqueta: "Foto serial de radio" },
  { clave: "lectura", etiqueta: "Lectura serie de radio con software" },
];
const HOJA_FOTOS_RADIO = "Revista-Radios-Fotos";

/* Campos que quedan fuera del sello de integridad. Son los agregados después
   de la versión 1.2: si entraran en el cálculo, cualquier Excel creado con una
   versión anterior daría una falsa alarma de manipulación la primera vez que
   se abriera con esta.                                                       */
const FUERA_SELLO = ["fecha_revista", "fotos", "modelo_radio", "serial_radio",
  "responsable_radio", "ticket_sigma", "novedades_radio", "fotos_radio"];

/* Acuerdos de nivel de servicio, en horas. Propuesta base: debe aprobarla la
   jefatura antes de publicarse, porque compromete a la dependencia.          */
const ANS = {
  "Crítica": { respuesta: 0.25, solucion: 4 },
  "Alta": { respuesta: 1, solucion: 8 },
  "Media": { respuesta: 4, solucion: 72 },
  "Baja": { respuesta: 24, solucion: 240 },
};

/* --------------------------- definición de módulos ------------------------ */
/* Cada módulo declara sus campos y de ahí salen el formulario, la tabla y la
   hoja de Excel. Agregar un campo es agregar una línea en este arreglo.      */
const M = {
  tickets: {
    id: "tickets", hoja: "Tickets", prefijo: "GUTIC", icono: "◈",
    titulo: "Tickets de soporte", singular: "ticket",
    campos: [
      ["consecutivo", "Consecutivo", "auto", 16],
      ["fecha_registro", "Fecha y hora de registro", "auto", 22],
      /* `alias` mantiene la compatibilidad con los Excel ya creados: la columna
         cambió de nombre, pero al leer se sigue reconociendo la anterior.     */
      ["tipo_req", "Tipo de actividad", "lista:tipos_actividad", 24, { req: 1, alias: ["Tipo de requerimiento"] }],
      ["medio", "Medio de recepción", "select:medio", 20],
      ["radicado", "Radicado o consecutivo externo", "texto", 24],
      ["solicitante", "Solicitante", "lista:solicitantes", 26],
      ["dependencia", "Dependencia solicitante", "lista:dependencias", 26],
      ["sede", "Sede o ubicación", "lista:sedes", 24],
      ["categoria", "Categoría técnica", "lista:categorias", 24, { req: 1 }],
      ["prioridad", "Prioridad", "select:prioridad", 12, { req: 1 }],
      ["asunto", "Asunto", "texto", 38, { req: 1, full: 1 }],
      ["descripcion", "Descripción", "largo", 48, { full: 1, alias: ["Descripción del requerimiento"] }],
      ["fecha_revista", "Fecha", "fecha", 16],
      ["equipo", "Equipo asociado", "ref:infraestructura", 26],
      ["estado", "Estado", "lista:estados", 18],
      ["fecha_compromiso", "Fecha compromiso", "auto", 22],
      ["fecha_solucion", "Fecha de solución", "fecha", 18],
      ["tipo_solucion", "Tipo de solución", "lista:tipos_solucion", 24],
      ["accion", "Acción ejecutada", "largo", 48, { full: 1 }],
      ["atendido_por", "Atendido por", "lista:tecnicos", 24],
      ["fotos", "Fotos", "fotos", 14],
      /* Propios de la revista de radios; se esconden en cualquier otro tipo
         de actividad, igual que fecha_revista y fotos lo hacen para la
         revista de equipos.                                                 */
      ["modelo_radio", "Tipo y modelo de radio", "lista:modelos_radio", 24, { req: 1 }],
      ["serial_radio", "Serial", "texto", 18, { req: 1 }],
      ["responsable_radio", "Responsable", "texto", 28],
      ["ticket_sigma", "Número de ticket SIGMA", "texto", 22],
      ["novedades_radio", "Novedades", "largo", 40, { full: 1 }],
      ["fotos_radio", "Fotos del radio", "fotos_radio", 14],
      ["registrado_por", "Registrado por", "auto", 24],
      ["modificado", "Última modificación", "auto", 26],
    ],
  },
  infraestructura: {
    id: "infraestructura", hoja: "Infraestructura", prefijo: "INF", icono: "▤",
    titulo: "Infraestructura", singular: "elemento",
    campos: [
      ["consecutivo", "Consecutivo", "auto", 14],
      ["codigo", "Código de identificación", "texto", 22, { req: 1 }],
      ["tipo_elemento", "Tipo de elemento", "select:tipo_elemento", 22, { req: 1 }],
      ["marca", "Marca", "texto", 18],
      ["modelo", "Modelo", "texto", 20],
      ["serie", "Número de serie", "texto", 22],
      ["sede", "Sede", "lista:sedes", 22, { req: 1 }],
      ["ubicacion", "Ubicación física", "texto", 30, { full: 1 }],
      ["ip", "Dirección IP", "texto", 16],
      ["vlan", "VLAN", "texto", 12],
      ["estado_op", "Estado operativo", "select:estado_op", 18, { req: 1 }],
      ["criticidad", "Criticidad", "select:criticidad", 12],
      ["fecha_instalacion", "Fecha de instalación", "fecha", 18],
      ["garantia", "Garantía hasta", "fecha", 16],
      ["periodicidad", "Periodicidad de mantenimiento", "select:periodicidad", 24],
      ["ultimo_mtto", "Último mantenimiento", "fecha", 20],
      ["proximo_mtto", "Próximo mantenimiento", "fecha", 20],
      ["observaciones", "Observaciones", "largo", 40, { full: 1 }],
      ["registrado_por", "Registrado por", "auto", 24],
      ["modificado", "Última modificación", "auto", 26],
    ],
  },
  mantenimientos: {
    id: "mantenimientos", hoja: "Mantenimientos", prefijo: "MTTO", icono: "⚙",
    titulo: "Mantenimientos", singular: "mantenimiento",
    campos: [
      ["consecutivo", "Consecutivo", "auto", 16],
      ["equipo", "Equipo", "ref:infraestructura", 28, { req: 1 }],
      ["tipo_mtto", "Tipo de mantenimiento", "select:tipo_mtto", 22, { req: 1 }],
      ["fecha_programada", "Fecha programada", "fecha", 18, { req: 1 }],
      ["fecha_ejecutada", "Fecha de ejecución", "fecha", 18],
      ["actividades", "Actividades realizadas", "largo", 48, { full: 1 }],
      ["repuestos", "Repuestos o materiales", "largo", 34, { full: 1 }],
      ["tiempo", "Tiempo empleado (minutos)", "numero", 22],
      ["resultado", "Resultado", "select:resultado_mtto", 22],
      ["ejecutado_por", "Ejecutado por", "lista:tecnicos", 24],
      ["estado", "Estado", "select:estado_ticket", 18],
      ["registrado_por", "Registrado por", "auto", 24],
      ["modificado", "Última modificación", "auto", 26],
    ],
  },
  inspecciones: {
    id: "inspecciones", hoja: "Inspecciones", prefijo: "INSP", icono: "☑",
    titulo: "Inspecciones", singular: "inspección",
    campos: [
      ["consecutivo", "Consecutivo", "auto", 16],
      ["fecha", "Fecha de inspección", "fecha", 18, { req: 1 }],
      ["tipo_inspeccion", "Tipo de inspección", "select:tipo_inspeccion", 24, { req: 1 }],
      ["equipo", "Elemento inspeccionado", "ref:infraestructura", 28],
      ["sede", "Sede", "lista:sedes", 22],
      ["checklist", "Verificaciones", "checklist", 60, { full: 1 }],
      ["hallazgos", "Hallazgos", "largo", 48, { full: 1 }],
      ["accion_correctiva", "Acción correctiva requerida", "largo", 44, { full: 1 }],
      ["resultado", "Resultado general", "select:resultado_mtto", 22],
      ["inspeccionado_por", "Inspeccionado por", "lista:tecnicos", 24],
      ["registrado_por", "Registrado por", "auto", 24],
      ["modificado", "Última modificación", "auto", 26],
    ],
  },
  eventos: {
    id: "eventos", hoja: "Eventos", prefijo: "EVT", icono: "★",
    titulo: "Eventos institucionales", singular: "evento",
    campos: [
      ["consecutivo", "Consecutivo", "auto", 14],
      ["nombre", "Nombre del evento", "texto", 34, { req: 1, full: 1 }],
      ["fecha_evento", "Fecha del evento", "fecha", 18, { req: 1 }],
      ["hora", "Hora de inicio", "texto", 14],
      ["lugar", "Lugar", "texto", 30],
      ["dependencia", "Dependencia solicitante", "lista:dependencias", 26],
      ["servicios", "Servicios requeridos", "largo", 40, { full: 1 }],
      ["requerimientos", "Requerimientos técnicos", "largo", 48, { full: 1 }],
      ["personal", "Personal asignado", "lista:tecnicos", 26],
      ["estado", "Estado", "select:estado_evento", 20],
      ["novedades", "Novedades durante el evento", "largo", 48, { full: 1 }],
      ["resultado", "Resultado", "select:resultado_evento", 22],
      ["registrado_por", "Registrado por", "auto", 24],
      ["modificado", "Última modificación", "auto", 26],
    ],
  },
};
const MODULOS = ["tickets", "infraestructura", "mantenimientos", "inspecciones", "eventos"];

/* Listas de verificación por tipo de inspección. Redactadas a partir de las
   prácticas usuales de administración de infraestructura; contrástelas con la
   norma institucional y con el manual del fabricante antes de oficializarlas. */
const CHECKLIST = {
  "UPS y energía": [
    "Nivel de carga y autonomía estimada",
    "Estado y antigüedad del banco de baterías",
    "Temperatura del gabinete y ventilación",
    "Ausencia de alarmas activas en el panel",
    "Prueba de transferencia a respaldo registrada",
    "Conexión a tierra verificada",
    "Bornes sin sulfatación ni sobrecalentamiento",
  ],
  "Rack de comunicaciones": [
    "Orden y amarre del cableado interno",
    "Etiquetado de puertos y patch cords",
    "Ventilación, filtros y temperatura",
    "Puertas, chapas y aseguramiento físico",
    "Aseo interno y ausencia de material ajeno",
    "Organizadores y bandejas completas",
    "Tomas eléctricas del rack en buen estado",
  ],
  "Cableado estructurado": [
    "Estado físico de patch cords y canaletas",
    "Etiquetado en ambos extremos",
    "Radios de curvatura respetados",
    "Separación frente a acometidas eléctricas",
    "Certificación de enlaces vigente",
    "Ausencia de empalmes improvisados",
  ],
  "Equipo activo": [
    "Estado de LED y puertos en uso",
    "Versión de firmware verificada",
    "Respaldo de configuración actualizado",
    "Temperatura y ventilación adecuadas",
    "Registro de alarmas o reinicios revisado",
    "Puertos libres disponibles documentados",
  ],
  "Tablero eléctrico": [
    "Breakers rotulados e identificados",
    "Mediciones de tensión dentro de rango",
    "Puesta a tierra verificada",
    "Ausencia de sobrecalentamiento en bornes",
    "Tablero cerrado y con acceso restringido",
  ],
  "Sistema de radiocomunicación": [
    "Prueba de comunicación en todos los canales autorizados",
    "Potencia de salida y ROE dentro de lo esperado",
    "Estado físico de antena, cable coaxial y conectores",
    "Aterrizaje y protector contra descargas del sistema radiante",
    "Fuente de alimentación y baterías de respaldo con carga",
    "Ventilación del gabinete y temperatura de la repetidora",
    "Inventario de portátiles y móviles asignados, con su batería",
    "Programación vigente y coincidente con el plan de frecuencias",
    "Licencia o permiso de uso del espectro vigente",
  ],
  "CCTV y videovigilancia": [
    "Todas las cámaras en línea en el grabador",
    "Encuadre de cada cámara conforme a lo acordado",
    "Nitidez de día y de noche, sin halo ni telarañas",
    "Limpieza del domo o la carcasa",
    "Fecha y hora del grabador sincronizadas",
    "Días de retención verificados contra lo exigido",
    "Estado de los discos y alarmas del grabador",
    "Grabador y monitor con energía respaldada",
    "Acceso al sistema restringido y con usuarios vigentes",
    "Cableado, inyectores PoE y fuentes en buen estado",
  ],
  "Red inalámbrica": [
    "Puntos de acceso en línea y con su etiqueta",
    "Fijación, orientación y estado físico del equipo",
    "Alimentación PoE estable en el switch",
    "Firmware del punto de acceso verificado",
    "Canales y potencia sin superposición con vecinos",
    "Cobertura medida en las áreas de uso",
    "SSID publicados conforme a lo autorizado",
    "Cifrado y método de autenticación correctos",
  ],
};

/* Base de conocimiento inicial del asistente. Se amplía desde la aplicación y
   se guarda en la hoja Conocimiento del Excel.                              */
const CONOCIMIENTO_BASE = [
  {
    titulo: "Un piso o área completa sin conectividad",
    categoria: "Conectividad",
    sintomas: "sin red, sin internet, piso caido, area sin conexion, nadie tiene red",
    descarte: "¿El switch del rack enciende? ¿Hay enlace en el puerto de uplink? ¿La UPS del rack está en línea o en bypass? ¿Ocurrió después de un corte de energía?",
    causa: "Uplink caído, falla de energía en el rack, bucle de capa 2 o switch bloqueado.",
    procedimiento: "1. Verificar LED de estado y de puertos del switch.\n2. Revisar la UPS del rack y el tablero eléctrico asociado.\n3. Conectarse por consola y revisar el estado de las interfaces.\n4. Verificar VLAN del puerto de uplink y estado de spanning tree.\n5. Si hay bucle, aislar el puerto implicado y notificar al usuario.",
    comandos: "show interfaces status\nshow interface gi0/1 | include line protocol\nshow spanning-tree blockedports\nshow vlan brief\nshow logging | last 50",
    escalar: "Si el switch no responde por consola o presenta falla de hardware confirmada, escalar a proveedor con el número de serie y el registro de alarmas.",
  },
  {
    titulo: "Configuración inicial de un switch de acceso",
    categoria: "Equipo activo",
    sintomas: "configurar switch, switch nuevo, instalacion switch, configuracion inicial",
    descarte: "¿El equipo es nuevo o viene de otra sede? ¿Se cuenta con el direccionamiento y la VLAN asignada? ¿Hay respaldo de la configuración anterior?",
    causa: "No aplica. Procedimiento de instalación.",
    procedimiento: "1. Conectar por consola y verificar que no tenga configuración previa.\n2. Asignar nombre según el estándar de etiquetado de la dependencia.\n3. Configurar la VLAN de administración y su dirección IP.\n4. Establecer contraseñas de consola y acceso remoto cifrado.\n5. Configurar el puerto de uplink como troncal con las VLAN permitidas.\n6. Asignar las VLAN de acceso a los puertos de usuario.\n7. Habilitar la protección contra bucles en puertos de usuario.\n8. Sincronizar la hora con el servidor institucional.\n9. Guardar la configuración y registrar el respaldo.\n10. Crear la hoja de vida del equipo en el módulo Infraestructura.",
    comandos: "enable\nconfigure terminal\nhostname SW-ACC-01\nvlan 10\n name ADMINISTRACION\ninterface vlan 10\n ip address 10.0.10.2 255.255.255.0\n no shutdown\nip default-gateway 10.0.10.1\ninterface gi0/1\n description UPLINK\n switchport mode trunk\ninterface range gi0/2-24\n switchport mode access\n switchport access vlan 20\n spanning-tree portfast\n spanning-tree bpduguard enable\nntp server 10.0.0.10\nend\nwrite memory",
    escalar: "Los valores del ejemplo son ilustrativos. Use el direccionamiento, las VLAN y el estándar de nombres aprobados por la dependencia. La sintaxis exacta depende del fabricante y de la versión del sistema operativo del equipo.",
  },
  {
    titulo: "UPS en alarma o con autonomía reducida",
    categoria: "UPS y energía",
    sintomas: "ups pitando, alarma ups, ups sin bateria, ups en bypass, respaldo electrico",
    descarte: "¿La alarma es sonora o visual? ¿Hay energía en la acometida? ¿Cuántos años tiene el banco de baterías? ¿La carga conectada aumentó recientemente?",
    causa: "Baterías al final de su vida útil, sobrecarga, falla de la acometida o del bypass.",
    procedimiento: "1. Identificar el código de alarma en el panel y consultarlo en el manual.\n2. Verificar tensión de entrada en el tablero.\n3. Revisar la carga conectada y compararla con la capacidad nominal.\n4. Consultar la fecha de instalación del banco de baterías.\n5. Registrar el hallazgo en el módulo Inspecciones.\n6. Si la autonomía es insuficiente, gestionar el cambio de baterías.",
    comandos: "No aplica. Verificación física y por panel del equipo.",
    escalar: "Nunca manipule baterías ni tableros sin la protección y la autorización correspondientes. El reemplazo del banco lo debe ejecutar personal certificado.",
  },
  {
    titulo: "Punto de red individual sin servicio",
    categoria: "Punto de red",
    sintomas: "un punto sin red, toma de red no funciona, un equipo sin internet, cable no da",
    descarte: "¿Otros equipos en la misma oficina tienen servicio? ¿El equipo funciona en otro punto? ¿El patch cord está en buen estado? ¿El punto está etiquetado?",
    causa: "Patch cord dañado, puerto del switch deshabilitado, punto sin patcheo en el rack o cableado en mal estado.",
    procedimiento: "1. Probar con un patch cord conocido en buen estado.\n2. Probar el equipo del usuario en otro punto para descartar la tarjeta de red.\n3. Ubicar el punto en el patch panel según el etiquetado.\n4. Verificar que el puerto del switch esté habilitado y en la VLAN correcta.\n5. Si no hay continuidad, certificar el enlace con el equipo de medición.\n6. Registrar el resultado en la hoja de vida del punto.",
    comandos: "show interface gi0/12 status\nshow mac address-table interface gi0/12\nconfigure terminal\ninterface gi0/12\n no shutdown",
    escalar: "Si la certificación del enlace falla, se requiere reposición del cableado. Gestionar con el área de infraestructura física.",
  },
  {
    titulo: "Alistamiento de conectividad para un evento institucional",
    categoria: "Conectividad",
    sintomas: "evento, ceremonia, feria, alistamiento, apoyo evento, transmision",
    descarte: "¿Cuántos usuarios simultáneos se esperan? ¿Se requiere transmisión en vivo? ¿El lugar tiene cobertura inalámbrica y energía respaldada?",
    causa: "No aplica. Procedimiento de alistamiento.",
    procedimiento: "1. Visitar el lugar con anticipación y levantar el requerimiento técnico.\n2. Verificar cobertura inalámbrica y capacidad de los puntos de acceso.\n3. Confirmar disponibilidad de puntos de red y energía respaldada.\n4. Probar el ancho de banda si hay transmisión en vivo.\n5. Alistar equipos de contingencia: switch portátil, patch cords, extensiones.\n6. Registrar el alistamiento en el módulo Eventos.\n7. Durante el evento, dejar constancia de novedades en la bitácora del registro.",
    comandos: "No aplica.",
    escalar: "Si el evento supera la capacidad instalada, solicitar por escrito y con anticipación la ampliación temporal del servicio.",
  },
];

/* Ampliación de la versión 1.3: radiocomunicaciones, videovigilancia y más
   procedimientos de red. Se mantiene aparte para poder incorporarla a los
   archivos creados con versiones anteriores sin tocar lo que el usuario ya
   haya escrito en su propia base de conocimiento.                           */
const CONOCIMIENTO_13 = [
  /* ------------------------- radiocomunicaciones ------------------------- */
  {
    titulo: "Radio portátil que no comunica con la repetidora",
    categoria: "Radiocomunicaciones",
    sintomas: "radio no comunica, no sale por el repetidor, no me escuchan, portatil mudo, sin senal radio",
    descarte: "¿El radio transmite en directo con otro portátil cercano? ¿Otros radios sí salen por la repetidora desde el mismo sitio? ¿Está en el canal y la zona correctos? ¿La batería está por encima de media carga?",
    causa: "Canal o zona equivocados, tono de subtono mal programado, batería agotada, antena suelta o dañada, o el usuario está fuera de cobertura.",
    procedimiento: "1. Confirmar el canal y la zona con el plan de frecuencias autorizado.\n2. Probar comunicación directa (simplex) con otro portátil a pocos metros: si funciona, el radio transmite y el problema es de enlace con la repetidora.\n3. Revisar que la antena esté bien enroscada y sin golpes; probar con una antena conocida.\n4. Cambiar la batería por una cargada y repetir la prueba.\n5. Verificar el subtono o el color de código de la repetidora contra la plantilla de programación.\n6. Repetir la prueba desde un sitio despejado para descartar sombra de cobertura.\n7. Si nada de lo anterior corrige, reprogramar el radio con la plantilla vigente.\n8. Registrar el número de serie y el resultado en la hoja de vida del equipo.",
    comandos: "No aplica: la verificación es física y de programación.\nEn el software de programación: leer el radio, comparar canal, frecuencia de transmisión y recepción, subtono o color de código, y potencia.",
    escalar: "Si varios radios fallan desde el mismo sector, el problema no es del portátil: pasar al procedimiento de la repetidora. Si el radio no lee ni escribe por cable, escalar a mantenimiento del proveedor con número de serie.",
  },
  {
    titulo: "Repetidora fuera de servicio o con cobertura reducida",
    categoria: "Radiocomunicaciones",
    sintomas: "repetidora caida, repetidor no levanta, cobertura corta, se oye con ruido, alcance reducido",
    descarte: "¿La repetidora enciende y muestra portadora al transmitir? ¿Hubo corte de energía o tormenta eléctrica reciente? ¿La falla es en todos los canales o en uno solo? ¿Desde cuándo se redujo el alcance?",
    causa: "Falla de energía o de la fuente, conector de antena con humedad, cable coaxial dañado, relación de onda estacionaria alta, etapa de potencia degradada o interferencia en el sitio.",
    procedimiento: "1. Verificar energía comercial, fuente y batería de respaldo del sitio.\n2. Revisar los indicadores de la repetidora: transmisión, recepción y alarmas.\n3. Medir la relación de onda estacionaria con el equipo de medición: por encima de 1,5 a 1 hay que revisar el sistema radiante.\n4. Inspeccionar conectores, sellado y aterrizaje en la base de la torre; buscar humedad y oxidación.\n5. Medir la potencia de salida y compararla con la nominal del equipo.\n6. Revisar ventilación y temperatura del gabinete.\n7. Probar cobertura en los puntos críticos y dejar constancia de los sitios donde sí y donde no comunica.\n8. Registrar el hallazgo en el módulo Mantenimientos y actualizar la hoja de vida.",
    comandos: "Medición con analizador de antenas: ROE, pérdida de retorno y distancia a la falla.\nMedición de potencia de salida con vatímetro y carga fantasma.",
    escalar: "Una ROE alta sostenida, la etapa de potencia degradada o un cable coaxial con falla en altura requieren trabajo en torre: escalar al proveedor con personal certificado para trabajo en alturas. Nunca improvisar la intervención de la torre.",
  },
  {
    titulo: "Programación, clonación e inventario de radios",
    categoria: "Radiocomunicaciones",
    sintomas: "programar radio, clonar radio, cargar plantilla, radio nuevo, cambiar frecuencia",
    descarte: "¿Existe plantilla vigente aprobada? ¿El radio es del mismo modelo y banda de la plantilla? ¿Quién autoriza la asignación del equipo?",
    causa: "No aplica. Procedimiento de alistamiento.",
    procedimiento: "1. Leer primero la programación actual del radio y guardarla como respaldo, con el número de serie en el nombre del archivo.\n2. Verificar que la plantilla corresponda al modelo y a la banda del equipo.\n3. Confirmar que las frecuencias, subtonos y niveles de potencia coinciden con el permiso de uso del espectro vigente.\n4. Escribir la plantilla y verificar leyendo de nuevo el radio.\n5. Rotular el equipo con el identificativo asignado.\n6. Probar comunicación en cada canal y zona antes de entregarlo.\n7. Entregar con batería, cargador y antena, dejando constancia firmada del responsable.\n8. Crear o actualizar la hoja de vida en el módulo Infraestructura con serie, modelo, responsable y fecha.",
    comandos: "Software de programación del fabricante (CPS). Secuencia: Leer → Guardar respaldo → Abrir plantilla → Escribir → Leer para verificar.",
    escalar: "Cualquier cambio de frecuencia que no esté en el permiso de uso del espectro debe consultarse antes con la jefatura. No se programa una frecuencia sin autorización escrita.",
  },
  {
    titulo: "Radio móvil vehicular sin transmisión o con audio bajo",
    categoria: "Radiocomunicaciones",
    sintomas: "radio del carro no transmite, se corta al acelerar, audio bajo movil, se apaga el radio",
    descarte: "¿Se apaga solo al transmitir o al acelerar? ¿El micrófono es el original? ¿La antena está en el techo o en un soporte metálico adecuado? ¿Hubo trabajo eléctrico reciente en el vehículo?",
    causa: "Alimentación tomada de un punto débil, cable de tierra flojo, fusible degradado, micrófono o su espiral dañados, antena mal montada o sin plano de tierra.",
    procedimiento: "1. Medir tensión en los bornes del radio en reposo y durante la transmisión: una caída marcada indica alimentación insuficiente.\n2. Verificar que el positivo y el negativo vayan directos a la batería, con fusible en ambos conductores.\n3. Revisar y limpiar el punto de tierra del chasis.\n4. Probar con otro micrófono para descartar el elemento y su cable espiral.\n5. Verificar el montaje de la antena y su plano de tierra; medir ROE.\n6. Probar comunicación en directo y por repetidora, con el motor encendido y apagado.\n7. Dejar el cableado asegurado y sin roce con partes móviles o calientes.\n8. Registrar la intervención en la hoja de vida del equipo y del vehículo.",
    comandos: "Medición con multímetro: tensión en bornes en reposo y en transmisión.\nMedición de ROE con el vehículo en sitio despejado.",
    escalar: "Si la falla persiste con alimentación y antena correctas, retirar el equipo y enviarlo a taller del proveedor. No intervenir la instalación eléctrica del vehículo sin el visto bueno del responsable del parque automotor.",
  },
  {
    titulo: "Interferencia, portadora abierta o audio ajeno en el canal",
    categoria: "Radiocomunicaciones",
    sintomas: "interferencia, se abre el canal solo, ruido en la frecuencia, se escuchan terceros, canal ocupado",
    descarte: "¿Es en un canal o en todos? ¿A qué horas ocurre? ¿Se escucha audio ajeno o solo ruido? ¿Coincide con el encendido de algún equipo del sitio?",
    causa: "Portadora ajena en la misma frecuencia, subtono desactivado en recepción, ruido industrial cercano, fuente conmutada o luminaria defectuosa, o intermodulación en el sitio.",
    procedimiento: "1. Documentar fecha, hora, duración y canal de cada evento, con grabación si es posible.\n2. Verificar que el subtono o el color de código esté activo en recepción.\n3. Apagar de forma escalonada los equipos del sitio para identificar una fuente local de ruido.\n4. Barrer la frecuencia con analizador de espectro y registrar el nivel de la señal intrusa.\n5. Revisar si otra dependencia o entidad opera cerca en esa frecuencia.\n6. Consolidar la evidencia con fechas, horas y mediciones.",
    comandos: "Analizador de espectro: barrido en la frecuencia afectada, marcadores y captura de pantalla.\nReceptor de referencia con subtono desactivado para escuchar el canal limpio.",
    escalar: "La interferencia por una emisión ajena no se corrige en sitio: se reporta con la evidencia a la jefatura para el trámite ante la autoridad del espectro. Nunca responder ni transmitir sobre la emisión intrusa.",
  },
  {
    titulo: "Baterías de radio con autonomía deficiente",
    categoria: "Radiocomunicaciones",
    sintomas: "bateria dura poco, no carga, se descarga rapido, radio se apaga en el turno",
    descarte: "¿Cuántos años tiene la batería? ¿Cuántos ciclos de carga lleva? ¿El cargador es el original? ¿Se descarga en reposo o solo al transmitir?",
    causa: "Batería al final de su vida útil, cargador con contactos sucios o dañado, carga permanente en el cargador, o uso a potencia alta de forma continua.",
    procedimiento: "1. Leer la fecha de fabricación marcada en la batería y calcular su antigüedad.\n2. Limpiar los contactos de la batería y del cargador con alcohol isopropílico.\n3. Probar la batería sospechosa en otro cargador y otro radio.\n4. Hacer un ciclo completo de carga y medir la autonomía real en un turno de uso normal.\n5. Bajar a potencia baja los canales de uso interno para alargar la autonomía.\n6. Marcar y retirar del servicio las baterías por debajo del 60 por ciento de la autonomía esperada.\n7. Registrar el retiro y gestionar la disposición final conforme a la norma ambiental.",
    comandos: "No aplica. Verificación con analizador de baterías si la dependencia cuenta con él.",
    escalar: "Si más del 30 por ciento del parque de baterías está vencido, elevar la necesidad de reposición por escrito con el inventario y las fechas, para incluirla en el plan de adquisiciones.",
  },

  /* ------------------------------- redes --------------------------------- */
  {
    titulo: "Punto de acceso inalámbrico saturado o sin asociación de clientes",
    categoria: "Red inalámbrica",
    sintomas: "wifi lento, no conecta al wifi, se cae la red inalambrica, no aparece la red, muchos usuarios wifi",
    descarte: "¿Falla para todos o para un equipo? ¿Qué SSID está usando? ¿Cuántos usuarios hay conectados a ese punto? ¿El equipo enciende y tiene enlace PoE?",
    causa: "Exceso de clientes por punto de acceso, canales superpuestos, potencia mal ajustada, PoE insuficiente o falla de autenticación.",
    procedimiento: "1. Verificar el estado del punto de acceso y su enlace PoE en el switch.\n2. Revisar cuántos clientes tiene asociados y compararlo con la capacidad recomendada del modelo.\n3. Hacer un barrido de canales y separar los canales que se superponen con los vecinos.\n4. Ajustar la potencia de transmisión: más potencia no es más cobertura, concentra usuarios en un solo punto.\n5. Probar la autenticación con una cuenta de prueba conocida.\n6. Revisar el rango del DHCP de la VLAN inalámbrica y su ocupación.\n7. Si la densidad de usuarios supera la capacidad, dejar constancia de la necesidad de un punto adicional.\n8. Registrar el ajuste en la hoja de vida del equipo.",
    comandos: "show power inline\nshow interface gi0/5 status\nshow ip dhcp pool\nshow ip dhcp binding | count\nEn la controladora: estado del AP, clientes asociados, canal y potencia.",
    escalar: "Si la controladora o la licencia del fabricante presenta falla, escalar al proveedor. La ampliación de puntos de acceso se tramita como necesidad con la jefatura.",
  },
  {
    titulo: "Enlace WAN intermitente con el proveedor",
    categoria: "Enlace WAN",
    sintomas: "se cae el internet, enlace intermitente, se corta la conexion, canal caido, proveedor",
    descarte: "¿La caída es total o hay pérdida de paquetes? ¿A qué horas ocurre? ¿El equipo del proveedor marca alarma? ¿Ya hay un radicado abierto con el proveedor?",
    causa: "Degradación del medio del proveedor, potencia óptica fuera de rango, conector sucio, negociación de velocidad o dúplex incorrecta en el equipo de borde.",
    procedimiento: "1. Documentar fecha y hora exactas de cada caída antes de llamar al proveedor.\n2. Revisar los indicadores y alarmas del equipo terminal del proveedor.\n3. Verificar el estado, la velocidad y el dúplex del puerto que conecta con ese equipo.\n4. Dejar una prueba de continuidad corriendo hacia la puerta de enlace del proveedor y hacia un destino externo, y guardar el resultado.\n5. Revisar contadores de errores y descartes en la interfaz.\n6. Si el enlace es óptico, verificar la potencia recibida contra el rango del transceptor y limpiar los conectores.\n7. Radicar el caso con el proveedor adjuntando horarios, mediciones y contadores.\n8. Hacer seguimiento del radicado y registrar el cierre en el ticket.",
    comandos: "show interface gi0/0 | include error|drop|duplex|rate\nshow interface transceiver\nping 8.8.8.8 repeat 1000\ntraceroute <destino>\nshow logging | include LINK|LINEPROTO",
    escalar: "El medio del proveedor no se interviene. Con la evidencia recogida, escalar por el canal contractual y exigir el cumplimiento del acuerdo de nivel de servicio pactado.",
  },
  {
    titulo: "Lentitud generalizada en una dependencia",
    categoria: "Conectividad",
    sintomas: "red lenta, todo va lento, demora en cargar, lentitud, se traba la red",
    descarte: "¿Es lento el acceso a todo o solo a un sistema? ¿Desde cuándo? ¿Coincide con un horario? ¿Se conectó algún equipo o servicio nuevo?",
    causa: "Tormenta de difusión, bucle parcial, negociación en semidúplex, enlace de subida saturado o un equipo generando tráfico anómalo.",
    procedimiento: "1. Separar el problema: probar un servicio interno y uno externo para ubicar dónde está la demora.\n2. Revisar la utilización del puerto de subida del switch de la dependencia.\n3. Buscar puertos en semidúplex o con exceso de errores y colisiones.\n4. Revisar la tabla de direcciones físicas en busca de direcciones que salten entre puertos, señal de bucle.\n5. Identificar el equipo que más tráfico genera y verificar su estado.\n6. Revisar el registro del switch en busca de eventos de spanning tree.\n7. Corregir el hallazgo, documentarlo y volver a medir para confirmar.",
    comandos: "show interfaces | include rate|errors|duplex\nshow interfaces counters errors\nshow mac address-table | count\nshow spanning-tree detail | include change\nshow processes cpu sorted",
    escalar: "Si la saturación es del enlace de subida y no hay margen de configuración, se trata de capacidad: documentar las mediciones y elevar la necesidad de ampliación.",
  },
  {
    titulo: "Equipo que no obtiene dirección IP por DHCP",
    categoria: "Conectividad",
    sintomas: "no toma ip, ip 169, sin direccion, dhcp, no obtiene configuracion de red",
    descarte: "¿Pasa en un equipo o en varios del mismo punto? ¿El equipo tiene enlace en la tarjeta de red? ¿Funciona con dirección fija en la misma VLAN?",
    causa: "Puerto en la VLAN equivocada, rango de direcciones agotado, ausencia de reenvío de peticiones hacia el servidor, o un servidor DHCP no autorizado en la red.",
    procedimiento: "1. Verificar enlace físico y VLAN asignada al puerto.\n2. Probar el equipo con dirección fija en esa VLAN para confirmar que la ruta está bien.\n3. Revisar la ocupación del rango de direcciones y liberar las vencidas si corresponde.\n4. Verificar que la interfaz de la VLAN reenvíe las peticiones hacia el servidor.\n5. Buscar servidores DHCP no autorizados y bloquear el puerto implicado.\n6. Documentar el hallazgo y avisar al usuario cuando el servicio quede restablecido.",
    comandos: "show interface gi0/8 switchport\nshow ip dhcp pool\nshow ip dhcp conflict\nshow ip dhcp snooping binding\nconfigure terminal\ninterface vlan 20\n ip helper-address <servidor>",
    escalar: "Si el servidor DHCP es administrado por otra área, remitir el caso con la evidencia del reenvío y el rango consultado.",
  },
  {
    titulo: "Respaldo y restauración de la configuración de un equipo activo",
    categoria: "Equipo activo",
    sintomas: "respaldo, backup de configuracion, restaurar switch, copia de configuracion, cambio de equipo",
    descarte: "¿Existe respaldo vigente del equipo? ¿El equipo nuevo es del mismo fabricante y versión? ¿Hay ventana de mantenimiento autorizada?",
    causa: "No aplica. Procedimiento de respaldo.",
    procedimiento: "1. Conectarse por consola y verificar la versión del sistema operativo del equipo.\n2. Mostrar la configuración en ejecución y capturarla completa en el registro de la sesión de consola.\n3. Guardar el archivo con fecha, nombre del equipo y sede, en el repositorio autorizado.\n4. Comparar el respaldo nuevo con el anterior y dejar constancia de los cambios.\n5. Para restaurar, cargar la configuración por consola por bloques, verificando cada sección.\n6. Revisar interfaces, VLAN y accesos antes de devolver el equipo al servicio.\n7. Guardar la configuración en el equipo y actualizar la hoja de vida.\n8. Conservar el respaldo del equipo saliente hasta que el nuevo cumpla un mes estable.",
    comandos: "show version\nshow running-config\nwrite memory\nEn Huawei: display current-configuration / save\nEn Comware: display current-configuration / save force",
    escalar: "El traslado de configuración entre fabricantes distintos no es automático: se traduce comando por comando y se prueba en ventana de mantenimiento. Si el equipo hace parte del perímetro, coordinar con el responsable del firewall antes de intervenirlo.",
  },

  /* ------------------------ CCTV y videovigilancia ----------------------- */
  {
    titulo: "Cámara IP sin video en el grabador",
    categoria: "CCTV y videovigilancia",
    sintomas: "camara sin imagen, camara offline, no graba, pantalla negra cctv, camara caida",
    descarte: "¿Es una cámara o varias? ¿Están en el mismo switch o inyector? ¿Hubo corte de energía? ¿La cámara responde a un ping?",
    causa: "Pérdida de alimentación PoE, cable dañado o mal ponchado, dirección IP en conflicto, cámara reiniciándose por humedad, o credenciales cambiadas en el grabador.",
    procedimiento: "1. Verificar si el puerto del switch entrega PoE y si hay enlace.\n2. Probar continuidad y ponchado del cable; recordar que el límite del cobre son 100 metros en total.\n3. Probar alcance a la dirección de la cámara desde la red de videovigilancia.\n4. Entrar a la cámara por navegador y confirmar que genera imagen.\n5. Revisar en el grabador el canal, las credenciales y el protocolo configurado.\n6. Si la cámara se reinicia sola, revisar humedad en la caja de conexión y el sellado del conector.\n7. Restablecer el canal, confirmar grabación y avisar al responsable del sistema.\n8. Registrar la intervención en la hoja de vida de la cámara.",
    comandos: "show power inline gi0/12\nshow interface gi0/12 status\nping <ip camara>\nshow mac address-table interface gi0/12",
    escalar: "Si la cámara no responde con alimentación y cable confirmados, es falla del equipo: gestionar garantía o reposición con serie y fecha de instalación.",
  },
  {
    titulo: "Retención de grabaciones por debajo de lo exigido",
    categoria: "CCTV y videovigilancia",
    sintomas: "no hay grabacion de esa fecha, pocos dias de grabacion, se borro el video, retencion, disco lleno",
    descarte: "¿Cuántos días exige la norma o el acuerdo interno? ¿Cuántos días conserva hoy el grabador? ¿Se agregaron cámaras recientemente? ¿El disco reporta alarmas?",
    causa: "Capacidad de disco insuficiente para la cantidad de cámaras, resolución o tasa de bits más alta de la planeada, grabación permanente donde podría ser por detección, o disco degradado.",
    procedimiento: "1. Verificar en el grabador la fecha de la grabación más antigua disponible y contrastarla con la exigida.\n2. Revisar el estado de los discos y sus alarmas.\n3. Listar cámaras, resolución, cuadros por segundo y tasa de bits de cada canal.\n4. Calcular la capacidad necesaria y compararla con la instalada.\n5. Ajustar la tasa de bits y el esquema de grabación donde sea admisible, sin sacrificar las cámaras críticas.\n6. Verificar que la hora del grabador esté sincronizada, porque una hora errada inutiliza la búsqueda.\n7. Dejar por escrito la brecha entre la retención lograda y la exigida.\n8. Registrar el cálculo y la recomendación en el ticket.",
    comandos: "No aplica: la verificación se hace en la interfaz del grabador.\nRevisar: estado de discos, esquema de grabación, tasa de bits por canal y sincronización horaria.",
    escalar: "Si con el ajuste no se alcanza la retención exigida, es una insuficiencia de capacidad: elevar por escrito la necesidad de ampliación de almacenamiento, con el cálculo que la sustente.",
  },
  {
    titulo: "Imagen borrosa, con halo nocturno o fuera de foco",
    categoria: "CCTV y videovigilancia",
    sintomas: "imagen borrosa, no se ve de noche, reflejo, telaraña, camara desenfocada, halo",
    descarte: "¿Se ve mal de día, de noche o siempre? ¿Hay telarañas o suciedad en el domo? ¿Alguien movió la cámara? ¿Hay una luz apuntando al lente?",
    causa: "Domo sucio o rayado, reflejo de los infrarrojos en el domo, telarañas que activan el modo nocturno, foco perdido por vibración, o contraluz de una lámpara cercana.",
    procedimiento: "1. Limpiar el domo o la carcasa con paño de microfibra, sin productos abrasivos.\n2. Verificar que el anillo de sellado esté bien puesto: el halo nocturno casi siempre es el infrarrojo rebotando en el domo.\n3. Retirar telarañas y revisar si hay insectos atraídos por el infrarrojo.\n4. Ajustar el foco y el encuadre, y confirmarlo en vivo desde el grabador.\n5. De noche, evaluar si una lámpara cercana está saturando la imagen y ajustar el encuadre o gestionar el traslado de la luminaria.\n6. Revisar los parámetros de exposición y de compensación de contraluz.\n7. Dejar registro fotográfico del antes y el después en el ticket.\n8. Confirmar el encuadre final con el responsable del área vigilada.",
    comandos: "No aplica. Ajuste físico y de parámetros en la interfaz de la cámara.",
    escalar: "Si el lente presenta condensación interna o el motor de enfoque no responde, la cámara requiere reemplazo: gestionar garantía con serie y fecha de instalación.",
  },
  {
    titulo: "Instalación y puesta en servicio de una cámara nueva",
    categoria: "CCTV y videovigilancia",
    sintomas: "instalar camara, camara nueva, montar cctv, ampliar videovigilancia, punto de camara",
    descarte: "¿Quién autorizó el punto y con qué finalidad? ¿El área vigilada respeta la reserva de los espacios privados? ¿Hay puerto PoE y capacidad de disco disponibles? ¿La distancia de cable supera los 100 metros?",
    causa: "No aplica. Procedimiento de instalación.",
    procedimiento: "1. Confirmar por escrito la autorización del punto y la finalidad de la vigilancia.\n2. Verificar que el encuadre no cubra baños, vestieres ni espacios de reserva personal.\n3. Comprobar disponibilidad de puerto PoE, presupuesto de potencia del switch y capacidad de almacenamiento.\n4. Tender el cable por canalización propia, separado de acometidas eléctricas, sin superar los 100 metros.\n5. Ponchar y certificar el enlace antes de colgar la cámara.\n6. Asignar dirección IP del rango de videovigilancia y cambiar la contraseña de fábrica.\n7. Actualizar el firmware, sincronizar la hora y agregar el canal al grabador.\n8. Ajustar encuadre, foco y esquema de grabación, y verificar la imagen de día y de noche.\n9. Publicar el aviso visible de zona videovigilada donde corresponda.\n10. Crear la hoja de vida en el módulo Infraestructura y dejar el registro fotográfico.",
    comandos: "show power inline\nshow power inline module 1\nping <ip camara>\nconfigure terminal\ninterface gi0/20\n description CCTV - <ubicacion>\n switchport access vlan <vlan cctv>",
    escalar: "La red de videovigilancia va en su propia VLAN, sin salida a internet salvo autorización expresa. Si el punto exige atravesar el firewall institucional, coordinar la regla con el responsable del perímetro y dejarla documentada.",
  },
  {
    titulo: "Exportación de video para una solicitud formal",
    categoria: "CCTV y videovigilancia",
    sintomas: "exportar video, copia de grabacion, solicitan video, entregar grabacion, requerimiento de video",
    descarte: "¿Existe solicitud escrita de autoridad o dependencia competente? ¿Están definidos con precisión la fecha, la hora y la cámara? ¿Quién autoriza la entrega?",
    causa: "No aplica. Procedimiento de entrega de evidencia.",
    procedimiento: "1. Recibir y archivar la solicitud escrita antes de exportar nada.\n2. Verificar que la grabación aún esté dentro del periodo de retención.\n3. Ubicar el segmento por cámara, fecha y hora, con un margen prudente antes y después.\n4. Exportar en el formato nativo del grabador y, si se requiere, también en un formato reproducible, junto con el visor del fabricante.\n5. Calcular y anotar la suma de verificación del archivo exportado.\n6. Grabar en medio nuevo, rotulado con número de caso, cámara, fecha y hora.\n7. Elaborar el acta de entrega con quién entrega, quién recibe, fecha y suma de verificación, y recoger las firmas.\n8. Registrar la entrega en la bitácora y conservar copia del acta en el ticket.\n9. No conservar copias adicionales fuera de lo autorizado.",
    comandos: "Suma de verificación en Windows: certutil -hashfile <archivo> SHA256\nEn Linux o macOS: sha256sum <archivo>",
    escalar: "Sin solicitud escrita de autoridad competente no se entrega video. Ante cualquier duda sobre la procedencia de la solicitud, consultar con la jefatura y con el área jurídica antes de exportar.",
  },
];

const CONOCIMIENTO = [...CONOCIMIENTO_BASE, ...CONOCIMIENTO_13];

/* Marca de la versión del catálogo base. Un archivo guardado con una versión
   anterior recibe, la primera vez que se abre aquí, los procedimientos y las
   categorías nuevas; lo que el usuario haya escrito o borrado no se toca.   */
const SEMILLA_VERSION = "1.4";
const AMPLIACION_13 = {
  categorias: ["Radiocomunicaciones", "CCTV y videovigilancia", "Red inalámbrica",
    "Enlace WAN", "Control de acceso"],
  tipos_solucion: ["Ajuste de programación", "Alineación o revisión de antena",
    "Cambio de batería", "Limpieza de óptica", "Reemplazo por garantía"],
};
/* 1.4: la revista de radios. Solo hace falta sumar la opción al catálogo de
   tipos de actividad; el catálogo de modelos de radio es nuevo por completo,
   así que se siembra solo —ver SEMILLA_LISTA— sin necesitar entrar aquí.     */
const AMPLIACION_14 = {
  tipos_actividad: ["Revista de radios"],
};
