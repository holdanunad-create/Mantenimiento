/* ------------------------------ utilidades ------------------------------- */
const hoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = (d) => (d instanceof Date && !isNaN(d)
  ? d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") : "");
const hoyISO = () => iso(hoy());
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const ahora = () => new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
const titulo = (s) => String(s).trim().replace(/\s+/g, " ").replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

function toDate(v) {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v)) return v;
  if (typeof v === "number") { const d = new Date(Math.round((v - 25569) * 86400000)); return isNaN(d) ? null : d; }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
  if (m) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
const dISO = (v) => iso(toDate(v));
const fmt = (v) => { const d = toDate(v); return d ? d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "2-digit" }) : "—"; };
const fmtLargo = (v) => { const d = toDate(v); return d ? d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }) : "—"; };
const horas = (a, b) => (toDate(b) - toDate(a)) / 3600000;
const dias = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
const sumaHoras = (d, h) => { const x = new Date(d.getTime() + h * 3600000); return x; };
const selloISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
  String(d.getDate()).padStart(2, "0") + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

/* huella de contraseñas y de integridad */
function fnv(s, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
const SEMILLAS = [0x811C9DC5, 0x1000193, 0x7FEB352D, 0x846CA68B];
const digest = (t) => SEMILLAS.map((sd) => ("0000000" + fnv(t, sd).toString(16)).slice(-8)).join("");
const huella = (usuario, clave) => digest(String(usuario || "").trim().toLowerCase() + ":" + String(clave || ""));

/* control de duplicados: mismo criterio del 30 % en todo el sistema */
const UMBRAL = 0.30;
const PARTICULAS = ["de", "del", "la", "las", "los", "san", "y", "da", "do", "el", "en"];
function bigramas(t) {
  const x = norm(t).replace(/[^a-z0-9]/g, ""); const b = [];
  for (let i = 0; i < x.length - 1; i++) b.push(x.slice(i, i + 2));
  return b;
}
const palabras = (n) => norm(n).replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
  .filter((t) => t.length > 1 && PARTICULAS.indexOf(t) < 0);
function parecido(a, b) {
  if (norm(a) === norm(b)) return 1;
  const A = bigramas(a), B = bigramas(b);
  if (!A.length || !B.length) return 0;
  const r = [...B]; let c = 0;
  A.forEach((g) => { const i = r.indexOf(g); if (i >= 0) { c++; r.splice(i, 1); } });
  const dice = (2 * c) / (A.length + B.length);
  const cont = c / Math.min(A.length, B.length);
  const comparte = palabras(a).some((x) => palabras(b).indexOf(x) >= 0);
  return Math.max(dice, cont >= 0.9 ? cont : 0, comparte ? 0.9 : 0);
}
function revisarParecido(nuevo, lista) {
  let mejor = null;
  (lista || []).forEach((x) => {
    const p = parecido(nuevo, x);
    if (p >= UMBRAL && (!mejor || p > mejor.valor)) mejor = { texto: x, valor: p, pct: Math.round(p * 100) };
  });
  return mejor;
}

/* ------------------------------- fotos ----------------------------------- */
/* Cada foto de una revista se guarda en dos tamaños con propósitos distintos:
     mini  — reducida y recomprimida. Es la que viaja dentro del Excel y la que
             se imprime en el informe. Sin ella el archivo sería inmanejable.
     full  — el original tal como salió de la cámara, sin tocar. Vive solo
             mientras la sesión está abierta, para descargarlo o escribirlo en
             la carpeta de originales.
   El nombre se arma con el consecutivo del registro, de modo que una foto
   suelta siempre se pueda devolver a su revista.                             */

function nombreFoto(consecutivo, n) {
  return String(consecutivo || "SIN-CONSECUTIVO").replace(/[^\w-]/g, "_") + "-" + n + ".jpg";
}

/* Reduce la foto al lado mayor indicado y la recomprime como JPEG. Si la
   imagen ya es más pequeña, no la agranda: solo la recomprime.               */
function reducirFoto(file, lado, calidad) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const esc = Math.min(1, (lado || FOTO_LADO) / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * esc)), h = Math.max(1, Math.round(img.height * esc));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const cx = c.getContext("2d");
      cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h);      /* PNG con transparencia */
      cx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res({ datos: c.toDataURL("image/jpeg", calidad || FOTO_CALIDAD), ancho: w, alto: h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("archivo de imagen no legible")); };
    img.src = url;
  });
}

