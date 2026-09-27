/* ---------------------------- pantalla de inicio -------------------------- */
const UNIDADES = ["Tecnologías DINCO", "Dirección de Incorporación", "Redes y Comunicaciones",
  "Mesa de Ayuda", "Seguridad de la Información", "Jefatura"];

function Inicio({ arrancando, soporta, hayPrevio, onCrear, onAbrir, onReconectar }) {
  const [modo, setModo] = useState(null);
  const [n, setN] = useState("");
  const listo = titulo(n).length >= 3;

  if (arrancando) return (
    <div className="wrap" style={{ maxWidth: 620, paddingTop: 90, textAlign: "center" }}>
      <div className="eyebrow">Verificando si hay una base vinculada…</div>
    </div>
  );

  return (
    <div className="wrap" style={{ maxWidth: 800, paddingTop: 44 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Emblema tam={96} />
        <h1 style={{ color: "#fff", fontSize: 42, marginTop: 14, letterSpacing: ".08em",
          textShadow: "0 2px 18px rgba(0,0,0,.6)" }}>GUTIC</h1>
        <div style={{ color: "#9FE0D6", fontSize: 14, marginTop: 8, fontWeight: 600,
          fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".05em" }}>
          Gestión de mantenimiento de redes y comunicaciones unificadas
        </div>
        <div style={{ color: "#8EA3B5", fontSize: 12, marginTop: 6 }}>Policía Nacional de Colombia</div>
      </div>

      {modo !== "nueva" ? (
        <>
          <div className="grid">
            <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
              <div className="eyebrow">Primera vez</div>
              <h2 style={{ fontSize: 22, margin: "8px 0 10px", color: T.grafito2 }}>Crear la base de datos</h2>
              <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, flex: 1 }}>
                Indique la unidad y elija dónde guardar el Excel. Si lo pone en la carpeta de OneDrive,
                queda sincronizado y disponible desde la oficina y desde la casa.
              </p>
              <button className="btn oro" style={{ width: "100%", marginTop: 14 }} onClick={() => setModo("nueva")}>
                Crear base nueva
              </button>
            </div>
            <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
              <div className="eyebrow">Ya tengo el archivo</div>
              <h2 style={{ fontSize: 22, margin: "8px 0 10px", color: T.grafito2 }}>Abrir una base existente</h2>
              <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, flex: 1 }}>
                Busque el archivo donde lo tenga guardado. La aplicación lee la unidad, los catálogos,
                los usuarios y la base de conocimiento desde el mismo Excel.
              </p>
              <button className="btn teal" style={{ width: "100%", marginTop: 14 }} onClick={onAbrir}>
                Seleccionar el Excel
              </button>
            </div>
          </div>
          {hayPrevio && (
            <div className="panel" style={{ padding: 14, marginTop: 12, display: "flex", gap: 12,
              flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13.5 }}>Última base usada en este equipo: <b>{hayPrevio}</b></div>
              <button className="btn mini" onClick={onReconectar}>Reconectar</button>
            </div>
          )}
          {!soporta && (
            <div className="panel" style={{ padding: 14, marginTop: 12, borderLeft: "4px solid " + T.bad, fontSize: 13.5 }}>
              Este navegador no permite escribir archivos. Para el guardado automático use
              <b> Google Chrome</b> o <b>Microsoft Edge</b>.
            </div>
          )}
        </>
      ) : (
        <div className="panel" style={{ padding: 22, maxWidth: 560, margin: "0 auto" }}>
          <div className="eyebrow">Paso 1 de 2 · Base nueva</div>
          <h2 style={{ fontSize: 22, margin: "8px 0 10px", color: T.grafito2 }}>¿Qué unidad usará GUTIC?</h2>
          <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
            El nombre aparece en el encabezado y queda guardado dentro del Excel, en la hoja
            Configuración. Si se pierde este archivo HTML, al abrir el Excel la aplicación reconoce
            sola a qué unidad pertenece la base.
          </p>
          <label className="f req">Unidad o dependencia</label>
          <input list="dl-uni" value={n} autoFocus onChange={(e) => setN(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && listo && onCrear(n)}
            placeholder="Ejemplo: Redes y Comunicaciones" />
          <datalist id="dl-uni">{UNIDADES.map((o) => <option key={o} value={o} />)}</datalist>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
            {UNIDADES.slice(0, 4).map((o) => (
              <button key={o} className="btn mini" onClick={() => setN(o)}>{o}</button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 20, justifyContent: "space-between" }}>
            <button className="btn ghost" onClick={() => setModo(null)}>Volver</button>
            <button className="btn oro" disabled={!listo} onClick={() => onCrear(n)}>
              Continuar y elegir dónde guardar
            </button>
          </div>
        </div>
      )}
      <p style={{ textAlign: "center", color: "#8EA3B5", fontSize: 11.5, marginTop: 26 }}>
        La información no sale de su equipo: todo se procesa en el navegador y se guarda solo en el
        Excel que usted elija.
      </p>
    </div>
  );
}

