/* ================================= APP =================================== */
const VACIO = () => ({ tickets: [], infraestructura: [], mantenimientos: [], inspecciones: [], eventos: [] });
const LISTAS = ["solicitantes", "dependencias", "sedes", "tecnicos",
  "tipos_actividad", "categorias", "estados", "tipos_solucion", "modelos_radio"];
const ROT_LISTA = {
  solicitantes: "Solicitantes", dependencias: "Dependencias", sedes: "Sedes", tecnicos: "Técnicos",
  tipos_actividad: "Tipos de actividad", categorias: "Categorías técnicas",
  estados: "Estados", tipos_solucion: "Tipos de solución", modelos_radio: "Modelos de radio",
};
/* Los cuatro catálogos nuevos nacen con los valores que antes estaban fijos en
   el código. Si el Excel no los trae —porque viene de una versión anterior—
   se siembran con esto y desde ahí los administra el usuario.                */
const SEMILLA_LISTA = {
  tipos_actividad: CAT.tipo_req,
  categorias: CAT.categoria,
  estados: CAT.estado_ticket,
  tipos_solucion: CAT.tipo_solucion,
  modelos_radio: CAT.modelo_radio,
};
const LISTA_VACIA = () => LISTAS.reduce((o, k) => (o[k] = [], o), {});