const leerComoDataURL = (file) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = () => rej(fr.error);
  fr.readAsDataURL(file);
});

/* De data URL a Blob, para descargar o escribir el archivo. */
function aBlob(dataURL) {
  const [cab, b64] = String(dataURL || "").split(",");
  if (!b64) return null;
  const tipo = (cab.match(/data:([^;]+)/) || [, "image/jpeg"])[1];
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: tipo });
}

const pesoFoto = (dataURL) => Math.round(String(dataURL || "").length * 0.75 / 1024);  /* KB aproximados */

function descargarBlob(blob, nombre) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}

/* Las fotos viven en el registro como arreglo de objetos; en el Excel se
   guardan en su propia hoja. Estas dos funciones traducen entre las dos
   formas y toleran que el campo venga vacío o con basura.                    */
const fotosDe = (r) => (r && Array.isArray(r.fotos) ? r.fotos : []);
const cuantasFotos = (r) => fotosDe(r).length;
const cuantasFotosRadio = (r) => SLOTS_FOTO_RADIO.filter((s) => r && r.fotos_radio && r.fotos_radio[s.clave]).length;

/* almacén del identificador de archivo entre sesiones */
const IDB = {
  db: null,
  async open() {
    if (this.db) return this.db;
    return new Promise((res, rej) => {
      const q = indexedDB.open("gutic", 1);
      q.onupgradeneeded = () => q.result.createObjectStore("kv");
      q.onsuccess = () => { this.db = q.result; res(q.result); };
      q.onerror = () => rej(q.error);
    });
  },
  async set(k, v) { const db = await this.open(); return new Promise((r, j) => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = r; t.onerror = () => j(t.error); }); },
  async get(k) { const db = await this.open(); return new Promise((r, j) => { const t = db.transaction("kv", "readonly").objectStore("kv").get(k); t.onsuccess = () => r(t.result); t.onerror = () => j(t.error); }); },
};

