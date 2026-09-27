const CSS = `
.gu *{box-sizing:border-box}
.gu{position:relative;background:${T.grafito};color:${T.ink};min-height:100vh;font-size:15px;
  font-family:'Inter','Segoe UI',system-ui,sans-serif;padding-bottom:60px}

/* imagen institucional de fondo, con la misma intensidad del banner superior */
.gu:before{content:"";position:fixed;inset:0;background-image:var(--fondo);background-size:cover;
  background-position:center 42%;opacity:.92;z-index:0;pointer-events:none}
.gu:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:linear-gradient(158deg,rgba(6,12,22,.76) 0%,rgba(10,20,34,.68) 45%,rgba(13,26,44,.62) 100%)}
.gu > *{position:relative;z-index:1}

.gu h1,.gu h2,.gu h3{font-family:'Barlow Condensed','Inter',sans-serif;margin:0;font-weight:700;
  letter-spacing:.02em;text-transform:uppercase}
.gu .mono{font-family:'JetBrains Mono','IBM Plex Mono',Consolas,monospace;font-variant-numeric:tabular-nums}
.gu .wrap{max-width:1400px;margin:0 auto;padding:0 18px}
.gu .panel{background:rgba(255,255,255,.98);border:1px solid ${T.line};border-radius:8px;
  box-shadow:0 1px 2px rgba(13,22,32,.06),0 10px 26px -16px rgba(13,22,32,.5)}
.gu .eyebrow{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#8FE3DA;
  font-family:'JetBrains Mono',monospace;font-weight:600;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.gu .panel .eyebrow,.gu .sheet .eyebrow{color:${T.muted};text-shadow:none}
.gu .conteo{font-size:13px;color:#C8D6E2;font-weight:600;text-shadow:0 1px 6px rgba(0,0,0,.6)}

/* barra superior */
.gu .rail{position:relative;background:linear-gradient(100deg,${T.grafito} 0%,${T.grafito2} 55%,${T.grafito3} 100%);
  color:#fff;border-bottom:3px solid ${T.oro};padding-top:14px;overflow:hidden}
.gu .rail:before{content:"";position:absolute;inset:0;background-image:var(--fondo);
  background-size:cover;background-position:center 38%;opacity:.5}
.gu .rail:after{content:"";position:absolute;inset:0;
  background:linear-gradient(100deg,rgba(6,12,22,.90) 0%,rgba(10,20,34,.80) 48%,rgba(15,110,100,.40) 100%)}
.gu .rail .wrap{position:relative;z-index:2}
.gu .rail .top{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.gu .marca{display:flex;gap:14px;align-items:center}
.gu .rail h1{font-size:30px;line-height:1;letter-spacing:.06em}
.gu .rail .sub{font-size:11.5px;color:#9FE0D6;margin-top:5px;letter-spacing:.04em;font-weight:600;
  font-family:'JetBrains Mono',monospace}
.gu .rail .sub b{color:#F0DCA4;font-weight:700}

.gu .seccion-activa{margin-top:12px;font-size:11.5px;color:#BFD8E0;letter-spacing:.1em;
  text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:600;
  display:flex;align-items:center;gap:8px;padding-bottom:2px}
.gu .seccion-activa .ic{font-size:13px;opacity:.9}

/* botón flotante de navegación (reemplaza la barra de pestañas) */
.gu .fab-wrap{position:fixed;right:22px;bottom:22px;z-index:60;display:flex;
  flex-direction:column;align-items:flex-end;gap:10px}
.gu .fab{position:relative;width:58px;height:58px;border-radius:50%;border:2px solid ${T.oro};
  background:linear-gradient(180deg,${T.grafito3} 0%,${T.grafito2} 60%,${T.grafito} 100%);
  color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 22px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.18)}
.gu .fab:hover{filter:brightness(1.12)}
.gu .fab:active{transform:translateY(1px)}
.gu .fab-punto{position:absolute;top:1px;right:1px;width:15px;height:15px;border-radius:50%;
  border:2px solid ${T.grafito};animation:pulso 1.6s ease-in-out infinite}
.gu .fab-punto.rojo{background:${T.bad}}
.gu .fab-punto.amarillo{background:${T.warn}}
.gu .fab-punto.verde{background:${T.ok}}
@keyframes pulso{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}}
.gu .fab-menu{display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.98);
  border:1px solid ${T.line};border-radius:10px;padding:8px;min-width:236px;
  box-shadow:0 18px 44px rgba(0,0,0,.42)}
.gu .fab-item{display:flex;align-items:center;gap:9px;border:0;background:transparent;
  text-align:left;padding:9px 10px;border-radius:7px;cursor:pointer;font:inherit;
  font-size:13.5px;font-weight:600;color:${T.grafito2}}
.gu .fab-item:hover{background:#EAF5F4}
.gu .fab-item.activo{background:linear-gradient(180deg,rgba(34,193,180,.14),rgba(15,110,100,.14));
  color:${T.teal};border:1px solid ${T.teal}}
.gu .fab-item .ic{font-size:14px;opacity:.85;width:18px;text-align:center;flex:none}
.gu .fab-item .l{flex:1}
.gu .fab-item .n{opacity:.6;font-size:11px}
.gu .fab:focus-visible,.gu .fab-item:focus-visible{outline:3px solid ${T.cian};outline-offset:2px}
@media (prefers-reduced-motion:reduce){.gu .fab-punto{animation:none}}

.gu .estado{display:flex;align-items:center;gap:9px;font-size:12px;background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.18);border-radius:7px;padding:7px 11px;color:#DCE6EE;font-weight:600}
.gu .led{width:9px;height:9px;border-radius:50%;flex:none;box-shadow:0 0 8px currentColor}

/* botones */
.gu .btn{font-family:'Inter',sans-serif;font-size:13.5px;font-weight:700;border-radius:7px;
  padding:10px 18px;cursor:pointer;white-space:nowrap;letter-spacing:.01em;
  background:linear-gradient(180deg,#FFF 0%,#E9EDF1 100%);color:${T.grafito2};
  border:1px solid #C3CCD6;border-bottom-width:3px;border-bottom-color:#A8B3C0;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 2px 6px rgba(13,22,32,.13);
  transition:transform .07s ease,box-shadow .12s ease,filter .12s ease}
.gu .btn:hover{filter:brightness(1.04);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 4px 12px rgba(13,22,32,.2)}
.gu .btn:active{transform:translateY(2px);border-bottom-width:1px;margin-bottom:2px}
.gu .btn.teal{background:linear-gradient(180deg,${T.cian} 0%,${T.teal2} 55%,${T.teal} 100%);
  color:#02231F;border-color:${T.teal};border-bottom-color:#0A4A44;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 3px 10px rgba(15,110,100,.4)}
.gu .btn.oro{background:linear-gradient(180deg,${T.oro2} 0%,${T.oro} 55%,#A9871C 100%);
  color:#2A1F02;border-color:#A9871C;border-bottom-color:#7C6112;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 3px 10px rgba(169,135,28,.4)}
.gu .btn.oscuro{background:linear-gradient(180deg,${T.grafito3} 0%,${T.grafito2} 60%,${T.grafito} 100%);
  color:#fff;border-color:${T.grafito};border-bottom-color:#05090F;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 3px 10px rgba(13,22,32,.45)}
.gu .btn.claro{background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.07));
  color:#fff;border-color:rgba(255,255,255,.4);border-bottom-color:rgba(0,0,0,.35);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 3px 9px rgba(0,0,0,.3)}
.gu .btn.mini{padding:6px 12px;font-size:12.5px;border-bottom-width:3px}
.gu .btn.ghost{background:transparent;border:1px solid transparent;box-shadow:none;color:${T.muted};
  padding:6px 10px;font-weight:600}
.gu .btn.ghost:hover{color:${T.teal};background:#E7EFF1;filter:none;box-shadow:none}
.gu .btn.ghost:active{transform:translateY(1px);margin-bottom:0;border-bottom-width:1px}
.gu .btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.gu .btn:focus-visible,.gu input:focus-visible,.gu select:focus-visible,.gu textarea:focus-visible{
  outline:3px solid ${T.cian};outline-offset:1px}

/* formularios */
.gu input,.gu select,.gu textarea{font-family:'Inter',sans-serif;font-size:14px;padding:10px 12px;
  border:1px solid #C7D0DA;border-radius:6px;background:#fff;color:${T.ink};width:100%;
  box-shadow:inset 0 1px 3px rgba(13,22,32,.07)}
.gu textarea{min-height:76px;resize:vertical}
.gu label.f{display:block;font-size:11.5px;font-weight:700;color:${T.teal};margin-bottom:5px;
  text-transform:uppercase;letter-spacing:.06em}
.gu .req:after{content:" *";color:${T.bad}}
.gu .hint{font-size:12px;color:${T.muted};margin-top:5px}

.gu .grid{display:grid;grid-template-columns:1fr;gap:14px}
.gu .full{grid-column:1/-1}
.gu .row{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.gu .kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}
.gu .kpi{padding:14px 16px;border-left:4px solid ${T.line}}
.gu .kpi .v{font-size:30px;font-weight:700;line-height:1.1;margin-top:2px}
.gu .kpi .h{font-size:11.5px;color:${T.muted}}

.gu .cinta{display:flex;height:56px;border-radius:8px;overflow:hidden;border:1px solid ${T.line};background:#fff}
.gu .seg{border:0;cursor:pointer;color:#fff;display:flex;flex-direction:column;justify-content:center;
  padding:0 14px;min-width:0;font:inherit;text-align:left;transition:flex-grow .45s ease}
.gu .seg:hover{filter:brightness(1.1)}
.gu .seg .n{font-size:19px;font-weight:700;font-family:'JetBrains Mono',monospace;line-height:1}
.gu .seg .l{font-size:10px;letter-spacing:.11em;text-transform:uppercase;white-space:nowrap;font-weight:600}

/* tablas */
.gu table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:900px}
.gu thead th{text-align:left;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#BDF0E8;
  background:linear-gradient(180deg,${T.grafito3} 0%,${T.grafito2} 60%,${T.grafito} 100%);
  font-weight:700;padding:12px;white-space:nowrap;position:sticky;top:0;z-index:2;
  box-shadow:inset 0 -2px 0 ${T.cian}}
.gu tbody td{padding:11px 12px;border-bottom:1px solid #E9EDF2;vertical-align:top}
.gu tbody tr:nth-child(even){background:#F7F9FB}
.gu tbody tr:hover{background:#EAF5F4}
.gu .chip{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;
  padding:4px 10px 4px 8px;border-radius:4px;white-space:nowrap}
.gu .dot{width:8px;height:8px;border-radius:50%;flex:none}

/* modales */
.gu .modal{position:fixed;inset:0;background:rgba(6,12,20,.68);display:flex;align-items:flex-end;
  justify-content:center;z-index:70;backdrop-filter:blur(3px)}
.gu .sheet{background:#fff;border-radius:12px 12px 0 0;width:100%;max-width:860px;max-height:94vh;
  overflow:auto;padding:0 0 24px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.gu .sheet .cab{background:linear-gradient(180deg,${T.grafito3},${T.grafito2});color:#fff;padding:17px 20px;
  position:sticky;top:0;z-index:3;display:flex;justify-content:space-between;align-items:center;gap:12px;
  border-bottom:3px solid ${T.cian}}
.gu .sheet .cab h2{font-size:21px}
.gu .sheet .cuerpo{padding:20px}

.gu .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;
  background:linear-gradient(180deg,${T.grafito2},${T.grafito});color:#fff;padding:13px 20px;border-radius:9px;
  font-size:14px;font-weight:600;z-index:90;border-left:4px solid ${T.cian};
  box-shadow:0 10px 30px rgba(0,0,0,.5);max-width:92vw}
.gu .toast.err{border-left-color:${T.bad}}

/* asistente */
.gu .kb{border:1px solid ${T.line};border-radius:8px;padding:14px;margin-bottom:10px;background:#fff}
.gu .kb h3{font-size:17px;color:${T.grafito2};margin-bottom:6px}
.gu .kb .et{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  background:#E4F4F2;color:${T.teal};border-radius:4px;padding:3px 8px;margin-bottom:8px}
.gu .kb pre{background:${T.grafito};color:#9FE0D6;border-radius:6px;padding:12px;overflow-x:auto;
  font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.55;margin:8px 0 0}
.gu .kb .paso{font-size:13.5px;line-height:1.65;white-space:pre-line;color:#28323C}

.gu .check{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #EDF1F5}
.gu .check span{flex:1;font-size:13.5px}
.gu .check select{width:150px}

/* ----------------------------- fotos de revista --------------------------- */
.gu .fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:12px}
.gu .foto{margin:0;border:1px solid ${T.line};border-radius:7px;overflow:hidden;background:#fff}
.gu .foto img{display:block;width:100%;height:110px;object-fit:cover;background:#EDF1F5}
.gu .foto figcaption{display:flex;align-items:center;justify-content:space-between;gap:4px;
  padding:4px 4px 4px 8px;font-size:10.5px;color:${T.muted};border-top:1px solid ${T.line}}
.gu .foto figcaption span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gu .foto figcaption .btn{padding:2px 7px}
/* cámara en vivo */
.gu .cam-vista{position:relative;background:#0A1119;border-radius:9px;overflow:hidden;
  display:flex;align-items:center;justify-content:center;min-height:240px}
.gu .cam-vista video{display:block;width:100%;max-height:58vh;object-fit:contain;background:#0A1119}
.gu .cam-vista.espejo video{transform:scaleX(-1)}
.gu .cam-aviso{color:#fff;padding:26px 20px;text-align:center;font-size:14px;line-height:1.55;max-width:520px}
.gu .cam-aviso b{display:block;margin-bottom:6px;font-size:15px}
.gu .cam-barra{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-top:12px}
.gu .cam-barra .crece{flex:1}
.gu .cam-tomadas{display:flex;gap:8px;overflow-x:auto;margin-top:12px;padding-bottom:4px}
.gu .cam-tomadas figure{margin:0;position:relative;flex:0 0 auto}
.gu .cam-tomadas img{display:block;width:104px;height:78px;object-fit:cover;
  border:1px solid ${T.line};border-radius:6px;background:#EDF1F5}
.gu .cam-tomadas button{position:absolute;top:3px;right:3px;border:0;cursor:pointer;
  background:rgba(10,17,25,.78);color:#fff;border-radius:5px;padding:1px 6px;font-size:12px;line-height:1.5}
.gu .badge-foto{display:inline-block;margin-left:7px;font-size:10px;font-weight:700;
  background:#E4F4F2;color:${T.teal};border-radius:4px;padding:1px 6px;
  font-family:'JetBrains Mono',monospace;vertical-align:middle}

/* --------------------- revista de radios (formulario) --------------------- */
.gu .fotos-radio{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:10px}
.gu .foto-radio{border:1px solid ${T.line};border-radius:8px;padding:10px;background:#fff}
.gu .foto-radio .fr-etq{font-size:11.5px;font-weight:700;color:${T.grafito2};margin-bottom:7px;line-height:1.35}
.gu .foto-radio .fr-caja{border:1px dashed ${T.line};border-radius:6px;overflow:hidden;
  background:#EDF1F5;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center}
.gu .foto-radio .fr-caja img{display:block;width:100%;height:100%;object-fit:cover}
.gu .foto-radio .fr-vacia{color:${T.muted};font-size:11px;text-align:center;padding:8px}

/* --------------------- informe de revistas (pantalla) --------------------- */
.gu .informe{background:#fff;color:#101820;border:1px solid ${T.line};border-radius:8px;
  padding:30px 32px;font-size:12.5px;line-height:1.55}
.gu .inf-cab{display:flex;gap:16px;align-items:center;border-bottom:3px solid ${T.oro};padding-bottom:14px}
.gu .inf-cab img{width:60px;height:60px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid ${T.grafito2}}
.gu .inf-cab .tit{flex:1;min-width:0}
.gu .inf-cab h1{font-size:21px;color:${T.grafito};margin:0 0 3px;line-height:1.15}
.gu .inf-cab .sub{font-size:11.5px;color:${T.muted};font-family:'JetBrains Mono',monospace}
.gu .inf-cab .meta{text-align:right;font-size:10.5px;color:${T.muted};
  font-family:'JetBrains Mono',monospace;line-height:1.7;white-space:nowrap}
.gu .inf-resumen{display:flex;gap:22px;flex-wrap:wrap;margin-top:14px;padding-bottom:12px;
  border-bottom:1px solid ${T.line};font-size:12px;color:${T.muted}}
.gu .inf-resumen b{color:${T.grafito2};font-size:15px;font-family:'JetBrains Mono',monospace}
.gu .inf-ficha{margin-top:20px;padding-top:14px;border-top:1px solid #E7EBF1}
.gu .inf-ficha h2{font-size:14px;color:${T.teal};letter-spacing:.06em;margin-bottom:9px}
.gu .inf-datos{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
.gu .inf-datos > div{display:flex;gap:9px;padding:4px 0;border-bottom:1px solid #EFF2F6;font-size:11.5px}
.gu .inf-datos .k{flex:0 0 42%;color:${T.muted};font-size:9.5px;letter-spacing:.07em;
  text-transform:uppercase;font-family:'JetBrains Mono',monospace;padding-top:2px}
.gu .inf-datos .v{flex:1;min-width:0;word-break:break-word}
.gu .inf-parr{margin-top:9px;font-size:11.5px;line-height:1.6;white-space:pre-wrap}
.gu .inf-parr b{color:${T.grafito2}}
.gu .inf-fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}
.gu .inf-fotos figure{margin:0}
.gu .inf-fotos img{display:block;width:100%;height:auto;border:1px solid ${T.line};border-radius:5px}
.gu .inf-fotos figcaption{font-size:9px;color:${T.muted};margin-top:3px;
  font-family:'JetBrains Mono',monospace;text-align:center}
.gu .inf-sinfoto{margin-top:10px;padding:10px;text-align:center;color:${T.muted};font-size:11px;
  border:1px dashed ${T.line};border-radius:6px}
.gu .inf-pie{margin-top:24px;border-top:1px solid ${T.line};padding-top:9px;font-size:10px;
  color:#8592A6;display:flex;justify-content:space-between;gap:16px}

/* --------------- informe de revista de radios (pantalla e impresión) ------ */
/* Reproduce el formato físico ya en uso: tabla de datos con bordes cerrados y
   el número de ticket resaltado en amarillo, seguida del álbum de las tres
   fotos fijas. Un radio por ficha, igual que en el papel.                    */
.gu .inf-radio-ficha{margin-top:22px;padding-top:16px;border-top:1px solid #E7EBF1}
.gu .inf-radio-titulo{text-align:center;font-weight:800;font-size:13px;letter-spacing:.04em;
  text-transform:uppercase;border:1.4px solid #101820;padding:6px;margin-bottom:0}
.gu table.inf-radio-tabla{width:100%;border-collapse:collapse;table-layout:fixed;margin:0}
.gu table.inf-radio-tabla th,.gu table.inf-radio-tabla td{border:1.2px solid #101820;
  padding:6px 7px;font-size:10.5px;text-align:center;vertical-align:middle;word-break:break-word;color:#101820}
.gu table.inf-radio-tabla th{background:#EFF2F6;font-weight:700;text-transform:uppercase;font-size:9px;letter-spacing:.02em}
.gu table.inf-radio-tabla .destaca{background:#FFF176;padding:1px 5px;border-radius:2px;display:inline-block;margin-top:2px}
.gu .inf-radio-album-tit{text-align:center;font-weight:800;font-size:11.5px;letter-spacing:.03em;
  text-transform:uppercase;border:1.2px solid #101820;border-top:0;padding:5px;color:#101820}
.gu table.inf-radio-album{width:100%;border-collapse:collapse;table-layout:fixed;margin:0}
.gu table.inf-radio-album th,.gu table.inf-radio-album td{border:1.2px solid #101820;padding:6px;vertical-align:top;color:#101820}
.gu table.inf-radio-album th{background:#EFF2F6;font-weight:700;text-transform:uppercase;font-size:8.6px;text-align:center}
.gu table.inf-radio-album td{text-align:center}
.gu table.inf-radio-album img{display:block;width:100%;max-height:200px;object-fit:contain;margin:0 auto}
.gu .inf-radio-sinfoto{color:${T.muted};font-size:10px;padding:22px 6px}

/* --------------------- informe de revistas (impresión) -------------------- */
/* Al generar el PDF se clona el informe dentro de este contenedor, colgado del
   body: así el resultado no arrastra el fondo ni la barra de la aplicación.  */
#impresion{display:none}
#impresion.gu{background:#fff!important;min-height:0!important;padding:0!important;
  position:static!important;color:#101820}
#impresion.gu:before,#impresion.gu:after{display:none!important;content:none!important}
@media print{
  @page{size:A4 portrait;margin:12mm 10mm}
  html,body{background:#fff!important}
  body.modo-impresion > *{display:none!important}
  body.modo-impresion > #impresion{display:block!important}
  #impresion .informe{border:0;border-radius:0;padding:0;margin:0;font-size:9.6px;line-height:1.45}
  #impresion .inf-cab img{width:50px;height:50px}
  #impresion .inf-cab h1{font-size:17px}
  #impresion .inf-ficha{break-inside:avoid;page-break-inside:avoid;
    break-before:page;page-break-before:always}
  #impresion .inf-ficha:first-of-type{break-before:auto;page-break-before:auto}
  #impresion .inf-fotos img{max-height:62mm;object-fit:contain}
  #impresion .inf-datos > div,#impresion .inf-parr{font-size:8.8px}
  #impresion .inf-datos .k{font-size:7.8px}
  #impresion .inf-fotos figcaption{font-size:7.5px}
  #impresion .inf-radio-ficha{break-inside:avoid;page-break-inside:avoid;
    break-before:page;page-break-before:always}
  #impresion .inf-radio-ficha:first-of-type{break-before:auto;page-break-before:auto}
  #impresion table.inf-radio-tabla th,#impresion table.inf-radio-tabla td{font-size:8.6px;padding:4px 5px}
  #impresion table.inf-radio-album th{font-size:7.6px}
  #impresion table.inf-radio-album img{max-height:150px}
}

@media (min-width:900px){
  .gu .grid{grid-template-columns:1fr 1fr}
  .gu .kpis{grid-template-columns:repeat(5,1fr)}
  .gu .modal{align-items:center;padding:22px}
  .gu .sheet{border-radius:11px}
}
@media (prefers-reduced-motion:reduce){.gu *{transition:none!important}}
`;