function App() {
  const [datos, setDatos] = useState(VACIO());
  const [listas, setListas] = useState(LISTA_VACIA);
  const [conocimiento, setConocimiento] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [unidad, setUnidad] = useState("");
  const [alerta, setAlerta] = useState(4);          /* horas de aviso en tickets */
  const [handle, setHandle] = useState(null);
  const [archivo, setArchivo] = useState("");
  const [estadoG, setEstadoG] = useState("nada");
  const [ultimo, setUltimo] = useState("");
  const [arrancando, setArrancando] = useState(true);
  const [iniciado, setIniciado] = useState(false);
  const [hayPrevio, setHayPrevio] = useState(null);
  const [tab, setTab] = useState("tickets");
  const [edita, setEdita] = useState(null);         /* {mod, i|null, r} */
  const [toast, setToast] = useState(null);
  const [alterado, setAlterado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const primera = useRef(true);
  const estadoGRef = useRef("nada");
  const fabRef = useRef(null);
  const soporta = typeof window !== "undefined" && !!window.showSaveFilePicker;
  const esElectron = typeof window !== "undefined" && !!window.gutic;
  const nombreArchivo = (ruta) => String(ruta || "").split(/[\\/]/).pop();

  useEffect(() => { estadoGRef.current = estadoG; }, [estadoG]);

  const avisar = (m, err) => { setToast({ m, err }); setTimeout(() => setToast(null), err ? 6000 : 2600); };
  const anotar = (accion, ref, detalle) => setBitacora((p) => [...p, {
    fecha: ahora(), usuario: (sesion && sesion.nombre) || "(sin sesión)", accion,
    referencia: ref || "", detalle: detalle || "",
  }].slice(-5000));

  /* ------------------------- arranque y archivo ------------------------- */
  useEffect(() => {
    (async () => {
      if (esElectron) {
        try {
          const r = await window.gutic.rutaRecordada();
          if (r && r.ruta) {
            setHandle(r.ruta); setArchivo(nombreArchivo(r.ruta));
            await leer(r.ruta); setIniciado(true);
          }
        } catch (e) { /* sin ruta recordada todavia */ }
        setArrancando(false);
        return;
      }
      try {
        const h = await IDB.get("archivo");
        if (h) {
          setHayPrevio(h.name);
          const p = await h.queryPermission({ mode: "readwrite" });
          setArchivo(h.name);
          if (p === "granted") { setHandle(h); await leer(h); setIniciado(true); }
        }
      } catch (e) { /* IndexedDB no disponible */ }
      setArrancando(false);
    })();
  }, []);

  /* ------------------ cambios externos al Excel vinculado ----------------- */
  useEffect(() => {
    if (esElectron) {
      if (!window.gutic.onCambioExterno) return;
      return window.gutic.onCambioExterno(() => {
        if (estadoGRef.current === "pend" || estadoGRef.current === "guardando") {
          avisar("El Excel cambió por fuera de la aplicación; se recargará cuando termine de guardar.");
          return;
        }
        if (handle) leer(handle);
      });
    }
    if (!handle) return;
    let ultimo = null;
    const t = setInterval(async () => {
      try {
        const f = await handle.getFile();
        if (ultimo === null) { ultimo = f.lastModified; return; }
        if (f.lastModified === ultimo) return;
        ultimo = f.lastModified;
        if (estadoGRef.current === "pend" || estadoGRef.current === "guardando") {
          avisar("El Excel cambió por fuera de la aplicación; se recargará cuando termine de guardar.");
          return;
        }
        await leer(handle);
      } catch (e) { /* el archivo pudo moverse o eliminarse */ }
    }, 5000);
    return () => clearInterval(t);
  }, [handle]);

  useEffect(() => { document.title = unidad ? "GUTIC — " + unidad : "GUTIC"; }, [unidad]);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    if (!handle) { setEstadoG("pend"); return; }
    setEstadoG("guardando");
    const t = setTimeout(() => escribir(handle), 700);
    return () => clearTimeout(t);
  }, [datos, listas, conocimiento, usuarios, bitacora, unidad, alerta]);

  useEffect(() => {
    const h = (e) => { if (estadoG === "pend") { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [estadoG]);

  /* El sello ignora los campos agregados después de la 1.2 (ver FUERA_SELLO en
     nucleo.jsx): si entraran, todo Excel anterior daría falsa alarma al abrirse
     por primera vez con esta versión.                                        */
  const selloDatos = (d) => digest(MODULOS.map((m) =>
    (d[m] || []).map((r) => M[m].campos
      .filter(([k]) => FUERA_SELLO.indexOf(k) < 0)
      .map(([k]) => String(r[k] ?? "").trim()).join("\u0001")).join("\u0002")
  ).join("\u0003"));

  function construir(d, li, co, us, bi, uni, al) {
    const D = d || datos, LI = li || listas, CO = co || conocimiento;
    const US = us || usuarios, BI = bi || bitacora, UNI = uni !== undefined ? uni : unidad;
    const AL = al !== undefined ? al : alerta;
    const wb = XLSX.utils.book_new();

    MODULOS.forEach((m) => {
      const mod = M[m];
      const enc = mod.campos.map((c) => c[1]);
      const filas = (D[m] || []).map((r) => {
        const o = {};
        mod.campos.forEach(([k, l, t]) => {
          /* Las fotos no caben en una celda: aquí va solo la lista de nombres,
             para que el Excel se pueda leer a simple vista. Las imágenes van
             en su propia hoja.                                              */
          if (t === "fotos") {
            o[l] = fotosDe(r).map((_, i) => nombreFoto(r.consecutivo, i + 1)).join(" | ");
            return;
          }
          if (t === "fotos_radio") {
            o[l] = SLOTS_FOTO_RADIO.filter((s) => r.fotos_radio && r.fotos_radio[s.clave])
              .map((s) => nombreFoto(r.consecutivo, s.clave)).join(" | ");
            return;
          }
          o[l] = r[k] ?? "";
        });
        const e = evaluar(m, r, AL);
        o["Semáforo"] = SEM[e.s].l;
        return o;
      });
      const ws = XLSX.utils.json_to_sheet(filas, { header: [...enc, "Semáforo"] });
      ws["!cols"] = [...mod.campos.map((c) => ({ wch: c[3] })), { wch: 14 }];
      ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(filas.length, 1), c: enc.length } }) };
      ws["!freeze"] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(wb, ws, mod.hoja);
    });

    /* ----------------------------- fotos ------------------------------- */
    /* Una miniatura en base64 supera de largo el límite de 32.767 caracteres
       de una celda, así que cada foto se guarda partida en trozos y se vuelve
       a unir al leer. La hoja se escribe siempre, aunque esté vacía, para que
       el archivo tenga la misma forma en todas las bases.                   */
    const fot = [];
    (D.tickets || []).forEach((r) => {
      fotosDe(r).forEach((f, i) => {
        const datos = String(f.mini || "");
        const partes = Math.max(1, Math.ceil(datos.length / FOTO_TROZO));
        for (let t = 0; t < partes; t++) {
          fot.push({
            "Consecutivo": r.consecutivo || "",
            "Número": i + 1,
            "Archivo": nombreFoto(r.consecutivo, i + 1),
            "Ancho": f.ancho || "",
            "Alto": f.alto || "",
            "Tomada": f.tomada || "",
            "Parte": t + 1,
            "Partes": partes,
            "Datos": datos.slice(t * FOTO_TROZO, (t + 1) * FOTO_TROZO),
          });
        }
      });
    });
    const encFot = ["Consecutivo", "Número", "Archivo", "Ancho", "Alto", "Tomada", "Parte", "Partes", "Datos"];
    const wsf = XLSX.utils.json_to_sheet(fot, { header: encFot });
    wsf["!cols"] = [{ wch: 18 }, { wch: 8 }, { wch: 26 }, { wch: 8 }, { wch: 8 }, { wch: 18 }, { wch: 7 }, { wch: 7 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsf, HOJA_FOTOS);

    /* Las tres fotos fijas de la revista de radios van en su propia hoja, con
       el mismo esquema de trozos: cada radio aporta hasta tres filas por
       parte, una por cada foto que sí se tomó.                              */
    const fotR = [];
    (D.tickets || []).forEach((r) => {
      if (!r.fotos_radio) return;
      SLOTS_FOTO_RADIO.forEach((s) => {
        const f = r.fotos_radio[s.clave];
        if (!f) return;
        const datos = String(f.mini || "");
        const partes = Math.max(1, Math.ceil(datos.length / FOTO_TROZO));
        for (let t = 0; t < partes; t++) {
          fotR.push({
            "Consecutivo": r.consecutivo || "",
            "Ranura": s.clave,
            "Archivo": nombreFoto(r.consecutivo, s.clave),
            "Ancho": f.ancho || "",
            "Alto": f.alto || "",
            "Tomada": f.tomada || "",
            "Parte": t + 1,
            "Partes": partes,
            "Datos": datos.slice(t * FOTO_TROZO, (t + 1) * FOTO_TROZO),
          });
        }
      });
    });
    const encFotR = ["Consecutivo", "Ranura", "Archivo", "Ancho", "Alto", "Tomada", "Parte", "Partes", "Datos"];
    const wsfr = XLSX.utils.json_to_sheet(fotR, { header: encFotR });
    wsfr["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 26 }, { wch: 8 }, { wch: 8 }, { wch: 18 }, { wch: 7 }, { wch: 7 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsfr, HOJA_FOTOS_RADIO);

    const res = [];
    MODULOS.forEach((m) => {
      res.push({ "Concepto": M[m].titulo, "Cantidad": (D[m] || []).length });
      ORDEN.forEach((s) => {
        const n = (D[m] || []).filter((r) => evaluar(m, r, AL).s === s).length;
        if (n) res.push({ "Concepto": "   " + SEM[s].l, "Cantidad": n });
      });
    });
    const wsr = XLSX.utils.json_to_sheet(res, { header: ["Concepto", "Cantidad"] });
    wsr["!cols"] = [{ wch: 34 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsr, "Resumen");

    const cfg = [
      { "Parámetro": "Unidad o dependencia", "Valor": UNI || "Sin definir" },
      { "Parámetro": "Horas de alerta en tickets", "Valor": AL },
      { "Parámetro": "Sello de integridad", "Valor": selloDatos(D) },
      { "Parámetro": "Total de registros", "Valor": MODULOS.reduce((a, m) => a + (D[m] || []).length, 0) },
      { "Parámetro": "Última actualización", "Valor": ahora() },
      { "Parámetro": "Catálogo base aplicado", "Valor": SEMILLA_VERSION },
      { "Parámetro": "Aplicación", "Valor": "GUTIC v1.4" },
    ];
    const wsc = XLSX.utils.json_to_sheet(cfg, { header: ["Parámetro", "Valor"] });
    wsc["!cols"] = [{ wch: 28 }, { wch: 44 }];
    XLSX.utils.book_append_sheet(wb, wsc, "Configuración");

    const maxL = Math.max(1, ...LISTAS.map((k) => (LI[k] || []).length));
    const cat = [];
    for (let i = 0; i < maxL; i++) {
      const f = {};
      LISTAS.forEach((k) => (f[ROT_LISTA[k]] = (LI[k] || [])[i] || ""));
      cat.push(f);
    }
    const wsl = XLSX.utils.json_to_sheet(cat, { header: LISTAS.map((k) => ROT_LISTA[k]) });
    wsl["!cols"] = LISTAS.map(() => ({ wch: 30 }));
    XLSX.utils.book_append_sheet(wb, wsl, "Catálogos");

    const wsk = XLSX.utils.json_to_sheet(CO.map((c) => ({
      "Título": c.titulo, "Categoría": c.categoria, "Síntomas": c.sintomas,
      "Preguntas de descarte": c.descarte, "Causa probable": c.causa,
      "Procedimiento": c.procedimiento, "Comandos": c.comandos, "Cuándo escalar": c.escalar,
    })), { header: ["Título", "Categoría", "Síntomas", "Preguntas de descarte", "Causa probable", "Procedimiento", "Comandos", "Cuándo escalar"] });
    wsk["!cols"] = [{ wch: 40 }, { wch: 20 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 60 }, { wch: 50 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsk, "Conocimiento");

    const wsu = XLSX.utils.json_to_sheet(US.map((u) => ({
      "ID de usuario": u.id, "Nombre completo": u.nombre, "Rol": u.rol,
      "Contraseña (huella)": u.hash, "Fecha de registro": u.fecha,
    })), { header: ["ID de usuario", "Nombre completo", "Rol", "Contraseña (huella)", "Fecha de registro"] });
    wsu["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 36 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsu, "Usuarios");

    const wsb = XLSX.utils.json_to_sheet(BI.map((b) => ({
      "Fecha y hora": b.fecha, "Usuario": b.usuario, "Acción": b.accion,
      "Referencia": b.referencia, "Detalle": b.detalle,
    })), { header: ["Fecha y hora", "Usuario", "Acción", "Referencia", "Detalle"] });
    wsb["!cols"] = [{ wch: 20 }, { wch: 26 }, { wch: 30 }, { wch: 16 }, { wch: 52 }];
    XLSX.utils.book_append_sheet(wb, wsb, "Bitácora");

    return wb;
  }

  async function escribir(h, d, li, co, us, bi, uni) {
    try {
      const buf = XLSX.write(construir(d, li, co, us, bi, uni), { bookType: "xlsx", type: "array" });
      if (esElectron) {
        const r = await window.gutic.escribir(h, buf);
        if (!r.ok) throw new Error(r.error || "fallo de escritura");
      } else {
        const w = await h.createWritable();
        await w.write(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
        await w.close();
      }
      setEstadoG("ok");
      setUltimo(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setEstadoG("error");
      avisar("No se pudo escribir en el Excel. Verifique que no esté abierto en Excel.", true);
    }
  }

  async function leer(h) {
    try {
      let bytes;
      if (esElectron) {
        const r = await window.gutic.leer(h);
        if (!r.ok) throw new Error(r.error || "fallo de lectura");
        bytes = new Uint8Array(r.bytes);
      } else {
        const f = await h.getFile();
        bytes = new Uint8Array(await f.arrayBuffer());
      }
      const wb = XLSX.read(bytes, { type: "array", cellDates: true });
      const D = VACIO();
      MODULOS.forEach((m) => {
        const mod = M[m];
        const hj = wb.SheetNames.find((x) => norm(x) === norm(mod.hoja));
        if (!hj) return;
        /* Se reconoce el encabezado actual y también los anteriores: un campo
           pudo cambiar de nombre y los Excel ya creados siguen abriendo.    */
        const porLabel = {};
        mod.campos.forEach(([k, l, , , o]) => {
          porLabel[norm(l)] = k;
          ((o && o.alias) || []).forEach((a) => { porLabel[norm(a)] = k; });
        });
        D[m] = XLSX.utils.sheet_to_json(wb.Sheets[hj], { defval: "", raw: false, cellDates: true })
          .map((row) => {
            const o = {}; mod.campos.forEach(([k, , t]) => (o[k] = t === "fotos" ? [] : t === "fotos_radio" ? null : ""));
            Object.entries(row).forEach(([c, v]) => {
              const k = porLabel[norm(c)];
              if (!k) return;
              const tipo = (mod.campos.find((x) => x[0] === k) || [])[2] || "";
              if (tipo === "fotos" || tipo === "fotos_radio") return;   /* se arman desde su hoja */
              o[k] = tipo === "fecha" ? dISO(v) : v;
            });
            return o;
          })
          .filter((o) => mod.campos.some(([k, , t]) => t !== "auto" && t !== "fotos" && t !== "fotos_radio" && String(o[k] || "").trim()));
      });

      /* Fotos: se juntan los trozos de cada imagen y se cuelgan del ticket que
         les corresponde por consecutivo. Si la hoja no existe —base de una
         versión anterior— simplemente no hay fotos y nada se rompe.        */
      const hf = wb.SheetNames.find((x) => norm(x) === norm(HOJA_FOTOS));
      if (hf) {
        const acum = {};
        XLSX.utils.sheet_to_json(wb.Sheets[hf], { defval: "", raw: false }).forEach((fl) => {
          const c = String(fl["Consecutivo"] || "").trim();
          const n = parseInt(fl["Número"], 10);
          if (!c || !n) return;
          const clave = c + "\u0001" + n;
          if (!acum[clave]) acum[clave] = { c, n, partes: [], ancho: +fl["Ancho"] || 0, alto: +fl["Alto"] || 0, tomada: String(fl["Tomada"] || "") };
          acum[clave].partes.push([parseInt(fl["Parte"], 10) || 1, String(fl["Datos"] || "")]);
        });
        const porConsec = {};
        Object.values(acum).forEach((x) => {
          const mini = x.partes.sort((a, b) => a[0] - b[0]).map((z) => z[1]).join("");
          if (!/^data:image\//.test(mini)) return;
          (porConsec[x.c] = porConsec[x.c] || []).push({ n: x.n, mini, ancho: x.ancho, alto: x.alto, tomada: x.tomada });
        });
        D.tickets = (D.tickets || []).map((r) => {
          const fs = porConsec[String(r.consecutivo || "").trim()];
          return fs ? { ...r, fotos: fs.sort((a, b) => a.n - b.n).map(({ n, ...f }) => f) } : r;
        });
      }

      /* Las tres fotos fijas de la revista de radios, por consecutivo y por
         ranura. Si la hoja no existe —base anterior a esta función— no hay
         fotos de radio y nada se rompe.                                     */
      const hfr = wb.SheetNames.find((x) => norm(x) === norm(HOJA_FOTOS_RADIO));
      if (hfr) {
        const acumR = {};
        XLSX.utils.sheet_to_json(wb.Sheets[hfr], { defval: "", raw: false }).forEach((fl) => {
          const c = String(fl["Consecutivo"] || "").trim();
          const s = String(fl["Ranura"] || "").trim();
          if (!c || !s) return;
          const clave = c + "\u0001" + s;
          if (!acumR[clave]) acumR[clave] = { c, s, partes: [], ancho: +fl["Ancho"] || 0, alto: +fl["Alto"] || 0, tomada: String(fl["Tomada"] || "") };
          acumR[clave].partes.push([parseInt(fl["Parte"], 10) || 1, String(fl["Datos"] || "")]);
        });
        const porConsecR = {};
        Object.values(acumR).forEach((x) => {
          const mini = x.partes.sort((a, b) => a[0] - b[0]).map((z) => z[1]).join("");
          if (!/^data:image\//.test(mini)) return;
          (porConsecR[x.c] = porConsecR[x.c] || {})[x.s] = { mini, ancho: x.ancho, alto: x.alto, tomada: x.tomada };
        });
        D.tickets = (D.tickets || []).map((r) => {
          const fr = porConsecR[String(r.consecutivo || "").trim()];
          return fr ? { ...r, fotos_radio: fr } : r;
        });
      }

      /* Con qué versión del catálogo base se guardó este archivo. Si es
         anterior a la actual, más abajo se le incorporan las categorías y los
         procedimientos que se agregaron después, sin tocar lo suyo.          */
      let vsem = "1.2";
      const hcf0 = wb.SheetNames.find((x) => norm(x) === norm("Configuración"));
      if (hcf0) XLSX.utils.sheet_to_json(wb.Sheets[hcf0], { defval: "" }).forEach((f4) => {
        if (norm(f4["Parámetro"] || "").indexOf("catalogo base") === 0) {
          const v = String(f4["Valor"] ?? "").trim(); if (v) vsem = v;
        }
      });
      const alDia = vsem >= SEMILLA_VERSION;

      const LI = LISTA_VACIA();
      const hcat = wb.SheetNames.find((x) => norm(x) === norm("Catálogos"));
      if (hcat) XLSX.utils.sheet_to_json(wb.Sheets[hcat], { defval: "" }).forEach((f2) => {
        LISTAS.forEach((k) => { const v = String(f2[ROT_LISTA[k]] || "").trim(); if (v) LI[k].push(v); });
      });
      /* Un catálogo nuevo que el Excel todavía no trae se siembra con los
         valores de partida, más lo que ya esté usado en los registros.      */
      Object.keys(SEMILLA_LISTA).forEach((k) => {
        if (LI[k].length) return;
        const campo = (M.tickets.campos.find((c) => c[2] === "lista:" + k) || [])[0];
        const usados = campo ? (D.tickets || []).map((r) => String(r[campo] || "").trim()).filter(Boolean) : [];
        LI[k] = [...SEMILLA_LISTA[k], ...usados];
      });
      /* Ampliación del catálogo base. Se revisan todas las versiones —no solo
         la más reciente— porque la comprobación es por si ya está, así que
         repetirla en un archivo que viene de más atrás no hace daño y evita
         llevar la cuenta de desde qué versión exacta partió cada uno.        */
      if (!alDia) [AMPLIACION_13, AMPLIACION_14].forEach((amp) => Object.keys(amp).forEach((k) => {
        if (!LI[k]) return;
        const hay = new Set(LI[k].map(norm));
        amp[k].forEach((v) => { if (!hay.has(norm(v))) LI[k].push(v); });
      }));
      LISTAS.forEach((k) => { LI[k] = [...new Set(LI[k])].sort(); });

      let CO = [];
      const hk = wb.SheetNames.find((x) => norm(x) === norm("Conocimiento"));
      if (hk) CO = XLSX.utils.sheet_to_json(wb.Sheets[hk], { defval: "" }).map((c) => ({
        titulo: String(c["Título"] || ""), categoria: String(c["Categoría"] || ""),
        sintomas: String(c["Síntomas"] || ""), descarte: String(c["Preguntas de descarte"] || ""),
        causa: String(c["Causa probable"] || ""), procedimiento: String(c["Procedimiento"] || ""),
        comandos: String(c["Comandos"] || ""), escalar: String(c["Cuándo escalar"] || ""),
      })).filter((c) => c.titulo);
      if (!CO.length) CO = CONOCIMIENTO;
      else if (!alDia) {
        const hay = new Set(CO.map((c) => norm(c.titulo)));
        CONOCIMIENTO_13.forEach((c) => { if (!hay.has(norm(c.titulo))) CO.push(c); });
      }

      let US = [];
      const hu = wb.SheetNames.find((x) => norm(x) === norm("Usuarios"));
      if (hu) US = XLSX.utils.sheet_to_json(wb.Sheets[hu], { defval: "" }).map((u) => ({
        id: String(u["ID de usuario"] || "").trim(), nombre: String(u["Nombre completo"] || "").trim(),
        rol: String(u["Rol"] || "Técnico").trim(), hash: String(u["Contraseña (huella)"] || "").trim(),
        fecha: String(u["Fecha de registro"] || "").trim(),
      })).filter((u) => u.id && u.hash);

      let BI = [];
      const hb = wb.SheetNames.find((x) => norm(x) === norm("Bitácora"));
      if (hb) BI = XLSX.utils.sheet_to_json(wb.Sheets[hb], { defval: "" }).map((b) => ({
        fecha: String(b["Fecha y hora"] || ""), usuario: String(b["Usuario"] || ""),
        accion: String(b["Acción"] || ""), referencia: String(b["Referencia"] || ""),
        detalle: String(b["Detalle"] || ""),
      })).filter((b) => b.fecha || b.accion);

      let uni = "", al = 4, sello = "";
      const hc = wb.SheetNames.find((x) => norm(x) === norm("Configuración"));
      if (hc) XLSX.utils.sheet_to_json(wb.Sheets[hc], { defval: "" }).forEach((f3) => {
        const p = norm(f3["Parámetro"] || ""), v = String(f3["Valor"] ?? "").trim();
        if (p.indexOf("unidad") === 0 && v && v !== "Sin definir") uni = v;
        if (p.indexOf("horas de alerta") === 0 && !isNaN(+v)) al = Math.max(1, +v);
        if (p === "sello de integridad" && /^[0-9a-f]{32}$/.test(v)) sello = v;
      });

      const manipulado = !!sello && sello !== selloDatos(D);
      if (manipulado) BI = [...BI, { fecha: ahora(), usuario: "(sistema)", accion: "Alerta de integridad",
        referencia: "", detalle: "Los registros no coinciden con el sello guardado: el archivo se editó fuera de la aplicación." }];

      primera.current = true;
      setDatos(D); setListas(LI); setConocimiento(CO); setUsuarios(US); setBitacora(BI);
      setUnidad(uni); setAlerta(al); setAlterado(manipulado);
      setEstadoG("ok"); setUltimo(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      avisar(manipulado ? "Atención: el Excel se modificó fuera de la aplicación." : "Base cargada correctamente", manipulado);
    } catch (e) {
      avisar("No se pudo leer el archivo. ¿Es una base de GUTIC?", true);
    }
  }

  async function crearBase(nombreUnidad) {
    const n = titulo(nombreUnidad);
    setUnidad(n);
    /* Los catálogos editables nacen con los valores de partida del código. */
    const LI0 = { ...listas };
    Object.keys(SEMILLA_LISTA).forEach((k) => { if (!(LI0[k] || []).length) LI0[k] = [...SEMILLA_LISTA[k]].sort(); });
    setListas(LI0);
    if (esElectron) {
      try {
        const r = await window.gutic.crear(n);
        setHandle(r.ruta); setArchivo(nombreArchivo(r.ruta));
        setConocimiento(CONOCIMIENTO);
        await escribir(r.ruta, VACIO(), LI0, CONOCIMIENTO, [], [], n);
        setIniciado(true);
        avisar("Base creada para " + n + " en " + r.ruta);
      } catch (e) { avisar("No se pudo crear el archivo.", true); }
      return;
    }
    if (!soporta) { setIniciado(true); avisar("Este navegador no permite guardado automático. Use Chrome o Edge.", true); return; }
    try {
      const h = await window.showSaveFilePicker({
        suggestedName: "GUTIC - " + n + ".xlsx",
        types: [{ description: "Libro de Excel", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }],
      });
      setHandle(h); setArchivo(h.name);
      try { await IDB.set("archivo", h); } catch (e) {}
      setConocimiento(CONOCIMIENTO);
      await escribir(h, VACIO(), LI0, CONOCIMIENTO, [], [], n);
      setIniciado(true);
      avisar("Base creada para " + n);
    } catch (e) { if (e.name !== "AbortError") avisar("No se pudo crear el archivo.", true); }
  }

  async function abrirBase() {
    if (esElectron) {
      try {
        const r = await window.gutic.elegirAbrir();
        if (!r) return;
        setHandle(r.ruta); setArchivo(nombreArchivo(r.ruta));
        await leer(r.ruta); setIniciado(true);
      } catch (e) { avisar("No se pudo abrir el archivo.", true); }
      return;
    }
    if (!soporta) return avisar("Use Chrome o Edge para abrir la base con guardado automático.", true);
    try {
      const [h] = await window.showOpenFilePicker({
        types: [{ description: "Libro de Excel", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }],
      });
      if (await h.requestPermission({ mode: "readwrite" }) !== "granted")
        return avisar("Se necesita permiso de escritura.", true);
      setHandle(h); setArchivo(h.name);
      try { await IDB.set("archivo", h); } catch (e) {}
      await leer(h); setIniciado(true);
    } catch (e) { if (e.name !== "AbortError") avisar("No se pudo abrir el archivo.", true); }
  }

  async function reconectar() {
    if (esElectron) return abrirBase();
    try {
      const h = await IDB.get("archivo");
      if (!h) return abrirBase();
      if (await h.requestPermission({ mode: "readwrite" }) !== "granted") return avisar("Permiso denegado.", true);
      setHandle(h); setArchivo(h.name); await leer(h); setIniciado(true);
    } catch (e) { abrirBase(); }
  }

  /* --------------------------- operaciones ------------------------------ */
  const consecutivo = (mod) => {
    const y = new Date().getFullYear(), pre = M[mod].prefijo;
    const n = (datos[mod] || []).reduce((mx, r) => {
      const m2 = String(r.consecutivo || "").match(new RegExp("^" + pre + "-" + y + "-(\\d+)$"));
      return m2 ? Math.max(mx, +m2[1]) : mx;
    }, 0);
    return pre + "-" + y + "-" + String(n + 1).padStart(4, "0");
  };

  function guardarRegistro(mod, i, d) {
    const quien = (sesion && sesion.nombre) || "";
    if (i === null) {
      const c = consecutivo(mod);
      const nuevo = { ...d, consecutivo: c, fecha_registro: ahora(), registrado_por: quien, modificado: ahora() + " · " + quien };
      if (mod === "tickets") {
        if (!nuevo.estado) nuevo.estado = "Nuevo";
        const a = ANS[nuevo.prioridad];
        if (a) nuevo.fecha_compromiso = selloISO(sumaHoras(new Date(), a.solucion));
      }
      setDatos((p) => ({ ...p, [mod]: [...p[mod], nuevo] }));
      anotar("Creó " + M[mod].singular, c, d.asunto || d.nombre || d.codigo || "");
      avisar(titulo(M[mod].singular) + " " + c + " guardado");
    } else {
      setDatos((p) => ({ ...p, [mod]: p[mod].map((r, k) => k === i ? { ...r, ...d, modificado: ahora() + " · " + quien } : r) }));
      anotar("Editó " + M[mod].singular, d.consecutivo || "", d.asunto || d.nombre || d.codigo || "");
    }
    setEdita(null);
  }

  /* alta en catálogos con control de parecido al 30 % */
  function crearEnLista(lista, nombre, forzar) {
    const n = titulo(nombre);
    if (n.length < 3) return { ok: false, msg: "Escriba al menos 3 letras." };
    const actual = listas[lista] || [];
    const exacta = actual.find((x) => norm(x) === norm(n));
    if (exacta) return { ok: true, valor: exacta };
    const p = revisarParecido(n, actual);
    if (p && !forzar) return { ok: false, confirmar: true, sugerida: p.texto, pct: p.pct,
      msg: "«" + n + "» coincide un " + p.pct + " % con «" + p.texto + "»." };
    setListas((prev) => ({ ...prev, [lista]: [...prev[lista], n].sort() }));
    anotar("Creó registro en " + ROT_LISTA[lista], "", n + (forzar && p ? " (pese al " + p.pct + " %)" : ""));
    return { ok: true, valor: n, nueva: true };
  }

  function registrarUsuario(id, nombre, clave, conf, forzar) {
    const i = String(id || "").trim().toLowerCase().replace(/\s+/g, "");
    const n = titulo(nombre);
    if (i.length < 3) return { ok: false, msg: "El ID debe tener al menos 3 caracteres." };
    if (!/^[a-z0-9._-]+$/.test(i)) return { ok: false, msg: "El ID solo admite letras, números, punto, guion y guion bajo." };
    if (n.length < 3) return { ok: false, msg: "Escriba el nombre completo." };
    if (String(clave).length < 6) return { ok: false, msg: "La contraseña debe tener al menos 6 caracteres." };
    if (clave !== conf) return { ok: false, msg: "La confirmación no coincide." };
    if (usuarios.some((u) => u.id.toLowerCase() === i)) return { ok: false, msg: "Ese ID ya está tomado." };
    const p = revisarParecido(n, usuarios.map((u) => u.nombre));
    if (p && !forzar) return { ok: false, confirmar: true, sugerida: p.texto, pct: p.pct,
      msg: "«" + n + "» coincide un " + p.pct + " % con el usuario «" + p.texto + "»." };
    const rol = usuarios.length ? "Técnico" : "Administrador";
    const u = { id: i, nombre: n, rol, hash: huella(i, clave), fecha: ahora() };
    setUsuarios((prev) => [...prev, u]);
    if (!(listas.tecnicos || []).some((x) => norm(x) === norm(n)))
      setListas((prev) => ({ ...prev, tecnicos: [...prev.tecnicos, n].sort() }));
    return { ok: true, usuario: u };
  }
  function entrarUsuario(id, clave) {
    const u = usuarios.find((x) => x.id.toLowerCase() === String(id || "").trim().toLowerCase());
    if (!u || huella(u.id, clave) !== u.hash) return { ok: false, msg: "ID de usuario o contraseña incorrectos." };
    return { ok: true, usuario: u };
  }

  const esAdmin = sesion && sesion.rol === "Administrador";

  const secciones = [...MODULOS.map((m) => [m, M[m].titulo, M[m].icono]),
    ["tablero", "Tablero", "▦"], ["asistente", "Asistente", "◉"],
    ["bitacora", "Bitácora", "≡"], ["ajustes", esAdmin ? "Ajustes" : "Ajustes 🔒", "⚙"]];
  const seccionActiva = secciones.find(([k]) => k === tab) || secciones[0];
  const pendGlobal = estadoGlobal(datos, alerta);

  useEffect(() => {
    if (!menuAbierto) return;
    const cerrar = (e) => { if (fabRef.current && !fabRef.current.contains(e.target)) setMenuAbierto(false); };
    const tecla = (e) => { if (e.key === "Escape") setMenuAbierto(false); };
    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("mousedown", cerrar); document.removeEventListener("keydown", tecla); };
  }, [menuAbierto]);

  /* ------------------------------ pantallas ----------------------------- */
  if (!iniciado) return (
    <div className="gu" style={{ "--fondo": "url(" + window.FONDO + ")" }}>
      <style>{CSS}</style>
      <Inicio arrancando={arrancando} soporta={soporta} hayPrevio={hayPrevio}
        onCrear={crearBase} onAbrir={abrirBase} onReconectar={reconectar} />
      {toast && <div className={"toast" + (toast.err ? " err" : "")}>{toast.m}</div>}
    </div>
  );

  const led = { ok: "#3FBF7F", guardando: T.oro2, pend: "#F0A94A", error: "#FF6B5A", nada: "#8592A6" }[estadoG];
  const ledTxt = { ok: "Guardado " + ultimo, guardando: "Guardando…", pend: "Sin guardar", error: "Error", nada: "Sin vincular" }[estadoG];

  return (
    <div className="gu" style={{ "--fondo": "url(" + window.FONDO + ")" }}>
      <style>{CSS}</style>

      <div className="rail">
        <div className="wrap">
          <div className="top">
            <div className="marca">
              <Emblema tam={58} />
              <div>
                <h1>GUTIC</h1>
                <div className="sub">
                  Gestión de mantenimiento · Redes y comunicaciones unificadas
                  {unidad && <> · <b>{unidad}</b></>}
                </div>
              </div>
            </div>
            <div className="row">
              {sesion && (
                <div className="estado">
                  <span className="led" style={{ background: esAdmin ? T.oro2 : "#3FBF7F" }} />
                  <span>{sesion.nombre} · {sesion.rol}</span>
                </div>
              )}
              <div className="estado">
                <span className="led" style={{ background: led }} />
                <span>{ledTxt}</span>
              </div>
              {handle && <button className="btn claro" onClick={() => escribir(handle)}>Guardar</button>}
            </div>
          </div>
          <div className="seccion-activa">
            <span className="ic">{seccionActiva[2]}</span>{seccionActiva[1]}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 16 }}>
        {alterado && (
          <div className="panel" style={{ padding: 14, marginBottom: 12, borderLeft: "4px solid " + T.bad, fontSize: 13.5 }}>
            <b style={{ color: T.bad }}>Alerta de integridad.</b> Los registros no coinciden con el sello guardado
            por la aplicación: el Excel se editó por fuera. Revise la bitácora.
            <button className="btn ghost" onClick={() => setAlterado(false)}>Entendido</button>
          </div>
        )}

        {MODULOS.indexOf(tab) >= 0 && (
          <Modulo mod={tab} filas={datos[tab] || []} listas={listas} infra={datos.infraestructura}
            alerta={alerta} conocimiento={conocimiento} unidad={unidad} sesion={sesion}
            onNuevo={() => setEdita({ mod: tab, i: null, r: {} })}
            onEditar={(i, r) => setEdita({ mod: tab, i, r })} />
        )}

        {tab === "tablero" && <Tablero datos={datos} alerta={alerta} />}
        {tab === "asistente" && <Asistente conocimiento={conocimiento} setConocimiento={setConocimiento}
          esAdmin={esAdmin} anotar={anotar} />}
        {tab === "bitacora" && <Bitacora bitacora={bitacora} />}
        {tab === "ajustes" && (esAdmin ? (
          <Ajustes {...{ unidad, setUnidad, alerta, setAlerta, listas, crearEnLista, usuarios, setUsuarios,
            sesion, archivo, handle, abrirBase, anotar }} />
        ) : (
          <div className="panel" style={{ padding: 30, textAlign: "center", maxWidth: 500, margin: "20px auto" }}>
            <div style={{ fontSize: 30 }}>🔒</div>
            <h2 style={{ fontSize: 20, margin: "12px 0 8px", color: T.grafito2 }}>Área restringida</h2>
            <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Solo los usuarios con rol Administrador pueden cambiar la configuración, los catálogos
              y los usuarios del sistema.
            </p>
          </div>
        ))}
      </div>

      {!sesion && (
        <Acceso usuarios={usuarios} unidad={unidad} archivo={archivo}
          total={MODULOS.reduce((a, m) => a + (datos[m] || []).length, 0)}
          onRegistrar={registrarUsuario} onEntrar={entrarUsuario}
          onListo={(u) => {
            setSesion(u);
            setBitacora((p) => [...p, { fecha: ahora(), usuario: u.nombre, accion: "Inició sesión",
              referencia: u.id, detalle: u.rol + " · " + (archivo || "") }]);
          }} />
      )}

      {edita && (
        <FormRegistro edita={edita} listas={listas} infra={datos.infraestructura}
          crearEnLista={crearEnLista} conocimiento={conocimiento} avisar={avisar}
          onCancel={() => setEdita(null)}
          onSave={(d) => guardarRegistro(edita.mod, edita.i, d)} />
      )}

      <div className="fab-wrap" ref={fabRef}>
        {menuAbierto && (
          <div className="fab-menu" role="menu">
            {secciones.map(([k, l, ic]) => (
              <button key={k} role="menuitem" className={"fab-item" + (tab === k ? " activo" : "")}
                onClick={() => { setTab(k); setMenuAbierto(false); }}>
                <span className="ic">{ic}</span><span className="l">{l}</span>
                {MODULOS.indexOf(k) >= 0 && <span className="mono n">{(datos[k] || []).length}</span>}
              </button>
            ))}
          </div>
        )}
        <button className="fab" aria-expanded={menuAbierto} aria-label="Abrir menú de secciones"
          title={pendGlobal.nivel
            ? "Pendientes — rojo: " + pendGlobal.conteo.rojo + " · amarillo: " + pendGlobal.conteo.amarillo + " · verde: " + pendGlobal.conteo.verde
            : "Sin pendientes urgentes"}
          onClick={() => setMenuAbierto((v) => !v)}>
          <span className="ic">{seccionActiva[2]}</span>
          {pendGlobal.nivel && <span className={"fab-punto " + pendGlobal.nivel} />}
        </button>
      </div>

      {toast && <div className={"toast" + (toast.err ? " err" : "")}>{toast.m}</div>}
    </div>
  );
}
