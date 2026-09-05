/* Explorador PGN 2027 — app.js (ECharts CDN + datos embebidos en window.PGN27) */
(function () {
  var D = window.PGN27, TOTAL = 166322078980116;
  function srcf(x) { return (window.SRC && window.SRC[x]) || x; }
  var fm = new Intl.NumberFormat("es-PY");
  function gs(v) { return "Gs. " + fm.format(v); }
  function bill(v) { return (v / 1e12).toFixed(2) + " billones Gs."; }
  function enCriollo(n) { return (D.salud.diccionario && D.salud.diccionario[n]) || ""; }
  var C = { verde:"#0b5d3b", verde2:"#2f8f64", miel:"#e0a92e", ladrillo:"#c0502f", azul:"#356b8c", tinta:"#1b2a24", papel:"#f7f4ee", gris:"#93a49c" };
  /* Paleta categórica única de todo el sitio: verde profundo, verde medio, miel,
     terracota, azul petróleo, verde azulado, bronce, caoba, piedra, tinta */
  /* Paleta categórica única del sitio: UN solo verde; el resto tonos terrosos/neutros
     bien diferenciados (miel, terracota, azul, caoba, piedra, tinta, cobre, glaciar, arena). */
  var PAL = ["#0b5d3b", "#e0a92e", "#c0502f", "#356b8c", "#8a4b34", "#7d8a82", "#1b2a24", "#c98a5b", "#4d6f87", "#b39a6b"];
  var CORTO = {
    "Ministerio de Economía y Finanzas": "MEF",
    "Ministerio de Salud Pública y Bienestar Social": "Salud",
    "Ministerio de Educación y Ciencias": "Educación",
    "Ministerio de Obras Públicas y Comunicaciones": "MOPC",
    "Ministerio de Desarrollo Social": "Desarrollo Social",
    "Ministerio del Interior": "Interior",
    "Poder Judicial y organismos auxiliares": "Poder Judicial",
    "Ministerio de Defensa Nacional": "Defensa",
    "Gobiernos Departamentales": "Gob. Departamentales",
    "Presidencia de la República": "Presidencia",
    "Salud": "Salud", "Educación": "Educación", "Infraestructura": "Infraestructura",
    "Seguridad": "Seguridad", "Protección social": "Protección social"
  };
  function corto(n) { return CORTO[n] || n; }
  function $id(i) { return document.getElementById(i); }
  /* Tooltip unificado: fondo blanco, borde de la red, sombra suave, confinado en móvil */
  var TT = { backgroundColor: "#fff", borderColor: "#d8ceb9", borderWidth: 1, padding: [10, 14], confine: true, textStyle: { color: "#1b2a24", fontSize: 13 }, extraCssText: "border-radius:8px;box-shadow:0 8px 22px rgba(27,42,36,.15);" };

  /* ---------- navegación por pestañas ---------- */
  var tabs = document.querySelectorAll("[data-tab]");
  /* deep-link por pestaña y compartir */
  function setHash(name) { try { history.replaceState(null, "", "#tab-" + name); } catch (e) {} }
  function currentUrl() { return location.href.split("#")[0] + "#tab-" + (document.querySelector(".tab.on") ? document.querySelector(".tab.on").dataset.tab : "resumen"); }
  var SB = document.querySelector(".sharebar");
  if (SB) {
    var ok = SB.querySelector(".sharebar-ok");
    function flashCopy() { if (ok) { ok.hidden = false; setTimeout(function () { ok.hidden = true; }, 1800); } }
    function buildLinks() {
      var u = encodeURIComponent(currentUrl());
      var txt = encodeURIComponent("En qué se gasta TU PLATA en Paraguay 2027 — presupuesto y crisis de salud, en simple");
      var m = { wa: "https://wa.me/?text=" + txt + "%20" + u, fb: "https://www.facebook.com/sharer/sharer.php?u=" + u, x: "https://twitter.com/intent/tweet?url=" + u + "&text=" + txt };
      SB.querySelectorAll("a[data-share]").forEach(function (a) { a.href = m[a.dataset.share] || "#"; });
    }
    buildLinks();
    SB.querySelectorAll("button[data-share]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.share === "native") {
          if (navigator.share) { navigator.share({ title: document.title, url: currentUrl() }).catch(function () {}); }
          else { copyUrl(); }
        } else if (b.dataset.share === "copy") { copyUrl(); }
      });
    });
    if (!navigator.share) SB.querySelector("button[data-share='native']").style.display = "none";
    function copyUrl() {
      var u = currentUrl();
      var done = function () { flashCopy(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, function () { fallback(u); done(); });
      else { fallback(u); done(); }
    }
    function fallback(u) { var t = document.createElement("textarea"); t.value = u; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); }
  }

  function show(name) {
    document.querySelectorAll(".tabpane").forEach(function (p) { p.hidden = p.id !== "tab-" + name; });
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle("on", on);
      if (t.hasAttribute("aria-selected")) t.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (name === "salud") setTimeout(function () { saludChart && saludChart.resize(); saludSerieChart && saludSerieChart.resize(); }, 0);
    if (name === "crisis") setTimeout(function () { crisisCharts && crisisCharts.forEach(function (c) { c && c.resize(); }); }, 0);
    setHash(name);
    if (window.SB && SB) buildLinks();
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.dataset.tab); }); });
  var tabList = document.querySelector(".tabs .wrap");
  if (tabList) tabList.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var btns = Array.prototype.slice.call(tabList.querySelectorAll("button"));
    var idx = btns.indexOf(document.activeElement);
    if (idx < 0) return;
    e.preventDefault();
    var n = (idx + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length;
    btns[n].focus(); btns[n].click();
  });
  if ((!window.echarts || !window.marked) && $id("netwarn")) $id("netwarn").classList.add("on");
  var h = (location.hash || "").match(/tab-(resumen|salud|crisis|informe)/);
  if (h) show(h[1]);

  document.querySelectorAll("[data-adj]").forEach(function (b) {
    b.addEventListener("click", function () {
      var inf = document.querySelector(".informe");
      if (!inf) return;
      var cur = parseFloat(window.getComputedStyle(inf).fontSize);
      inf.style.fontSize = Math.max(13, Math.min(20, cur + parseInt(b.dataset.adj))) + "px";
    });
  });
  [].forEach.call(document.querySelectorAll("[data-print]"), function (b) {
    b.addEventListener("click", function () { window.print(); });
  });

  /* ---------- RESUMEN ---------- */
  var cards = $id("cards");
  [["Cuánto se presupuesta", bill(TOTAL), "≈ USD 25.700 M · Ley PGN 2027, pág. 1"],
   ["Cuánto más que 2026", "+11,2%", "Ley 7.609/2025 y proyecto PGN 2027 · pág. 1"],
   ["Cuánto de la economía", "≈38,4% del PIB", "proyección · Mensaje del Proyecto, pág. 6"],
   ["Inflación esperada 2027", "3,5%", "Mensaje del Proyecto · pág. 6"]].forEach(function (c) {
    var el = document.createElement("div"); el.className = "stat";
    el.innerHTML = '<div class="stat-k">' + c[0] + '</div><div class="stat-v">' + c[1] + '</div><div class="stat-f">' + c[2] + "</div>";
    cards.appendChild(el);
  });

  var instChart = echarts.init($id("instituciones"));
  function instData(year) {
    return D.instituciones_2027.map(function (it) {
      var v = D.variaciones.find(function (x) { return x.nombre === it.nombre; });
      var g = year === "2027" ? it.gs_2027 : (v ? v.gs_2026 : 0);
      return { name: it.nombre, value: g, pct: (g / TOTAL * 100).toFixed(1), cita: "Ley PGN 2027 · pág. " + it.pagina };
    }).sort(function (a, b) { return b.value - a.value; });
  }
  function renderInst(year) {
    instChart.setOption({
      tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b><br>" + bill(p.value) + " (" + p.data.pct + "%)<br><span class='cita'>" + p.data.cita + "</span>"; } }, TT),
      series: [{ type: "treemap", roam: false, nodeClick: false, breadcrumb: { show: false },
        label: { show: true, fontSize: 10, fontWeight: 600, color: "#fff", lineHeight: 15,
          textShadowColor: "rgba(27,42,36,.5)", textShadowBlur: 3,
          formatter: function (p) { return corto(p.name) + "\n" + pct01(p.value); } },
        upperLabel: { show: false },
        itemStyle: { borderColor: "#fff", borderWidth: 1.5, borderRadius: 3 },
        data: instData(year).map(function (d, i) { d.itemStyle = { color: PAL[i % PAL.length] }; return d; }) }]
    });
  }
  function pct01(v) { return (v / TOTAL * 100).toFixed(1) + "%"; }
  $id("tg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    [].forEach.call(this.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
    b.classList.add("on"); renderInst(b.dataset.y);
  });
  renderInst("2027");

  echarts.init($id("economia")).setOption({
    tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b><br>" + bill(p.value) + " (" + p.percent + "%)<br><span class='cita'>" + p.data.fuente + "</span>"; } }, TT),
    graphic: [{ type: "text", left: "center", top: "42%", style: { text: "Total PGN\n" + (TOTAL / 1e12).toFixed(1).replace(".", ",") + " billones", textAlign: "center", fontSize: 14, fontWeight: 700, fill: C.tinta, lineHeight: 19 } }],
    series: [{ type: "pie", radius: ["44%", "72%"], center: ["50%", "48%"], padAngle: 3, itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 5 },
      color: [C.verde, C.miel, C.ladrillo],
      data: D.economia.map(function (e) { return { value: e.gs, name: e.categoria, fuente: e.fuente }; }),
      label: { formatter: "{b}\n{d}%", color: "#1b2a24", fontWeight: 600, fontSize: 12.5, lineHeight: 18 },
      labelLine: { length: 14, length2: 8, lineStyle: { color: "#cfc6b2" } } }]
  });

  echarts.init($id("areas")).setOption({
    tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b><br>" + bill(p.value) + " (" + p.data.pct + "%)<br><span class='cita'>Ley PGN 2027 · pág. " + p.data.pagina + "</span>"; } }, TT),
    grid: { left: 150, right: 40, top: 10, bottom: 30 },
    xAxis: { type: "value", axisLabel: { color: "#5b6b63", formatter: function (v) { return (v / 1e12).toFixed(1).replace(".", ",") + " bill"; } }, splitLine: { lineStyle: { color: "#e7ece6" } } },
    yAxis: { type: "category", inverse: true, data: D.areas.map(function (a) { return corto(a.area); }),
      axisLabel: { interval: 0, width: 130, overflow: "break", color: "#33443c" } },
    series: [{ type: "bar", barWidth: "60%", itemStyle: { color: C.verde, borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: "right", color: "#33443c", fontSize: 11.5, fontWeight: 600, formatter: function (p) { return p.data.pct + "%"; } },
      data: D.areas.map(function (a) { return { value: a.gs, name: a.area, pct: a.pct, pagina: a.pagina }; }) }]
  });

  var vars = D.variaciones.slice().sort(function (a, b) { return b.delta_pct - a.delta_pct; });
  echarts.init($id("variaciones")).setOption({
    tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b><br>2026: " + bill(p.data.v26) + "<br>2027: " + bill(p.data.v27) + "<br><b>" + (p.value > 0 ? "+" : "") + p.value + "%</b><br><span class='cita'>" + p.data.fuente + "</span>"; } }, TT),
    grid: { left: 160, right: 50, top: 10, bottom: 30 },
    xAxis: { type: "value", axisLabel: { formatter: "{value}%", color: "#5b6b63" }, splitLine: { lineStyle: { color: "#e7ece6" } } },
    yAxis: { type: "category", inverse: true, data: vars.map(function (v) { return corto(v.nombre); }),
      axisLabel: { interval: 0, width: 130, overflow: "break", color: "#33443c" } },
    series: [{ type: "bar", barWidth: "60%",
      label: { show: true, position: "right", color: "#33443c", fontSize: 11.5, fontWeight: 600, formatter: function (p) { return (p.value > 0 ? "+" : "") + p.value + "%"; } },
      data: vars.map(function (v) { return { value: v.delta_pct, name: v.nombre, v26: v.gs_2026, v27: v.gs_2027, fuente: v.fuente, itemStyle: { color: v.delta_pct >= 0 ? C.verde2 : C.ladrillo, borderRadius: [0, 6, 6, 0] } }; }) }]
  });

  /* ---------- SALUD ---------- */
  var s = D.salud;
  var prog = s.programas.slice().sort(function (a, b) { return b.monto_gs - a.monto_gs; });
  var dif = s.total_gs - s.total_ley_gs;