/* ------------------------- semáforo por módulo --------------------------- */
function evaluar(mod, r, alerta) {
  const cerrado = ["Resuelto", "Cerrado", "Finalizado"];
  if (mod === "tickets") {
    if (cerrado.indexOf(r.estado) >= 0) {
      const tarde = r.fecha_compromiso && r.fecha_solucion && horas(r.fecha_compromiso, r.fecha_solucion) > 0;
      return { s: "resuelto", motivo: tarde ? "Resuelto fuera del ANS" : "Resuelto dentro del ANS", rest: null };
    }
    return plazo(r.fecha_compromiso, alerta, true);
  }
  if (mod === "mantenimientos") {
    if (r.fecha_ejecutada || cerrado.indexOf(r.estado) >= 0) return { s: "resuelto", motivo: "Ejecutado", rest: null };
    return plazo(r.fecha_programada, alerta, false);
  }
  if (mod === "infraestructura") {
    if (r.estado_op === "Dado de baja") return { s: "resuelto", motivo: "Dado de baja", rest: null };
    if (r.estado_op === "Fuera de servicio") return { s: "vencido", motivo: "Fuera de servicio", rest: null };
    return plazo(r.proximo_mtto, alerta, false);
  }
  if (mod === "eventos") {
    if (r.estado === "Finalizado" || r.estado === "Cancelado") return { s: "resuelto", motivo: r.estado, rest: null };
    return plazo(r.fecha_evento, alerta, false);
  }
  if (mod === "inspecciones") {
    if (r.resultado === "Conforme") return { s: "resuelto", motivo: "Conforme", rest: null };
    if (r.resultado === "No conforme" || r.resultado === "Requiere reemplazo")
      return { s: "vencido", motivo: r.resultado, rest: null };
    if (r.resultado === "Con observaciones") return { s: "porvencer", motivo: "Con observaciones", rest: null };
    return { s: "tiempo", motivo: "Sin resultado", rest: null };
  }
  return { s: "tiempo", motivo: "", rest: null };
}
function plazo(valor, alerta, esHoras) {
  const d = toDate(valor);
  if (!d) return { s: "tiempo", motivo: "Sin fecha definida", rest: null };
  if (esHoras) {
    const h = horas(new Date(), d);
    if (h < 0) return { s: "vencido", motivo: "Vencido hace " + Math.abs(Math.round(h)) + " h", rest: h };
    if (h <= alerta) return { s: "porvencer", motivo: "Vence en " + Math.round(h) + " h", rest: h };
    return { s: "tiempo", motivo: "Faltan " + Math.round(h) + " h", rest: h };
  }
  const n = dias(hoy(), d);
  if (n < 0) return { s: "vencido", motivo: "Vencido hace " + Math.abs(n) + " d", rest: n };
  if (n <= 7) return { s: "porvencer", motivo: n === 0 ? "Es hoy" : "En " + n + " d", rest: n };
  return { s: "tiempo", motivo: "En " + n + " d", rest: n };
}

/* estado global de pendientes para el punto del botón flotante: toma, de
   todos los registros no resueltos de todos los módulos, el que tenga menos
   días restantes (para tickets, las horas de `rest` se pasan a días) y lo
   clasifica en tres niveles. */
function estadoGlobal(datos, alerta) {
  let minDias = Infinity;
  const conteo = { rojo: 0, amarillo: 0, verde: 0 };
  MODULOS.forEach((m) => {
    (datos[m] || []).forEach((r) => {
      const e = evaluar(m, r, alerta);
      if (e.s === "resuelto" || e.rest === null || e.rest === undefined) return;
      const d = m === "tickets" ? e.rest / 24 : e.rest;
      if (d < minDias) minDias = d;
      if (d < 5) conteo.rojo++;
      else if (d < 10) conteo.amarillo++;
      else if (d < 15) conteo.verde++;
    });
  });
  if (minDias === Infinity) return { nivel: null, dias: null, conteo };
  const nivel = minDias < 5 ? "rojo" : minDias < 10 ? "amarillo" : minDias < 15 ? "verde" : null;
  return { nivel, dias: Math.round(minDias), conteo };
}

/* columnas visibles de cada módulo en su tabla */
const TABLA = {
  tickets: ["consecutivo", "asunto", "categoria", "prioridad", "sede", "estado"],
  infraestructura: ["codigo", "tipo_elemento", "marca", "sede", "estado_op", "proximo_mtto"],
  mantenimientos: ["consecutivo", "equipo", "tipo_mtto", "fecha_programada", "resultado", "ejecutado_por"],
  inspecciones: ["consecutivo", "fecha", "tipo_inspeccion", "equipo", "resultado", "inspeccionado_por"],
  eventos: ["consecutivo", "nombre", "fecha_evento", "lugar", "estado", "resultado"],
};

/* --------------------------- identidad visual ---------------------------- */
/* Emblema y fondo institucionales, incrustados en base64 dentro del propio
   archivo: no dependen de una carpeta de recursos al lado.                   */
function Emblema({ tam }) {
  const s = tam || 56;
  return (
    <img src={window.MARCA} alt="Secretario Virtual Policial" width={s} height={s}
      style={{ borderRadius: "50%", border: "2px solid " + T.oro, display: "block",
        boxShadow: "0 0 0 3px rgba(13,22,32,.8),0 4px 16px rgba(0,0,0,.5)" }} />
  );
}