/* ------------------------------- acceso ---------------------------------- */
function Acceso({ usuarios, unidad, archivo, total, onRegistrar, onEntrar, onListo }) {
  const primera = !usuarios.length;
  const [modo, setModo] = useState(primera ? "registro" : "entrar");
  const [id, setId] = useState(""), [clave, setClave] = useState("");
  const [nombre, setNombre] = useState(""), [conf, setConf] = useState("");
  const [ver, setVer] = useState(false), [msg, setMsg] = useState(null);

  const accion = (forzar) => {
    const r = modo === "entrar" ? onEntrar(id, clave) : onRegistrar(id, nombre, clave, conf, forzar);
    if (!r.ok) return setMsg(r);
    onListo(r.usuario);
  };

  return (
    <div className="modal">
      <div className="sheet" style={{ maxWidth: 520 }}>
        <div className="cab">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
              color: "#9FE0D6", fontFamily: "'JetBrains Mono',monospace" }}>Acceso a GUTIC</div>
            <h2>{modo === "entrar" ? "Iniciar sesión" : "Registrarse"}</h2>
          </div>
          <Emblema tam={40} />
        </div>
        <div className="cuerpo">
          <div style={{ background: "#F2F6F8", border: "1px solid " + T.line, borderRadius: 7,
            padding: 12, marginBottom: 16, fontSize: 12.5, lineHeight: 1.7 }}>
            <div><b>Unidad:</b> {unidad || "sin definir"}</div>
            <div><b>Archivo:</b> <span className="mono">{archivo || "sin vincular"}</span></div>
            <div><b>Registros:</b> <span className="mono">{total}</span> · <b>Usuarios:</b> <span className="mono">{usuarios.length}</span></div>
          </div>
          {primera && (
            <div style={{ background: "#FFF8E8", border: "1px solid #E8C97A", borderRadius: 7,
              padding: 11, marginBottom: 16, fontSize: 12.5, lineHeight: 1.55 }}>
              Esta base aún no tiene usuarios. El primero en registrarse queda como <b>Administrador</b>.
            </div>
          )}
          {!primera && (
            <div className="row" style={{ marginBottom: 16 }}>
              <button className={"btn mini" + (modo === "entrar" ? " teal" : "")}
                onClick={() => { setModo("entrar"); setMsg(null); }}>Iniciar sesión</button>
              <button className={"btn mini" + (modo === "registro" ? " teal" : "")}
                onClick={() => { setModo("registro"); setMsg(null); }}>Registrarse</button>
            </div>
          )}

          <label className="f req">ID de usuario</label>
          <input value={id} autoFocus autoComplete="off" placeholder="Ejemplo: hrojas"
            onChange={(e) => { setId(e.target.value); setMsg(null); }}
            onKeyDown={(e) => e.key === "Enter" && modo === "entrar" && accion(false)} />

          {modo === "registro" && (
            <>
              <label className="f req" style={{ marginTop: 12 }}>Nombre completo</label>
              <input value={nombre} onChange={(e) => { setNombre(e.target.value); setMsg(null); }}
                placeholder="Nombres y apellidos" />
            </>
          )}

          <label className="f req" style={{ marginTop: 12 }}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input type={ver ? "text" : "password"} value={clave} autoComplete="off" style={{ paddingRight: 76 }}
              onChange={(e) => { setClave(e.target.value); setMsg(null); }}
              onKeyDown={(e) => e.key === "Enter" && modo === "entrar" && accion(false)} />
            <button className="btn ghost" style={{ position: "absolute", right: 4, top: 5, fontSize: 12 }}
              onClick={() => setVer(!ver)}>{ver ? "Ocultar" : "Ver"}</button>
          </div>

          {modo === "registro" && (
            <>
              <label className="f req" style={{ marginTop: 12 }}>Confirmar contraseña</label>
              <input type="password" value={conf} autoComplete="off"
                onChange={(e) => { setConf(e.target.value); setMsg(null); }} />
              <div className="hint">Mínimo 6 caracteres. Se guarda como huella, nunca en texto legible.</div>
            </>
          )}

          {msg && !msg.confirmar && <p style={{ color: T.bad, fontSize: 13, marginTop: 14, marginBottom: 0 }}>{msg.msg}</p>}
          {msg && msg.confirmar && (
            <div style={{ marginTop: 14, background: "#FFF8E8", border: "1px solid #E8C97A", borderRadius: 7, padding: 11 }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                <b style={{ color: T.warn }}>Posible duplicado.</b> {msg.msg} ¿Registrarse de todos modos?
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn mini" onClick={() => accion(true)}>Sí, registrarme</button>
                <button className="btn ghost" onClick={() => { setModo("entrar"); setMsg(null); }}>Ya tengo cuenta</button>
              </div>
            </div>
          )}

          <button className="btn oro" style={{ width: "100%", marginTop: 18 }} onClick={() => accion(false)}>
            {modo === "entrar" ? "Entrar" : "Crear mi usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- componentes de campo -------------------------- */
function CampoLista({ l, req, full, valor, lista, onCambio, onCrear, placeholder }) {
  const [modo, setModo] = useState(false), [txt, setTxt] = useState(""), [aviso, setAviso] = useState(null);
  function intentar(forzar) {
    const r = onCrear(txt, forzar);
    if (r.ok) { onCambio(r.valor); setModo(false); setTxt(""); setAviso(null); return; }
    setAviso(r);
  }
  return (
    <div className={full ? "full" : ""}>
      <label className={"f" + (req ? " req" : "")}>{l}</label>
      <select value={modo ? "__nuevo__" : valor || ""} onChange={(e) => {
        const v = e.target.value; setAviso(null);
        if (v === "__nuevo__") { setModo(true); onCambio(""); } else { setModo(false); setTxt(""); onCambio(v); }
      }}>
        <option value="">{lista.length ? "— Seleccione —" : "— Aún no hay registros —"}</option>
        {lista.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__nuevo__">+ Otro: registrar uno nuevo…</option>
      </select>
      {modo && (
        <div style={{ marginTop: 9 }}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input value={txt} autoFocus placeholder={placeholder}
              onChange={(e) => { setTxt(e.target.value); setAviso(null); }}
              onKeyDown={(e) => e.key === "Enter" && intentar(false)} />
            <button className="btn mini" onClick={() => intentar(false)}>Agregar</button>
          </div>
          {aviso && !aviso.confirmar && <div className="hint" style={{ color: T.bad }}>{aviso.msg}</div>}
          {aviso && aviso.confirmar && (
            <div style={{ marginTop: 9, background: "#FFF8E8", border: "1px solid #E8C97A", borderRadius: 7, padding: 11 }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                <b style={{ color: T.warn }}>Posible duplicado.</b> {aviso.msg} ¿Registrar uno nuevo de todos modos?
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn mini teal" onClick={() => { onCambio(aviso.sugerida); setModo(false); setTxt(""); setAviso(null); }}>
                  Usar «{aviso.sugerida}»
                </button>
                <button className="btn mini" onClick={() => intentar(true)}>Sí, agregar</button>
                <button className="btn ghost" onClick={() => { setModo(false); setTxt(""); setAviso(null); }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ cámara en vivo ---------------------------- */
/* El atributo capture de un campo de archivo solo abre la cámara en el
   celular; en un computador el navegador lo ignora y muestra el selector de
   archivos. Por eso aquí se abre la cámara de verdad con getUserMedia, que
   funciona igual en el portátil, en la tableta y en el celular. Si el
   navegador no la ofrece o el usuario niega el permiso, queda el selector de
   archivos como salida.                                                     */
function hayCamara() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === "function";
}

function CamaraFoto({ restantes, onListo, onCerrar }) {
  const vRef = useRef(null);
  const flujo = useRef(null);
  const [estado, setEstado] = useState("abriendo");   /* abriendo | lista | error */
  const [error, setError] = useState("");
  const [equipos, setEquipos] = useState([]);
  const [cual, setCual] = useState(0);
  const [frontal, setFrontal] = useState(false);
  const [tomadas, setTomadas] = useState([]);         /* {archivo, url} */

  function apagar() {
    if (flujo.current) { flujo.current.getTracks().forEach((t) => t.stop()); flujo.current = null; }
    if (vRef.current) vRef.current.srcObject = null;
  }

  async function encender(id) {
    apagar();
    setEstado("abriendo"); setError("");
    const base = { width: { ideal: 2560 }, height: { ideal: 1440 } };
    const pedido = id ? { ...base, deviceId: { exact: id } }
                      : { ...base, facingMode: { ideal: "environment" } };
    try {
      const f = await navigator.mediaDevices.getUserMedia({ video: pedido, audio: false });
      flujo.current = f;
      if (vRef.current) { vRef.current.srcObject = f; await vRef.current.play().catch(() => {}); }
      const t = f.getVideoTracks()[0];
      const s = t && t.getSettings ? t.getSettings() : {};
      setFrontal(String(s.facingMode || "") === "user");
      setEstado("lista");
      /* Los nombres de las cámaras solo se conocen después de conceder el
         permiso; por eso la lista se arma aquí y no antes.                  */
      try {
        const ds = await navigator.mediaDevices.enumerateDevices();
        const vs = ds.filter((d) => d.kind === "videoinput");
        setEquipos(vs);
        const i = vs.findIndex((d) => d.deviceId === s.deviceId);
        if (i >= 0) setCual(i);
      } catch (e) { /* sin lista de equipos */ }
    } catch (e) {
      const n = (e && e.name) || "";
      setEstado("error");
      setError(
        n === "NotAllowedError" || n === "SecurityError"
          ? "El navegador no autorizó el uso de la cámara. Busque el icono de la cámara en la barra de direcciones, elija «Permitir» y vuelva a intentarlo."
        : n === "NotFoundError" || n === "OverconstrainedError"
          ? "No se encontró ninguna cámara conectada a este equipo."
        : n === "NotReadableError"
          ? "La cámara está siendo usada por otro programa. Cierre la videollamada o la aplicación que la tenga abierta y vuelva a intentarlo."
          : "No se pudo abrir la cámara de este equipo."
      );
    }
  }

  useEffect(() => { encender(null); return apagar; }, []);

  function cambiar() {
    if (equipos.length < 2) return;
    const i = (cual + 1) % equipos.length;
    setCual(i); encender(equipos[i].deviceId);
  }

  /* Se captura el cuadro al tamaño real del sensor; la reducción a la medida
     del informe la hace después el mismo camino que ya usan los archivos.   */
  function capturar() {
    const v = vRef.current;
    if (!v || !v.videoWidth || tomadas.length >= restantes) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((b) => {
      if (!b) return;
      const nombre = "captura-" + Date.now() + ".jpg";
      const archivo = new File([b], nombre, { type: "image/jpeg" });
      setTomadas((t) => [...t, { archivo, url: URL.createObjectURL(b) }]);
    }, "image/jpeg", 0.92);
  }

  const quitar = (i) => setTomadas((t) => {
    try { URL.revokeObjectURL(t[i].url); } catch (e) { /* nada */ }
    return t.filter((_, k) => k !== i);
  });

  function cerrar() {
    apagar();
    tomadas.forEach((t) => { try { URL.revokeObjectURL(t.url); } catch (e) { /* nada */ } });
    onCerrar();
  }

  function usar() {
    apagar();
    const archivos = tomadas.map((t) => t.archivo);
    tomadas.forEach((t) => { try { URL.revokeObjectURL(t.url); } catch (e) { /* nada */ } });
    onListo(archivos);
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="sheet" style={{ maxWidth: 760 }}>
        <div className="cab">
          <h2>Tomar foto</h2>
          <button className="btn ghost" onClick={cerrar}>✕ Cerrar</button>
        </div>
        <div className="cuerpo">
          <div className={"cam-vista" + (frontal ? " espejo" : "")}>
            <video ref={vRef} playsInline muted
              style={{ display: estado === "lista" ? "block" : "none" }} />
            {estado === "abriendo" && <div className="cam-aviso">Abriendo la cámara…</div>}
            {estado === "error" && (
              <div className="cam-aviso">
                <b>No fue posible usar la cámara</b>
                {error}
              </div>
            )}
          </div>

          <div className="cam-barra">
            <button className="btn teal" disabled={estado !== "lista" || tomadas.length >= restantes}
              onClick={capturar}>◉ Capturar</button>
            {equipos.length > 1 && (
              <button className="btn" disabled={estado === "abriendo"} onClick={cambiar}>
                ⇄ Cambiar cámara
              </button>
            )}
            {estado === "error" && (
              <button className="btn" onClick={() => encender(null)}>Reintentar</button>
            )}
            <span className="crece" />
            <span className="hint" style={{ margin: 0 }}>
              {tomadas.length} de {restantes} disponibles
            </span>
          </div>

          {tomadas.length > 0 && (
            <div className="cam-tomadas">
              {tomadas.map((t, i) => (
                <figure key={i}>
                  <img src={t.url} alt={"Captura " + (i + 1)} />
                  <button title="Descartar esta captura" onClick={() => quitar(i)}>✕</button>
                </figure>
              ))}
            </div>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn teal" disabled={!tomadas.length} onClick={usar}>
              Agregar {tomadas.length || ""} {tomadas.length === 1 ? "foto" : "fotos"}
            </button>
            <button className="btn" onClick={cerrar}>Cancelar</button>
          </div>

          <div className="hint">
            La primera vez el navegador pide permiso para usar la cámara: hay que aceptarlo.
            Si el equipo tiene varias cámaras, el botón de cambiar pasa de una a otra.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ fotos de la revista de radios ------------------- */
/* El formato físico exige tres fotos puntuales por radio, no un álbum libre:
   el radio completo, su serial y la lectura del serial con el software de
   programación. Cada ranura se llena, repite o quita por separado; la cámara
   es la misma que usa la revista de equipos.                                */
function CampoFotosRadio({ valor, onCambio, consecutivo, avisar }) {
  const v = valor && typeof valor === "object" ? valor : {};
  const [ocupado, setOcupado] = useState(null);   /* clave de la ranura en proceso */
  const [camaraEn, setCamaraEn] = useState(null);  /* clave de la ranura con la cámara abierta */
  const refs = useRef({});

  async function asignar(clave, archivo) {
    if (!archivo || !/^image\//.test(archivo.type)) return;
    setOcupado(clave);
    try {
      const mini = await reducirFoto(archivo, FOTO_LADO, FOTO_CALIDAD);
      const full = await leerComoDataURL(archivo);
      onCambio({ ...v, [clave]: { mini: mini.datos, ancho: mini.ancho, alto: mini.alto, full, tomada: ahora() } });
    } catch (e) { avisar && avisar("No se pudo leer la imagen.", true); }
    setOcupado(null);
  }

  const quitar = (clave) => { const n = { ...v }; delete n[clave]; onCambio(n); };
  const archivo = (clave) => consecutivo ? nombreFoto(consecutivo, clave) : "Radio-sin-guardar-" + clave + ".jpg";
  const conOriginal = SLOTS_FOTO_RADIO.filter((s) => v[s.clave] && v[s.clave].full);
  const hayCarpeta = typeof window !== "undefined" && !!window.showDirectoryPicker;
  const conCamara = hayCamara();

  function abrir(clave) {
    if (conCamara) return setCamaraEn(clave);
    avisar && avisar("Este navegador no permite abrir la cámara; se abrirá el selector de archivos.", true);
    refs.current[clave] && refs.current[clave].click();
  }

  function descargarOriginales() {
    if (!conOriginal.length) return avisar && avisar("Los originales solo están disponibles en la sesión en que se tomaron las fotos.", true);
    conOriginal.forEach((s, i) => {
      const b = aBlob(v[s.clave].full);
      if (b) setTimeout(() => descargarBlob(b, archivo(s.clave)), i * 350);
    });
    avisar && avisar("Descargando " + conOriginal.length + " originales…");
  }

  async function guardarEnCarpeta() {
    if (!conOriginal.length) return avisar && avisar("Los originales solo están disponibles en la sesión en que se tomaron las fotos.", true);
    try {
      let dir = null;
      try { dir = await IDB.get("carpetaFotos"); } catch (e) { /* sin idb */ }
      if (dir && (await dir.queryPermission({ mode: "readwrite" })) !== "granted") {
        if ((await dir.requestPermission({ mode: "readwrite" })) !== "granted") dir = null;
      }
      if (!dir) {
        dir = await window.showDirectoryPicker({ mode: "readwrite" });
        try { await IDB.set("carpetaFotos", dir); } catch (e) { /* sin idb */ }
      }
      let n = 0;
      for (const s of conOriginal) {
        const b = aBlob(v[s.clave].full);
        if (!b) continue;
        const h = await dir.getFileHandle(archivo(s.clave), { create: true });
        const w = await h.createWritable();
        await w.write(b); await w.close();
        n++;
      }
      avisar && avisar(n + " originales guardados en la carpeta elegida.");
    } catch (e) {
      if (e && e.name !== "AbortError") avisar && avisar("No se pudieron guardar los originales en la carpeta.", true);
    }
  }

  return (
    <div className="full">
      <label className="f">Álbum fotográfico del radio</label>
      <div className="fotos-radio">
        {SLOTS_FOTO_RADIO.map((s) => {
          const f = v[s.clave];
          return (
            <div className="foto-radio" key={s.clave}>
              <div className="fr-etq">{s.etiqueta}</div>
              <div className="fr-caja">
                {f ? <img src={f.mini} alt={s.etiqueta} /> : <div className="fr-vacia">Sin foto</div>}
              </div>
              <input ref={(el) => (refs.current[s.clave] = el)} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { asignar(s.clave, e.target.files[0]); e.target.value = ""; }} />
              <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <button className="btn mini teal" disabled={ocupado === s.clave} onClick={() => abrir(s.clave)}>
                  ⛶ {f ? "Repetir" : "Tomar foto"}
                </button>
                <button className="btn mini" disabled={ocupado === s.clave} onClick={() => refs.current[s.clave].click()}>
                  Archivo
                </button>
                {f && <button className="btn mini ghost" onClick={() => quitar(s.clave)}>Quitar</button>}
              </div>
              {ocupado === s.clave && <div className="hint" style={{ margin: "6px 0 0" }}>Procesando…</div>}
            </div>
          );
        })}
      </div>

      {conOriginal.length > 0 && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn mini" onClick={descargarOriginales}>
            ↓ Descargar originales ({conOriginal.length})
          </button>
          {hayCarpeta && (
            <button className="btn mini" onClick={guardarEnCarpeta}>Guardar en carpeta</button>
          )}
        </div>
      )}

      {camaraEn && (
        <CamaraFoto
          restantes={1}
          onCerrar={() => setCamaraEn(null)}
          onListo={(archivos) => { const a = archivos[0]; setCamaraEn(null); if (a) asignar(camaraEn, a); }} />
      )}

      <div className="hint">
        {consecutivo
          ? <>Se nombran con el consecutivo del registro: <span className="mono">{nombreFoto(consecutivo, "completo")}</span>…</>
          : <>El consecutivo se asigna al guardar, y con él quedan nombradas las fotos.</>}
        {" "}Dentro del Excel se guarda una copia reducida a {FOTO_LADO} px; el original queda
        disponible para descargar desde la ficha del registro.
      </div>
    </div>
  );
}

/* --------------------------- fotos de la revista -------------------------- */
/* «Tomar foto» abre la cámara del equipo, sea computador, tableta o celular.
   Donde el navegador no lo permita, se avisa y queda el selector de archivos,
   que además sirve siempre para adjuntar fotos ya tomadas.                   */
function CampoFotos({ valor, onCambio, consecutivo, avisar }) {
  const fotos = Array.isArray(valor) ? valor : [];
  const [ocupado, setOcupado] = useState(false);
  const [camara, setCamara] = useState(false);
  const camRef = useRef(null), arcRef = useRef(null);
  const libres = FOTOS_MAX - fotos.length;
  const conCamara = hayCamara();

  async function agregar(lista) {
    const archivos = [...(lista || [])].filter((x) => /^image\//.test(x.type));
    if (!archivos.length) return;
    if (!libres) return avisar && avisar("Ya hay " + FOTOS_MAX + " fotos en este registro.", true);
    setOcupado(true);
    const nuevas = [];
    for (const f of archivos.slice(0, libres)) {
      try {
        const mini = await reducirFoto(f, FOTO_LADO, FOTO_CALIDAD);
        nuevas.push({
          mini: mini.datos, ancho: mini.ancho, alto: mini.alto,
          full: await leerComoDataURL(f),          /* original, solo en memoria */
          tomada: ahora(),
        });
      } catch (e) { avisar && avisar("No se pudo leer una de las imágenes.", true); }
    }
    setOcupado(false);
    if (nuevas.length) onCambio([...fotos, ...nuevas]);
    if (archivos.length > libres) avisar && avisar("Solo caben " + FOTOS_MAX + " fotos; se agregaron las primeras.", true);
  }

  const quitar = (i) => onCambio(fotos.filter((_, k) => k !== i));

  /* Los originales no caben en el Excel y no viajan con él: se entregan aparte.
     En el celular la única vía es la descarga; en Chrome o Edge de escritorio
     se puede escribir directamente en una carpeta, que la aplicación recuerda
     para no volver a preguntarla.                                            */
  const conOriginal = fotos.filter((f) => f.full);
  const hayCarpeta = typeof window !== "undefined" && !!window.showDirectoryPicker;
  /* Hasta que el registro no se guarda no hay consecutivo, así que las fotos
     llevan un nombre provisional y se renombran solas al guardar.           */
  const rotulo = (i) => (consecutivo ? nombreFoto(consecutivo, i + 1) : "Foto " + (i + 1));
  const archivo = (i) => (consecutivo ? nombreFoto(consecutivo, i + 1) : "Revista-sin-guardar-" + (i + 1) + ".jpg");

  function descargarOriginales() {
    if (!conOriginal.length) return avisar && avisar("Los originales solo están disponibles en la sesión en que se tomaron las fotos.", true);
    conOriginal.forEach((f, i) => {
      const b = aBlob(f.full);
      if (b) setTimeout(() => descargarBlob(b, archivo(fotos.indexOf(f))), i * 350);
    });
    avisar && avisar("Descargando " + conOriginal.length + " originales…");
  }

  async function guardarEnCarpeta() {
    if (!conOriginal.length) return avisar && avisar("Los originales solo están disponibles en la sesión en que se tomaron las fotos.", true);
    try {
      let dir = null;
      try { dir = await IDB.get("carpetaFotos"); } catch (e) { /* sin idb */ }
      if (dir && (await dir.queryPermission({ mode: "readwrite" })) !== "granted") {
        if ((await dir.requestPermission({ mode: "readwrite" })) !== "granted") dir = null;
      }
      if (!dir) {
        dir = await window.showDirectoryPicker({ mode: "readwrite" });
        try { await IDB.set("carpetaFotos", dir); } catch (e) { /* sin idb */ }
      }
      let n = 0;
      for (const f of conOriginal) {
        const b = aBlob(f.full);
        if (!b) continue;
        const h = await dir.getFileHandle(archivo(fotos.indexOf(f)), { create: true });
        const w = await h.createWritable();
        await w.write(b); await w.close();
        n++;
      }
      avisar && avisar(n + " originales guardados en la carpeta elegida.");
    } catch (e) {
      if (e && e.name !== "AbortError") avisar && avisar("No se pudieron guardar los originales en la carpeta.", true);
    }
  }

  return (
    <div className="full">
      <label className="f">Fotos de la revista · {fotos.length} de {FOTOS_MAX}</label>

      <input ref={camRef} type="file" accept="image/*" capture="environment" multiple
        style={{ display: "none" }}
        onChange={(e) => { agregar(e.target.files); e.target.value = ""; }} />
      <input ref={arcRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={(e) => { agregar(e.target.files); e.target.value = ""; }} />

      <div className="row">
        <button className="btn teal" disabled={ocupado || !libres}
          onClick={() => {
            if (conCamara) return setCamara(true);
            /* Navegador sin acceso a la cámara: en el celular el campo de
               archivo con capture todavía la abre; en el computador mostrará
               el selector, y así se le advierte al usuario.                 */
            avisar && avisar("Este navegador no permite abrir la cámara; se abrirá el selector de archivos.", true);
            camRef.current.click();
          }}>
          ⛶ Tomar foto
        </button>
        <button className="btn" disabled={ocupado || !libres} onClick={() => arcRef.current.click()}>
          Elegir archivo
        </button>
        {ocupado && <span className="hint" style={{ margin: 0 }}>Procesando…</span>}
      </div>

      {camara && (
        <CamaraFoto
          restantes={libres}
          onCerrar={() => setCamara(false)}
          onListo={(archivos) => { setCamara(false); agregar(archivos); }} />
      )}

      {conOriginal.length > 0 && (
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn mini" onClick={descargarOriginales}>
            ↓ Descargar originales ({conOriginal.length})
          </button>
          {hayCarpeta && (
            <button className="btn mini" onClick={guardarEnCarpeta}>
              Guardar en carpeta
            </button>
          )}
        </div>
      )}

      {fotos.length > 0 && (
        <div className="fotos">
          {fotos.map((f, i) => (
            <figure className="foto" key={i}>
              <img src={f.mini} alt={"Foto " + (i + 1)} />
              <figcaption>
                <span className="mono">{rotulo(i)}</span>
                <button className="btn ghost" title="Quitar esta foto" onClick={() => quitar(i)}>✕</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="hint">
        {consecutivo
          ? <>Se nombran con el consecutivo del registro: <span className="mono">{nombreFoto(consecutivo, 1)}</span>, <span className="mono">{nombreFoto(consecutivo, 2)}</span>…</>
          : <>El consecutivo se asigna al guardar, y con él quedan nombradas las fotos. Si las descarga antes, salen con un nombre provisional.</>}
        {" "}Dentro del Excel se guarda una copia reducida a {FOTO_LADO} px; el original queda
        disponible para descargar desde la ficha del registro.
      </div>
    </div>
  );
}

function Checklist({ tipo, valor, onCambio }) {
  const items = CHECKLIST[tipo] || [];
  const actual = {};
  String(valor || "").split("\n").forEach((l) => {
    const p = l.split(" :: ");
    if (p.length === 2) actual[p[0].trim()] = p[1].trim();
  });
  const set = (item, v) => {
    const n = { ...actual, [item]: v };
    onCambio(items.filter((i) => n[i]).map((i) => i + " :: " + n[i]).join("\n"));
  };
  if (!items.length) return (
    <div className="full">
      <label className="f">Verificaciones</label>
      <div className="hint">Seleccione primero el tipo de inspección para cargar la lista de verificación.</div>
    </div>
  );
  return (
    <div className="full">
      <label className="f">Verificaciones · {tipo}</label>
      <div style={{ border: "1px solid " + T.line, borderRadius: 7, padding: "4px 12px" }}>
        {items.map((it) => (
          <div className="check" key={it}>
            <span>{it}</span>
            <select value={actual[it] || ""} onChange={(e) => set(it, e.target.value)}>
              <option value="">— Sin verificar —</option>
              {CAT.conforme.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="hint">
        Contraste esta lista con la norma institucional y el manual del fabricante antes de
        oficializarla como formato de la dependencia.
      </div>
    </div>
  );
}

/* --------------------------- formulario genérico -------------------------- */
function FormRegistro({ edita, listas, infra, crearEnLista, conocimiento, avisar, onCancel, onSave }) {
  const mod = M[edita.mod];
  const [f, setF] = useState(() => {
    const o = {};
    mod.campos.forEach(([k, , t]) => (o[k] = edita.r[k] ?? (t === "fecha" && edita.i === null ? "" : edita.r[k] ?? "")));
    if (edita.i === null) {
      if (edita.mod === "tickets") { o.tipo_req = "Ticket de soporte"; o.medio = "Formulario"; o.prioridad = "Media"; o.estado = "Nuevo"; }
      if (edita.mod === "mantenimientos") { o.tipo_mtto = "Preventivo"; o.fecha_programada = hoyISO(); o.estado = "Nuevo"; }
      if (edita.mod === "inspecciones") o.fecha = hoyISO();
      if (edita.mod === "infraestructura") { o.estado_op = "Operativo"; o.criticidad = "Media"; o.periodicidad = "Semestral"; }
      if (edita.mod === "eventos") o.estado = "Programado";
    }
    return o;
  });
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  /* Una revista deja a la vista únicamente los campos que le sirven a quien la
     está pasando. Los demás se esconden, no se borran: si cambia el tipo de
     actividad, lo que ya había escrito sigue donde estaba.                   */
  const esRevista = edita.mod === "tickets" && norm(f.tipo_req) === norm(ACTIVIDAD_REVISTA);
  const esRevistaRadio = edita.mod === "tickets" && norm(f.tipo_req) === norm(ACTIVIDAD_REVISTA_RADIO);
  const visible = (k) => esRevista
    ? CAMPOS_REVISTA.indexOf(k) >= 0
    : esRevistaRadio
    ? CAMPOS_REVISTA_RADIO.indexOf(k) >= 0
    : SOLO_REVISTA.indexOf(k) < 0 && SOLO_REVISTA_RADIO.indexOf(k) < 0;

  /* La fecha de la revista se propone en hoy la primera vez que se elige ese
     tipo, para no obligar a escribirla en el celular.                        */
  useEffect(() => {
    if (esRevista && !f.fecha_revista) set("fecha_revista", hoyISO());
  }, [esRevista]);

  /* el asistente propone procedimientos según lo que se está escribiendo */
  const sugerencias = useMemo(() => {
    if (edita.mod !== "tickets") return [];
    const txt = norm((f.asunto || "") + " " + (f.descripcion || "") + " " + (f.categoria || ""));
    if (txt.trim().length < 4) return [];
    return conocimiento.map((c) => {
      let p = 0;
      norm(c.sintomas).split(",").forEach((s) => { if (s.trim() && txt.indexOf(s.trim()) >= 0) p += 2; });
      if (c.categoria && f.categoria && norm(c.categoria) === norm(f.categoria)) p += 1;
      return { c, p };
    }).filter((x) => x.p > 0).sort((a, b) => b.p - a.p).slice(0, 2).map((x) => x.c);
  }, [f.asunto, f.descripcion, f.categoria, conocimiento, edita.mod]);

  function guardar() {
    /* Un campo obligatorio que está escondido no se puede exigir: en una
       revista, el asunto y la prioridad no se piden.                         */
    const falta = mod.campos.find(([k, l, t, w, o]) =>
      o && o.req && visible(k) && !String(f[k] || "").trim());
    if (falta) return setErr("Falta un campo obligatorio: " + falta[1] + ".");
    setErr(""); onSave(f);
  }

  const opcionesInfra = (infra || []).map((x) =>
    [x.codigo, x.tipo_elemento, x.sede].filter(Boolean).join(" · ")).filter(Boolean);

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="sheet">
        <div className="cab">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
              color: "#9FE0D6", fontFamily: "'JetBrains Mono',monospace" }}>
              {edita.i === null ? "Nuevo" : "Editar"} · {mod.titulo}
            </div>
            <h2>{f.consecutivo || f.asunto || f.nombre || f.codigo || "Registro"}</h2>
          </div>
          <button className="btn claro mini" onClick={onCancel}>✕</button>
        </div>
        <div className="cuerpo">
          <div className="grid">
            {mod.campos.filter(([k, , t]) => t !== "auto" && visible(k)).map(([k, l, t, w, o]) => {
              const op = o || {};
              if (t === "fotos") return <CampoFotos key={k} valor={f[k]} onCambio={(v) => set(k, v)}
                consecutivo={f.consecutivo} avisar={avisar} />;
              if (t === "fotos_radio") return <CampoFotosRadio key={k} valor={f[k]} onCambio={(v) => set(k, v)}
                consecutivo={f.consecutivo} avisar={avisar} />;
              if (t === "checklist") return <Checklist key={k} tipo={f.tipo_inspeccion} valor={f[k]} onCambio={(v) => set(k, v)} />;
              if (t.indexOf("lista:") === 0) {
                const nombre = t.split(":")[1];
                return <CampoLista key={k} l={l} req={op.req} full={op.full} valor={f[k]}
                  lista={listas[nombre] || []} onCambio={(v) => set(k, v)}
                  onCrear={(n, fz) => crearEnLista(nombre, n, fz)} placeholder={l} />;
              }
              return (
                <div key={k} className={op.full ? "full" : ""}>
                  <label className={"f" + (op.req ? " req" : "")}>{l}</label>
                  {t.indexOf("select:") === 0 ? (
                    <select value={f[k] || ""} onChange={(e) => set(k, e.target.value)}>
                      <option value="">— Seleccione —</option>
                      {CAT[t.split(":")[1]].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  ) : t.indexOf("ref:") === 0 ? (
                    <select value={f[k] || ""} onChange={(e) => set(k, e.target.value)}>
                      <option value="">— Ninguno —</option>
                      {opcionesInfra.map((x) => <option key={x}>{x}</option>)}
                      {f[k] && opcionesInfra.indexOf(f[k]) < 0 && <option>{f[k]}</option>}
                    </select>
                  ) : t === "largo" ? (
                    <textarea value={f[k] || ""} onChange={(e) => set(k, e.target.value)} />
                  ) : (
                    <input type={t === "fecha" ? "date" : t === "numero" ? "number" : "text"}
                      value={t === "fecha" ? dISO(f[k]) : f[k] ?? ""}
                      onChange={(e) => set(k, e.target.value)} />
                  )}
                  {k === "prioridad" && f.prioridad && ANS[f.prioridad] && (
                    <div className="hint">
                      ANS: respuesta {ANS[f.prioridad].respuesta} h · solución {ANS[f.prioridad].solucion} h.
                      La fecha compromiso se calcula al guardar.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {sugerencias.length > 0 && (
            <div style={{ marginTop: 18, background: "#EAF6F4", border: "1px solid #A9DCD5",
              borderRadius: 8, padding: 14 }}>
              <div className="eyebrow" style={{ color: T.teal }}>El asistente encontró procedimientos aplicables</div>
              {sugerencias.map((c, i) => (
                <details key={i} style={{ marginTop: 10 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14, color: T.grafito2 }}>{c.titulo}</summary>
                  <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6, whiteSpace: "pre-line", color: "#28323C" }}>
                    <b>Preguntas de descarte:</b> {c.descarte}{"\n\n"}
                    <b>Procedimiento:</b>{"\n"}{c.procedimiento}
                  </div>
                </details>
              ))}
            </div>
          )}

          {err && <p style={{ color: T.bad, fontSize: 13, marginTop: 14, marginBottom: 0 }}>{err}</p>}
          <div className="row" style={{ marginTop: 20, justifyContent: "flex-end" }}>
            <button className="btn ghost" onClick={onCancel}>Cancelar</button>
            <button className="btn oro" onClick={guardar}>
              {edita.i === null ? "Guardar registro" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* --------------------- informe de revistas (PDF) -------------------------- */
/* Se arma una ficha por revista, con sus datos y sus fotos, y se manda a la
   impresora del navegador. No se agrega ninguna librería de PDF: la red de la
   dependencia bloquea dominios y el navegador ya sabe generar el archivo.
   Al imprimir se clona el informe en un contenedor colgado del body, de modo
   que el resultado no dependa del fondo ni de la barra de la aplicación.    */
function InformeRevistas({ filas, unidad, sesion, onCerrar }) {
  const hoyI = hoyISO();
  const [rg, setRg] = useState({ desde: "", hasta: "", sede: "todas" });
  const cuerpo = useRef(null);

  const revistas = useMemo(() => filas
    .filter((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA))
    .filter((r) => {
      if (rg.sede !== "todas" && r.sede !== rg.sede) return false;
      const d = dISO(r.fecha_revista) || dISO(r.fecha_registro);
      if (rg.desde && (!d || d < rg.desde)) return false;
      if (rg.hasta && (!d || d > rg.hasta)) return false;
      return true;
    })
    .sort((a, b) => String(dISO(a.fecha_revista) || "").localeCompare(String(dISO(b.fecha_revista) || ""))),
  [filas, rg]);

  const sedes = [...new Set(filas
    .filter((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA))
    .map((r) => String(r.sede || "").trim()).filter(Boolean))].sort();

  const totalFotos = revistas.reduce((a, r) => a + cuantasFotos(r), 0);
  const emitido = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });

  function imprimir() {
    if (!revistas.length) return;
    const nodo = cuerpo.current;
    if (!nodo) return;
    let caja = document.getElementById("impresion");
    if (!caja) { caja = document.createElement("div"); caja.id = "impresion"; document.body.appendChild(caja); }
    caja.className = "gu";          /* conserva las reglas del sistema, que cuelgan de .gu */
    caja.innerHTML = "";
    caja.appendChild(nodo.cloneNode(true));
    document.body.classList.add("modo-impresion");
    const limpiar = () => {
      document.body.classList.remove("modo-impresion");
      caja.innerHTML = "";
      window.removeEventListener("afterprint", limpiar);
    };
    window.addEventListener("afterprint", limpiar);
    setTimeout(() => { window.print(); setTimeout(limpiar, 1200); }, 60);
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="sheet" style={{ maxWidth: 1000 }}>
        <div className="cab">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
              color: "#9FE0D6", fontFamily: "'JetBrains Mono',monospace" }}>Informe</div>
            <h2>Revistas de equipos</h2>
          </div>
          <button className="btn claro mini" onClick={onCerrar}>✕</button>
        </div>
        <div className="cuerpo">
          <div className="row" style={{ marginBottom: 14, alignItems: "flex-end" }}>
            <div style={{ minWidth: 150 }}>
              <label className="f">Desde</label>
              <input type="date" value={rg.desde} onChange={(e) => setRg({ ...rg, desde: e.target.value })} />
            </div>
            <div style={{ minWidth: 150 }}>
              <label className="f">Hasta</label>
              <input type="date" value={rg.hasta} onChange={(e) => setRg({ ...rg, hasta: e.target.value })} />
            </div>
            <div style={{ minWidth: 190 }}>
              <label className="f">Sede</label>
              <select value={rg.sede} onChange={(e) => setRg({ ...rg, sede: e.target.value })}>
                <option value="todas">Todas las sedes</option>
                {sedes.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <button className="btn oro" disabled={!revistas.length} onClick={imprimir}>Generar PDF</button>
            <span className="conteo" style={{ color: T.muted }}>
              {revistas.length} revistas · {totalFotos} fotos
            </span>
          </div>

          {!revistas.length ? (
            <div className="panel" style={{ padding: 30, textAlign: "center", color: T.muted, fontSize: 13.5 }}>
              No hay revistas registradas con esos criterios. Registre una desde
              «Nuevo ticket» eligiendo <b>{ACTIVIDAD_REVISTA}</b> como tipo de actividad.
            </div>
          ) : (
            <div className="informe" ref={cuerpo}>
              <div className="inf-cab">
                <img src={window.MARCA} alt="" />
                <div className="tit">
                  <h1>Informe de revistas de equipos</h1>
                  <div className="sub">GUTIC · {unidad || "Unidad sin definir"}</div>
                </div>
                <div className="meta">
                  {rg.desde || rg.hasta
                    ? "Del " + (rg.desde ? fmt(rg.desde) : "inicio") + " al " + (rg.hasta ? fmt(rg.hasta) : fmt(hoyI))
                    : "Histórico completo"}<br />
                  {rg.sede === "todas" ? "Todas las sedes" : rg.sede}<br />
                  Emitido: {emitido}<br />
                  Por: {(sesion && sesion.nombre) || "—"}
                </div>
              </div>

              <div className="inf-resumen">
                <span><b>{revistas.length}</b> revistas</span>
                <span><b>{totalFotos}</b> fotografías</span>
                <span><b>{sedes.length}</b> sedes con revista</span>
              </div>

              {revistas.map((r, i) => (
                <section className="inf-ficha" key={i}>
                  <h2>{r.consecutivo} · {r.sede || "Sede sin indicar"}</h2>
                  <div className="inf-datos">
                    <div><span className="k">Fecha</span><span className="v">{fmt(r.fecha_revista) }</span></div>
                    <div><span className="k">Categoría técnica</span><span className="v">{r.categoria || "—"}</span></div>
                    <div><span className="k">Estado</span><span className="v">{r.estado || "—"}</span></div>
                    <div><span className="k">Tipo de solución</span><span className="v">{r.tipo_solucion || "—"}</span></div>
                    <div><span className="k">Atendido por</span><span className="v">{r.atendido_por || "—"}</span></div>
                    <div><span className="k">Registrado por</span><span className="v">{r.registrado_por || "—"}</span></div>
                  </div>
                  {r.descripcion && (
                    <div className="inf-parr"><b>Descripción.</b> {r.descripcion}</div>
                  )}
                  {r.accion && (
                    <div className="inf-parr"><b>Acción ejecutada.</b> {r.accion}</div>
                  )}
                  {cuantasFotos(r) > 0 ? (
                    <div className="inf-fotos">
                      {fotosDe(r).map((f, k) => (
                        <figure key={k}>
                          <img src={f.mini} alt={"Fotografía " + (k + 1)} />
                          <figcaption>{nombreFoto(r.consecutivo, k + 1)}</figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="inf-sinfoto">Esta revista no tiene fotografías registradas.</div>
                  )}
                </section>
              ))}

              <div className="inf-pie">
                <span>GUTIC · {unidad || "Sin definir"} · Documento de uso interno</span>
                <span>{revistas.length} revistas · generado el {emitido}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- informe de revista de radios (PDF) --------------- */
/* Reproduce el formato físico ya en uso en la dependencia: una ficha por
   radio, con la misma tabla de datos y el mismo álbum de tres fotografías
   fijas. Comparte el mecanismo de impresión con InformeRevistas.             */
function InformeRevistasRadio({ filas, unidad, sesion, onCerrar }) {
  const hoyI = hoyISO();
  const [rg, setRg] = useState({ desde: "", hasta: "", sede: "todas" });
  const cuerpo = useRef(null);

  const revistas = useMemo(() => filas
    .filter((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA_RADIO))
    .filter((r) => {
      if (rg.sede !== "todas" && r.sede !== rg.sede) return false;
      const d = dISO(r.fecha_registro);
      if (rg.desde && (!d || d < rg.desde)) return false;
      if (rg.hasta && (!d || d > rg.hasta)) return false;
      return true;
    })
    .sort((a, b) => String(a.fecha_registro || "").localeCompare(String(b.fecha_registro || ""))),
  [filas, rg]);

  const sedes = [...new Set(filas
    .filter((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA_RADIO))
    .map((r) => String(r.sede || "").trim()).filter(Boolean))].sort();

  const totalFotos = revistas.reduce((a, r) => a + cuantasFotosRadio(r), 0);
  const emitido = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });

  function imprimir() {
    if (!revistas.length) return;
    const nodo = cuerpo.current;
    if (!nodo) return;
    let caja = document.getElementById("impresion");
    if (!caja) { caja = document.createElement("div"); caja.id = "impresion"; document.body.appendChild(caja); }
    caja.className = "gu";
    caja.innerHTML = "";
    caja.appendChild(nodo.cloneNode(true));
    document.body.classList.add("modo-impresion");
    const limpiar = () => {
      document.body.classList.remove("modo-impresion");
      caja.innerHTML = "";
      window.removeEventListener("afterprint", limpiar);
    };
    window.addEventListener("afterprint", limpiar);
    setTimeout(() => { window.print(); setTimeout(limpiar, 1200); }, 60);
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="sheet" style={{ maxWidth: 1000 }}>
        <div className="cab">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
              color: "#9FE0D6", fontFamily: "'JetBrains Mono',monospace" }}>Informe</div>
            <h2>Revista de radios</h2>
          </div>
          <button className="btn claro mini" onClick={onCerrar}>✕</button>
        </div>
        <div className="cuerpo">
          <div className="row" style={{ marginBottom: 14, alignItems: "flex-end" }}>
            <div style={{ minWidth: 150 }}>
              <label className="f">Desde</label>
              <input type="date" value={rg.desde} onChange={(e) => setRg({ ...rg, desde: e.target.value })} />
            </div>
            <div style={{ minWidth: 150 }}>
              <label className="f">Hasta</label>
              <input type="date" value={rg.hasta} onChange={(e) => setRg({ ...rg, hasta: e.target.value })} />
            </div>
            <div style={{ minWidth: 190 }}>
              <label className="f">Ubicación</label>
              <select value={rg.sede} onChange={(e) => setRg({ ...rg, sede: e.target.value })}>
                <option value="todas">Todas las ubicaciones</option>
                {sedes.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <button className="btn oro" disabled={!revistas.length} onClick={imprimir}>Generar PDF</button>
            <span className="conteo" style={{ color: T.muted }}>
              {revistas.length} radios · {totalFotos} fotos
            </span>
          </div>

          {!revistas.length ? (
            <div className="panel" style={{ padding: 30, textAlign: "center", color: T.muted, fontSize: 13.5 }}>
              No hay revistas de radio registradas con esos criterios. Registre una desde
              «Nuevo ticket» eligiendo <b>{ACTIVIDAD_REVISTA_RADIO}</b> como tipo de actividad.
            </div>
          ) : (
            <div className="informe" ref={cuerpo}>
              <div className="inf-cab">
                <img src={window.MARCA} alt="" />
                <div className="tit">
                  <h1>Informe de revista de radios</h1>
                  <div className="sub">GUTIC · {unidad || "Unidad sin definir"}</div>
                </div>
                <div className="meta">
                  {rg.desde || rg.hasta
                    ? "Del " + (rg.desde ? fmt(rg.desde) : "inicio") + " al " + (rg.hasta ? fmt(rg.hasta) : fmt(hoyI))
                    : "Histórico completo"}<br />
                  {rg.sede === "todas" ? "Todas las ubicaciones" : rg.sede}<br />
                  Emitido: {emitido}<br />
                  Por: {(sesion && sesion.nombre) || "—"}
                </div>
              </div>

              <div className="inf-resumen">
                <span><b>{revistas.length}</b> radios revisados</span>
                <span><b>{totalFotos}</b> fotografías</span>
                <span><b>{sedes.length}</b> ubicaciones con revista</span>
              </div>

              {revistas.map((r, i) => (
                <section className="inf-radio-ficha" key={i}>
                  <div className="inf-radio-titulo">Formato revista física red de radio</div>
                  <table className="inf-radio-tabla">
                    <thead>
                      <tr>
                        <th>Tipo y modelo de radio</th>
                        <th>Serial</th>
                        <th>Responsable</th>
                        <th>Número de ticket SIGMA<br /><span className="destaca">(Revista radio)</span></th>
                        <th>Ubicación</th>
                        <th>Novedades</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{r.modelo_radio || "—"}</td>
                        <td className="mono">{r.serial_radio || "—"}</td>
                        <td>{r.responsable_radio || "—"}</td>
                        <td>{r.ticket_sigma || "—"}</td>
                        <td>{r.sede || "—"}</td>
                        <td>{r.novedades_radio || "S/N"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="inf-radio-album-tit">Álbum fotográfico de cada radio</div>
                  <table className="inf-radio-album">
                    <thead>
                      <tr>{SLOTS_FOTO_RADIO.map((s) => <th key={s.clave}>{s.etiqueta}</th>)}</tr>
                    </thead>
                    <tbody>
                      <tr>
                        {SLOTS_FOTO_RADIO.map((s) => {
                          const f = r.fotos_radio && r.fotos_radio[s.clave];
                          return (
                            <td key={s.clave}>
                              {f ? <img src={f.mini} alt={s.etiqueta} />
                                 : <div className="inf-radio-sinfoto">Sin fotografía</div>}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </section>
              ))}

              <div className="inf-pie">
                <span>GUTIC · {unidad || "Sin definir"} · Documento de uso interno</span>
                <span>{revistas.length} radios · generado el {emitido}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- vista de módulo ---------------------------- */
function Modulo({ mod, filas, alerta, unidad, sesion, onNuevo, onEditar }) {
  const [q, setQ] = useState(""), [fSem, setFSem] = useState("todos");
  const [informe, setInforme] = useState(false);
  const [informeRadio, setInformeRadio] = useState(false);
  const hayRevistas = mod === "tickets" && filas.some((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA));
  const hayRevistasRadio = mod === "tickets" && filas.some((r) => norm(r.tipo_req) === norm(ACTIVIDAD_REVISTA_RADIO));
  const def = M[mod];
  const cols = TABLA[mod];
  const ev = filas.map((r, i) => ({ i, r, e: evaluar(mod, r, alerta) }));
  const conteo = { resuelto: 0, tiempo: 0, porvencer: 0, vencido: 0 };
  ev.forEach((x) => conteo[x.e.s]++);
  const vis = ev.filter(({ r, e }) => {
    if (fSem !== "todos" && e.s !== fSem) return false;
    if (q && !def.campos.some(([k]) => norm(r[k]).indexOf(norm(q)) >= 0)) return false;
    return true;
  }).sort((a, b) => ORDEN.indexOf(a.e.s) - ORDEN.indexOf(b.e.s));

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div className="cinta" style={{ flex: "1 1 320px", maxWidth: 620 }}>
          {ORDEN.map((s) => conteo[s] ? (
            <button key={s} className="seg" style={{ background: SEM[s].c, flexGrow: conteo[s], flexBasis: 0 }}
              onClick={() => setFSem(fSem === s ? "todos" : s)}>
              <span className="n">{conteo[s]}</span><span className="l">{SEM[s].l}</span>
            </button>
          ) : null)}
          {!filas.length && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              color: T.muted, fontSize: 13 }}>Sin registros en {def.titulo.toLowerCase()}</div>
          )}
        </div>
        <div className="row">
          {hayRevistas && (
            <button className="btn teal" onClick={() => setInforme(true)}>▤ Informe de revistas</button>
          )}
          {hayRevistasRadio && (
            <button className="btn teal" onClick={() => setInformeRadio(true)}>▤ Informe de revista de radios</button>
          )}
          <button className="btn oro" onClick={onNuevo}>+ Nuevo {def.singular}</button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 10 }}>
        <input style={{ flex: "1 1 220px", width: "auto" }} placeholder={"Buscar en " + def.titulo.toLowerCase() + "…"}
          value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="conteo">{vis.length} de {filas.length}</span>
      </div>

      <div className="panel" style={{ overflow: "auto", maxHeight: "70vh" }}>
        <table>
          <thead><tr>
            <th>Estado</th>
            {cols.map((k) => <th key={k}>{(def.campos.find((c) => c[0] === k) || [, k])[1]}</th>)}
            <th></th>
          </tr></thead>
          <tbody>
            {vis.map(({ i, r, e }) => (
              <tr key={i}>
                <td>
                  <span className="chip" style={{ background: SEM[e.s].c + "1A", color: SEM[e.s].c }}>
                    <span className="dot" style={{ background: SEM[e.s].c }} />{SEM[e.s].l}
                  </span>
                  <div style={{ fontSize: 10.5, color: T.muted, marginTop: 3 }}>{e.motivo}</div>
                </td>
                {cols.map((k) => {
                  const tipo = (def.campos.find((c) => c[0] === k) || [])[2] || "";
                  const val = tipo === "fecha" ? fmt(r[k]) : String(r[k] || "—");
                  const esClave = k === "consecutivo" || k === "codigo";
                  return (
                    <td key={k} className={esClave || tipo === "fecha" ? "mono" : ""}
                      style={{ fontSize: esClave ? 12.5 : 13, maxWidth: 280,
                        fontWeight: k === "asunto" || k === "nombre" ? 600 : 400 }}>
                      {val}
                      {k === "consecutivo" && cuantasFotos(r) > 0 && (
                        <span className="badge-foto" title={cuantasFotos(r) + " fotografías"}>
                          ⛶ {cuantasFotos(r)}
                        </span>
                      )}
                      {k === "consecutivo" && cuantasFotosRadio(r) > 0 && (
                        <span className="badge-foto" title={cuantasFotosRadio(r) + " de 3 fotos del radio"}>
                          ⛶ {cuantasFotosRadio(r)}/3
                        </span>
                      )}
                      {k === "prioridad" && r.prioridad === "Crítica" && (
                        <div style={{ color: T.bad, fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>ATENCIÓN INMEDIATA</div>
                      )}
                    </td>
                  );
                })}
                <td style={{ textAlign: "right" }}>
                  <button className="btn ghost" onClick={() => onEditar(i, r)}>Abrir</button>
                </td>
              </tr>
            ))}
            {!vis.length && (
              <tr><td colSpan={cols.length + 2} style={{ padding: 34, textAlign: "center", color: T.muted }}>
                {filas.length ? "Ningún registro coincide con el filtro." : "Aún no hay registros. Use el botón Nuevo."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {informe && (
        <InformeRevistas filas={filas} unidad={unidad} sesion={sesion} onCerrar={() => setInforme(false)} />
      )}

      {informeRadio && (
        <InformeRevistasRadio filas={filas} unidad={unidad} sesion={sesion} onCerrar={() => setInformeRadio(false)} />
      )}
    </>
  );
}

/* ------------------------------- tablero --------------------------------- */
function Kpi({ l, v, h, c }) {
  return <div className="panel kpi" style={{ borderLeftColor: c }}>
    <div className="eyebrow">{l}</div><div className="v mono" style={{ color: c }}>{v}</div><div className="h">{h}</div>
  </div>;
}

function Tablero({ datos, alerta }) {
  const tk = datos.tickets || [], inf = datos.infraestructura || [], mt = datos.mantenimientos || [];
  const cerrados = tk.filter((r) => ["Resuelto", "Cerrado"].indexOf(r.estado) >= 0);
  const enPlazo = cerrados.filter((r) => !r.fecha_compromiso || !r.fecha_solucion || horas(r.fecha_compromiso, r.fecha_solucion) <= 0);
  const ans = cerrados.length ? Math.round((enPlazo.length / cerrados.length) * 100) : 0;
  const conTiempo = mt.filter((r) => +r.tiempo > 0);
  const mttr = conTiempo.length ? Math.round(conTiempo.reduce((a, r) => a + (+r.tiempo || 0), 0) / conTiempo.length) : null;
  const abiertos = tk.filter((r) => ["Resuelto", "Cerrado"].indexOf(r.estado) < 0);
  const vencidos = abiertos.filter((r) => evaluar("tickets", r, alerta).s === "vencido").length;
  const backlog = abiertos.filter((r) => { const d = toDate(r.fecha_registro); return d && dias(d, new Date()) > 15; }).length;
  const mttoProg = mt.filter((r) => !r.fecha_ejecutada).length;
  const mttoEjec = mt.filter((r) => r.fecha_ejecutada).length;
  const cumplePrev = mt.length ? Math.round((mttoEjec / mt.length) * 100) : 0;
  const fueraServicio = inf.filter((r) => r.estado_op === "Fuera de servicio").length;

  const porCat = {};
  tk.forEach((r) => { const c = r.categoria || "Sin categoría"; porCat[c] = (porCat[c] || 0) + 1; });
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxc = Math.max(1, ...cats.map((c) => c[1]));

  const porTipo = {};
  inf.forEach((r) => { const c = r.tipo_elemento || "Sin tipo"; porTipo[c] = (porTipo[c] || 0) + 1; });
  const tipos = Object.entries(porTipo).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxt = Math.max(1, ...tipos.map((c) => c[1]));

  const proximos = inf.map((r) => ({ r, e: evaluar("infraestructura", r, alerta) }))
    .filter((x) => x.e.s === "vencido" || x.e.s === "porvencer")
    .sort((a, b) => (a.e.rest ?? 0) - (b.e.rest ?? 0)).slice(0, 8);

  return (
    <>
      <div className="kpis">
        <Kpi l="Cumplimiento ANS" v={ans + "%"} h={enPlazo.length + " de " + cerrados.length + " en plazo"} c={T.ok} />
        <Kpi l="Tickets vencidos" v={vencidos} h="fuera del ANS, abiertos" c={T.bad} />
        <Kpi l="Tiempo medio" v={mttr === null ? "—" : mttr + " min"} h="promedio por mantenimiento" c={T.info} />
        <Kpi l="Plan preventivo" v={cumplePrev + "%"} h={mttoEjec + " ejecutados, " + mttoProg + " pendientes"} c={T.teal} />
        <Kpi l="Fuera de servicio" v={fueraServicio} h="elementos de infraestructura" c={T.warn} />
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Tickets por categoría técnica</div>
          {cats.map(([c, n]) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
              <div style={{ width: 140, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c}</div>
              <div style={{ flex: 1, height: 8, background: "#E6EBF0", borderRadius: 99, overflow: "hidden" }}>
                <i style={{ display: "block", height: "100%", width: (n / maxc) * 100 + "%", background: T.teal2, borderRadius: 99 }} />
              </div>
              <div className="mono" style={{ fontSize: 12, color: T.muted, width: 26, textAlign: "right" }}>{n}</div>
            </div>
          ))}
          {!cats.length && <p style={{ color: T.muted, fontSize: 13 }}>Sin tickets registrados.</p>}
        </div>

        <div className="panel" style={{ padding: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Inventario por tipo de elemento</div>
          {tipos.map(([c, n]) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
              <div style={{ width: 140, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c}</div>
              <div style={{ flex: 1, height: 8, background: "#E6EBF0", borderRadius: 99, overflow: "hidden" }}>
                <i style={{ display: "block", height: "100%", width: (n / maxt) * 100 + "%", background: T.oro, borderRadius: 99 }} />
              </div>
              <div className="mono" style={{ fontSize: 12, color: T.muted, width: 26, textAlign: "right" }}>{n}</div>
            </div>
          ))}
          {!tipos.length && <p style={{ color: T.muted, fontSize: 13 }}>Sin inventario cargado.</p>}
        </div>
      </div>

      <div className="panel" style={{ padding: 16, marginTop: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Mantenimiento preventivo por atender</div>
        {proximos.map(({ r, e }, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: "1px solid #EDF1F5" }}>
            <span className="dot" style={{ background: SEM[e.s].c }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.codigo} · {r.tipo_elemento}</div>
              <div style={{ fontSize: 11.5, color: T.muted }}>{r.sede} · {r.ubicacion} · {e.motivo}</div>
            </div>
            <span className="mono" style={{ fontSize: 12, color: T.muted }}>{fmt(r.proximo_mtto)}</span>
          </div>
        ))}
        {!proximos.length && <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
          Ningún elemento con mantenimiento vencido o próximo. Recuerde diligenciar la fecha de próximo
          mantenimiento en la hoja de vida de cada equipo.</p>}
      </div>

      <p style={{ fontSize: 11.5, color: "#9FB3C4", marginTop: 14, textShadow: "0 1px 6px rgba(0,0,0,.6)" }}>
        Los indicadores se calculan sobre los datos registrados en esta base. El cumplimiento del ANS
        solo considera tickets cerrados que tengan fecha compromiso y fecha de solución.
      </p>
    </>
  );
}

/* ------------------------------ asistente -------------------------------- */
function Asistente({ conocimiento, setConocimiento, esAdmin, anotar }) {
  const [q, setQ] = useState(""), [nuevo, setNuevo] = useState(null);
  const res = conocimiento.filter((c) => !q ||
    [c.titulo, c.categoria, c.sintomas, c.causa, c.procedimiento].some((x) => norm(x).indexOf(norm(q)) >= 0));

  return (
    <>
      <div className="panel" style={{ padding: 16, marginBottom: 12, borderLeft: "4px solid " + T.teal }}>
        <div className="eyebrow">Asistente técnico</div>
        <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
          Busca en la base de conocimiento de la dependencia y propone el procedimiento aplicable. No
          inventa respuestas: muestra lo que ustedes han documentado. Cada procedimiento que agregue
          queda guardado en la hoja <b>Conocimiento</b> del Excel y aparecerá como sugerencia cuando
          alguien registre un ticket parecido.
        </p>
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <input style={{ flex: "1 1 260px", width: "auto" }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Describa el síntoma: sin red, ups en alarma, configurar switch…" />
        <span className="conteo">{res.length} procedimientos</span>
        {esAdmin && <button className="btn teal" onClick={() => setNuevo({
          titulo: "", categoria: "", sintomas: "", descarte: "", causa: "", procedimiento: "", comandos: "", escalar: "",
        })}>+ Agregar procedimiento</button>}
      </div>

      {res.map((c, i) => (
        <div className="kb" key={i}>
          {c.categoria && <div className="et">{c.categoria}</div>}
          <h3>{c.titulo}</h3>
          {c.descarte && <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.6 }}>
            <b style={{ color: T.grafito2 }}>Preguntas de descarte: </b>{c.descarte}</p>}
          {c.causa && <p style={{ fontSize: 13.5, margin: "0 0 10px", lineHeight: 1.6 }}>
            <b style={{ color: T.grafito2 }}>Causa probable: </b>{c.causa}</p>}
          {c.procedimiento && <div className="paso"><b style={{ color: T.grafito2 }}>Procedimiento:</b>{"\n"}{c.procedimiento}</div>}
          {c.comandos && c.comandos !== "No aplica." && <pre>{c.comandos}</pre>}
          {c.escalar && <p style={{ fontSize: 12.5, color: T.warn, marginTop: 10, marginBottom: 0, lineHeight: 1.55 }}>
            <b>Cuándo escalar o precaución: </b>{c.escalar}</p>}
        </div>
      ))}
      {!res.length && (
        <div className="panel" style={{ padding: 30, textAlign: "center", color: T.muted }}>
          No hay procedimientos que coincidan con esa búsqueda.
        </div>
      )}

      {nuevo && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setNuevo(null)}>
          <div className="sheet" style={{ maxWidth: 700 }}>
            <div className="cab"><h2>Nuevo procedimiento</h2>
              <button className="btn claro mini" onClick={() => setNuevo(null)}>✕</button></div>
            <div className="cuerpo">
              {[["titulo", "Título del procedimiento", "texto"], ["categoria", "Categoría", "select"],
                ["sintomas", "Síntomas, separados por coma", "texto"], ["descarte", "Preguntas de descarte", "largo"],
                ["causa", "Causa probable", "largo"], ["procedimiento", "Procedimiento paso a paso", "largo"],
                ["comandos", "Comandos o configuración", "largo"], ["escalar", "Cuándo escalar o precauciones", "largo"]].map(([k, l, t]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label className="f">{l}</label>
                  {t === "largo" ? (
                    <textarea value={nuevo[k]} onChange={(e) => setNuevo({ ...nuevo, [k]: e.target.value })} />
                  ) : t === "select" ? (
                    <select value={nuevo[k]} onChange={(e) => setNuevo({ ...nuevo, [k]: e.target.value })}>
                      <option value="">— Seleccione —</option>
                      {CAT.categoria.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  ) : (
                    <input value={nuevo[k]} onChange={(e) => setNuevo({ ...nuevo, [k]: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button className="btn ghost" onClick={() => setNuevo(null)}>Cancelar</button>
                <button className="btn oro" disabled={!nuevo.titulo.trim()}
                  onClick={() => { setConocimiento((p) => [...p, nuevo]); anotar("Agregó procedimiento", "", nuevo.titulo); setNuevo(null); }}>
                  Guardar procedimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------- bitácora -------------------------------- */
function Bitacora({ bitacora }) {
  const [q, setQ] = useState("");
  const filas = [...bitacora].reverse().filter((b) => !q ||
    [b.usuario, b.accion, b.referencia, b.detalle].some((x) => norm(x).indexOf(norm(q)) >= 0));
  const color = (a) => /^(Alerta|Eliminó|Intento)/.test(a) ? T.bad : /^(Creó|Registró|Agregó)/.test(a) ? T.ok : T.info;
  return (
    <>
      <div className="panel" style={{ padding: 14, marginBottom: 12, borderLeft: "4px solid " + T.info, fontSize: 13.5 }}>
        Registro de todo lo ocurrido en la aplicación. Se guarda en la hoja <b>Bitácora</b> del Excel
        y no se puede borrar desde aquí.
      </div>
      <div className="row" style={{ marginBottom: 10 }}>
        <input style={{ flex: "1 1 240px", width: "auto" }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por usuario, acción o referencia…" />
        <span className="conteo">{filas.length} movimientos</span>
      </div>
      <div className="panel" style={{ overflow: "auto", maxHeight: "70vh" }}>
        <table>
          <thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th><th>Referencia</th><th>Detalle</th></tr></thead>
          <tbody>
            {filas.map((b, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{b.fecha}</td>
                <td style={{ fontSize: 12.5 }}>{b.usuario}</td>
                <td style={{ fontSize: 12.5, fontWeight: 600, color: color(String(b.accion)) }}>{b.accion}</td>
                <td className="mono" style={{ fontSize: 12 }}>{b.referencia || "—"}</td>
                <td style={{ fontSize: 12, color: T.muted, maxWidth: 340 }}>{b.detalle}</td>
              </tr>
            ))}
            {!filas.length && <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", color: T.muted }}>
              Sin movimientos registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* -------------------------------- ajustes -------------------------------- */
function Ajustes({ unidad, setUnidad, alerta, setAlerta, listas, crearEnLista, usuarios, setUsuarios,
  sesion, archivo, handle, abrirBase, anotar }) {
  const [uni, setUni] = useState(unidad);
  const [sel, setSel] = useState("sedes");
  const [txt, setTxt] = useState(""), [msg, setMsg] = useState(null);
  function intentar(forzar) {
    const r = crearEnLista(sel, txt, forzar);
    if (r.ok) { setTxt(""); setMsg({ err: false, t: "Agregado: " + r.valor }); }
    else setMsg({ err: true, t: r.msg, confirmar: r.confirmar });
  }
  return (
    <div className="grid">
      <div className="panel full" style={{ padding: 14, borderLeft: "4px solid " + T.oro, fontSize: 13.5 }}>
        Sesión de administrador activa como <b>{sesion.nombre}</b>. Los cambios de esta pestaña afectan
        a toda la unidad.
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <div className="eyebrow">Unidad responsable</div>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          Aparece en el encabezado y se guarda en la hoja Configuración del Excel.
        </p>
        <div className="row">
          <input style={{ flex: 1 }} value={uni} onChange={(e) => setUni(e.target.value)} />
          <button className="btn teal" disabled={titulo(uni).length < 3 || titulo(uni) === unidad}
            onClick={() => { setUnidad(titulo(uni)); anotar("Cambió la unidad", "", titulo(uni)); }}>Actualizar</button>
        </div>
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <div className="eyebrow">Semáforo de tickets</div>
        <div style={{ maxWidth: 240, marginTop: 10 }}>
          <label className="f">Avisar «por vencer» cuando falten (horas)</label>
          <input type="number" min="1" value={alerta} onChange={(e) => setAlerta(Math.max(1, +e.target.value || 1))} />
        </div>
        <ul style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7, paddingLeft: 18, marginTop: 12 }}>
          <li><b>Resuelto</b> — tiene solución registrada; indica si fue dentro o fuera del ANS.</li>
          <li><b>Vencido</b> — pasó la fecha compromiso y sigue abierto.</li>
          <li><b>Por vencer</b> — faltan {alerta} horas o menos.</li>
          <li><b>En tiempo</b> — dentro del plazo o sin fecha definida.</li>
        </ul>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 0 }}>
          Los tiempos del ANS por prioridad están en el código y deben ser aprobados por la jefatura
          antes de publicarse, porque comprometen a la dependencia.
        </p>
      </div>

      <div className="panel full" style={{ padding: 16 }}>
        <div className="eyebrow">Catálogos</div>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          Se alimentan solos desde los formularios. Rige el control de parecido del 30 %: si la
          denominación nueva se parece a una existente, la aplicación pide confirmación.
        </p>
        <div className="row" style={{ maxWidth: 660 }}>
          <select style={{ width: 170 }} value={sel} onChange={(e) => { setSel(e.target.value); setMsg(null); }}>
            {LISTAS.map((k) => <option key={k} value={k}>{ROT_LISTA[k]}</option>)}
          </select>
          <input style={{ flex: 1 }} value={txt} onChange={(e) => { setTxt(e.target.value); setMsg(null); }}
            onKeyDown={(e) => e.key === "Enter" && intentar(false)} placeholder="Nueva denominación" />
          <button className="btn teal" onClick={() => intentar(false)}>Agregar</button>
        </div>
        {msg && !msg.confirmar && <div className="hint" style={{ color: msg.err ? T.bad : T.ok }}>{msg.t}</div>}
        {msg && msg.confirmar && (
          <div style={{ marginTop: 10, background: "#FFF8E8", border: "1px solid #E8C97A", borderRadius: 7, padding: 11 }}>
            <div style={{ fontSize: 12.5 }}><b style={{ color: T.warn }}>Posible duplicado.</b> {msg.t} ¿Agregar de todos modos?</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn mini" onClick={() => intentar(true)}>Sí, agregar</button>
              <button className="btn ghost" onClick={() => { setTxt(""); setMsg(null); }}>Cancelar</button>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
          {(listas[sel] || []).map((x) => (
            <span key={x} style={{ fontSize: 12, background: "#EEF3F6", border: "1px solid " + T.line,
              borderRadius: 5, padding: "5px 9px" }}>{x}</span>
          ))}
          {!(listas[sel] || []).length && <span style={{ fontSize: 12.5, color: T.muted }}>
            Sin registros en {ROT_LISTA[sel].toLowerCase()}.</span>}
        </div>
      </div>

      <div className="panel full" style={{ padding: 16 }}>
        <div className="eyebrow">Usuarios · {usuarios.length}</div>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          Cada uno entra con su ID y contraseña. Las contraseñas se guardan como huella en la hoja
          Usuarios del Excel, nunca en texto legible.
        </p>
        <div className="panel" style={{ overflow: "auto", marginTop: 10 }}>
          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Rol</th><th>Registrado</th><th></th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="mono" style={{ fontSize: 12.5 }}>{u.id}</td>
                  <td style={{ fontSize: 12.5 }}>{u.nombre}</td>
                  <td style={{ fontSize: 12.5, fontWeight: 600, color: u.rol === "Administrador" ? T.teal : T.muted }}>{u.rol}</td>
                  <td className="mono" style={{ fontSize: 11.5, color: T.muted }}>{u.fecha}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn ghost" onClick={() => setUsuarios((p) => p.map((x) => x.id === u.id
                      ? { ...x, rol: x.rol === "Administrador" ? "Técnico" : "Administrador" } : x))}>
                      {u.rol === "Administrador" ? "Quitar rol" : "Hacer admin"}
                    </button>
                    {sesion.id !== u.id && (
                      <button className="btn ghost" onClick={() => { if (confirm("¿Eliminar el usuario " + u.id + "?"))
                        setUsuarios((p) => p.filter((x) => x.id !== u.id)); }}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel full" style={{ padding: 16 }}>
        <div className="eyebrow">Archivo</div>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          {handle ? <>Vinculado a <b>{archivo}</b>. Cada cambio se escribe solo en ese archivo. Manténgalo
            cerrado en Excel mientras trabaja aquí: Windows lo bloquea y no deja escribir encima.</>
            : <>No hay archivo vinculado. Los cambios viven solo en esta pestaña.</>}
        </p>
        <button className="btn teal" onClick={abrirBase}>Abrir otra base</button>
      </div>
    </div>
  );
}