var hCards = [["Total Salud 2027 (proyecto)", bill(s.total_ley_gs), "Ley PGN 2027 · Gs. 18,17 billones"],
              ["Crecimiento vs 2026", "+77% (+Gs. 7,9 billones)", "de Gs. 10,26 a Gs. 18,17 billones"],
              ["Presupuesto 2026", bill(s.gs_2026), "Ley 7.609/2025"]].forEach(function (c) {
    var el = document.createElement("div"); el.className = "stat";
    el.innerHTML = '<div class="stat-k">' + c[0] + '</div><div class="stat-v">' + c[1] + '</div><div class="stat-f">' + c[2] + "</div>";
    $id("scards").appendChild(el);
  });

  $id("saludNotaTotal").textContent = "Nota: la cifra oficial del presupuesto (Ley) es Gs. 18,17 billones (la de las tarjetas). El detalle por programas de esta gráfica llega a Gs. 18,18 billones porque incluye Gs. 6.751 millones de 'partidas no asignables a programas' — la diferencia es de solo 0,04%.";

  var saludSerieChart = null;
  if (s.serie) {
    saludSerieChart = echarts.init($id("saludSerie"));
    saludSerieChart.setOption({
      tooltip: { trigger: "axis", formatter: function (ps) {
          var p = ps[0]; var v = p.value;
          return "<b>" + p.name + "</b>: " + (v == null ? "sin dato" : v.toLocaleString("es-PY") + " billones Gs.");
        } },
      grid: { left: 70, right: 20, top: 24, bottom: 40 },
      xAxis: { type: "category", data: s.serie.anios, axisLabel: { color: "#33443c", interval: 0 } },
      yAxis: { type: "value", name: "Gs. billones", axisLabel: { color: "#5b6b63" }, splitLine: { lineStyle: { color: "#e7ece6" } } },
      series: [{ type: "bar", barWidth: "52%",
        data: s.serie.billones.map(function (v) {
          return v == null ? null : { value: v,
            label: { show: true, position: "top", formatter: v.toLocaleString("es-PY"), color: "#33443c" } };
        }),
        itemStyle: { color: C.verde2, borderRadius: [5, 5, 0, 0] } }]
    });
    if ($id("saludSerie").clientWidth === 0) setTimeout(function () { saludSerieChart && saludSerieChart.resize(); }, 60);
  }

  var saludChart = echarts.init($id("saludDonut"));
  saludChart.setOption({
    tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b><br>" + bill(p.value) + " · " + p.data.pct + "%<br><span class='cita'>" + "Programación de Gastos del MSPBS · pág. " + p.data.pagina + "</span>"; } }, TT),
    legend: { type: "scroll", orient: "horizontal", bottom: 2, left: "center", width: "94%",
      icon: "circle", itemWidth: 10, itemHeight: 10, itemGap: 14,
      textStyle: { color: "#33443c", fontSize: 11, fontWeight: 600 } },
    graphic: [{ type: "text", left: "center", top: "38%", style: { text: "Total (por programas)\n" + (s.total_gs / 1e12).toFixed(2).replace(".", ",") + " billones", textAlign: "center", fontSize: 16, fontWeight: 700, fill: C.tinta, lineHeight: 22 } }],
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "44%"], padAngle: 3, minAngle: 4,
      itemStyle: { borderColor: "#fff", borderWidth: 2, borderRadius: 4 },
      label: { show: true, formatter: function (p) { var v = p.data.pct; return (v >= 1 ? v.toFixed(0) + "%" : v >= 0.1 ? v.toFixed(1) + "%" : ""); }, color: "#1b2a24", fontWeight: 600, fontSize: 12 },
      labelLine: { length: 12, length2: 8, lineStyle: { color: "#cfc6b2" } },
      color: PAL.slice(0, prog.length),
      data: prog.map(function (p) { return { value: p.monto_gs, name: p.programa, pct: p.pct, fuente: p.fuente, pagina: p.pagina }; })}]
  });

  var li = $id("saludList");
  prog.forEach(function (p, i) {
    var row = document.createElement("div"); row.className = "progrow";
    var barPct = Math.max(1, p.pct);
    row.innerHTML =
      '<div class="pr-num">' + String(i + 1).padStart(2, "0") + "</div>" +
      '<div class="pr-body"><div class="pr-top"><div><div class="pr-name">' + p.programa +
      "" +
      '</div><div class="pr-desc">' + (enCriollo(p.programa) || "—") + "</div></div>" +
      '<div class="pr-meta"><div class="pr-amt">' + bill(p.monto_gs) + '</div><div class="pr-pct">' + p.pct + "%</div></div></div>" +
      '<div class="pr-bar"><div class="pr-bar-in" style="width:' + barPct + '%"></div></div>' +
      '<div class="pr-src cita">' + p.fuente + " · pág. " + p.pagina + "</div></div>";
    row.querySelector(".pr-num").style.color = PAL[i % PAL.length];
    li.appendChild(row);
  });

  $id("saludNota").textContent = s.nota;
  var dl = $id("saludDefs");
  Object.keys(D.salud.diccionario).forEach(function (k) {
    var dd = document.createElement("div"); dd.className = "def";
    dd.innerHTML = "<b>" + k + "</b> — " + D.salud.diccionario[k];
    dl.appendChild(dd);
  });

  /* ---------- CRISIS (pestaña "Salud en crisis") ---------- */
  var CR = window.CRISIS || {};
  var crisisCharts = [];
  if (CR.cards) CR.cards.forEach(function (c) {
    var el = document.createElement("div"); el.className = "stat";
    el.innerHTML = '<div class="stat-k">' + c[0] + '</div><div class="stat-v">' + c[1] + '</div><div class="stat-f">' + c[2] + "</div>";
    $id("crisisCards").appendChild(el);
  });

  if (CR.deuda) {
    var ch = echarts.init($id("crisisDeuda")); crisisCharts.push(ch);
    ch.setOption({
      tooltip: Object.assign({ valueFormatter: function (v) { return "≈ USD " + v.toLocaleString("es-PY") + " M"; } }, TT),
      grid: { left: 60, right: 34, top: 30, bottom: 56 },
      xAxis: { type: "category", data: CR.deuda.periodos, axisLabel: { color: "#33443c", fontWeight: 600 } },
      yAxis: { type: "value", name: "USD M", nameTextStyle: { color: "#5b6b63", align: "left" }, axisLabel: { color: "#5b6b63" }, splitLine: { lineStyle: { color: "#e7ece6" } } },
      series: [{ type: "line", smooth: true, symbolSize: 9, data: CR.deuda.usd_m,
        lineStyle: { color: C.ladrillo, width: 3 }, itemStyle: { color: C.ladrillo },
        areaStyle: { color: "rgba(176,72,47,.12)" },
        label: { show: true, formatter: "{c}", color: "#1b2a24", fontSize: 11, fontWeight: 600, backgroundColor: "#fff", borderColor: "#e7ece6", borderWidth: 1, borderRadius: 6, padding: [4, 6] } }],
      graphic: [{ type: "text", left: 3, bottom: 8, style: { text: CR.deuda.nota, width: "92%", fontSize: 11, fill: "#5b6b63" } }]
    });
  }

  function bmk(container, py, lac, oecd, name, fuente, color) {
    var c = echarts.init(container); crisisCharts.push(c);
    c.setOption({
      tooltip: Object.assign({ formatter: function (p) { return "<b>" + p.name + "</b>: " + p.value + (name.indexOf("%") >= 0 ? "%" : "") + "<br><span class='cita'>" + fuente + "</span>"; } }, TT),
      grid: { left: 60, right: 20, top: 32, bottom: 40 },
      xAxis: { type: "category", data: ["Paraguay", "Latam & Caribe", "OCDE"], axisLabel: { color: "#33443c", fontWeight: 600 } },
      yAxis: { type: "value", axisLabel: { color: "#5b6b63" } },
      series: [{ type: "bar", barWidth: "46%",
        data: [
          { value: py, itemStyle: { color: color } },
          { value: lac, itemStyle: { color: "#c9d2cc" } },
          { value: oecd, itemStyle: { color: "#dacfbe" } }],
        label: { show: true, position: "top", formatter: "{c}" + (name.indexOf("%") >= 0 ? "%" : ""), color: "#1b2a24", fontSize: 11.5, fontWeight: 600 },
        itemStyle: { borderRadius: [6, 6, 0, 0] } }]
    });
  }
  if (CR.oop) bmk($id("crisisOop"), CR.oop.py, CR.oop.lac, CR.oop.oecd, "Gasto de bolsillo %", CR.oop.fuente, C.ladrillo);
  if (CR.pib) bmk($id("crisisPib"), CR.pib.py, CR.pib.lac, CR.pib.oecd, "Gasto salud % PIB", CR.pib.fuente, C.verde2);

  if (CR.salario) {
    var cs = echarts.init($id("crisisSalario")); crisisCharts.push(cs);
    cs.setOption({
      tooltip: Object.assign({ valueFormatter: function (v) { return v + "%"; } }, TT),
      grid: { left: 60, right: 20, top: 36, bottom: 40 },
      xAxis: { type: "category", data: ["Inflación acumulada 2012-2025", "Poder de compra salarial (2012=100)"], axisLabel: { color: "#33443c", width: 150, overflow: "break", fontWeight: 600 } },
      yAxis: { type: "value", max: 120, axisLabel: { color: "#5b6b63" } },
      series: [{ type: "bar", barWidth: "46%", data: [
        { value: CR.salario.infl_acum, itemStyle: { color: C.ladrillo, borderRadius: [6, 6, 0, 0] } },
        { value: CR.salario.poder_compra, itemStyle: { color: C.miel, borderRadius: [6, 6, 0, 0] } }],
        label: { show: true, position: "top", formatter: "{c}%", color: "#1b2a24", fontSize: 11.5, fontWeight: 600 } }]
    });
  }

  if (CR.timeline) {
    var tl = $id("crisisTimeline");
    CR.timeline.forEach(function (t) {
      var li = document.createElement("li");
      li.innerHTML = "<b>" + t[0] + "</b> — " + t[1] + " <span class='cita'>(verificado/contexto, Registro)</span>";
      tl.appendChild(li);
    });
  }
  if (CR.nota) $id("crisisNota").textContent = CR.nota;

  if (CR.glosario) {
    var gl = $id("crisisGlosario");
    CR.glosario.forEach(function (g) {
      var dd = document.createElement("div"); dd.className = "def";
      dd.innerHTML = "<b>" + g[0] + "</b> — " + g[1];
      gl.appendChild(dd);
    });
  }

  if (window.marked && $id("informeMd")) {
    try {
      var iw = $id("informeWrap");
      iw.innerHTML = marked.parse($id("informeMd").textContent);
      iw.querySelectorAll("table").forEach(function (t) {
        if (!t.parentNode.classList.contains("tab-scroll")) {
          var w = document.createElement("div"); w.className = "tab-scroll";
          t.parentNode.insertBefore(w, t); w.appendChild(t);
        }
      });
    } catch (e) {}
  }

  /* fuentes */
  var fu = $id("fuentes");
  D.fuentes.forEach(function (f) {
    var liEl = document.createElement("li");
    liEl.innerHTML = f.nombre + (f.url ? " · <a href='" + f.url + "' target='_blank' rel='noopener'>enlace</a>" : "");
    fu.appendChild(liEl);
  });
})();
