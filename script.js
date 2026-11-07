// Holy Homes Realty site script
var WHATSAPP_NUMBER = "919619599882";
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
function openWA(text) {
  var u = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  try { window.top.location.href = u; } catch (e) { window.open(u, "_blank"); }
}

// menu + year
(function () {
  var btn = $(".menu-btn"), menu = document.getElementById("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

// home enquiry form
(function () {
  var form = document.getElementById("enquiry"), status = document.getElementById("form-status");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
    var need = form.elements.need.value, msg = form.elements.message.value.trim();
    if (!name || !phone) { status.textContent = "Please add your name and phone number."; (name ? form.elements.phone : form.elements.name).focus(); return; }
    status.textContent = "";
    openWA("Hello Holy Homes Realty, I'm " + name + " (" + phone + "). I'd like to: " + need + "." + (msg ? "\n" + msg : ""));
  });
})();

// WhatsApp forms (requirement, list property, contact)
(function () {
  $$("[data-wa-form]").forEach(function (form) {
    var params = new URLSearchParams(location.search), who = params.get("who");
    if (who) {
      var map = { owner: "Owner selling a flat", rent: "Owner renting out", builder: "Builder / developer" };
      $$('input[type="radio"]', form).forEach(function (r) { if (r.value === map[who]) r.checked = true; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = [form.getAttribute("data-intro")], missing = null;
      $$(".q", form).forEach(function (q) {
        var label = q.getAttribute("data-q"), val = "";
        var boxes = $$("input[type=checkbox],input[type=radio]", q);
        if (boxes.length) val = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }).join(", ");
        else { var f = $("input,select,textarea", q); val = f ? f.value.trim() : ""; }
        q.classList.remove("bad");
        if (!val && q.hasAttribute("data-required")) { q.classList.add("bad"); if (!missing) missing = q; }
        if (val) lines.push(label + ": " + val);
      });
      var st = $("[data-status]", form);
      if (missing) { st.textContent = "Please fill the options marked above."; var f = $("input,select,textarea", missing); if (f) f.focus(); return; }
      st.textContent = "";
      openWA(lines.join("\n"));
    });
  });
})();

// listing filters
(function () {
  var root = $("[data-filter-root]");
  if (!root) return;
  var fixed = root.getAttribute("data-fixed-type") || "";
  var cards = $$(".pcard[data-kind]", root), countEl = $("[data-count]", root), empty = $("[data-empty]", root), note = $("[data-dev-note]", root);
  var st = { type: fixed || "all", loc: "", bhk: "", budget: "", dev: "" };
  var p = new URLSearchParams(location.search);
  ["type", "loc", "bhk", "budget", "dev"].forEach(function (k) { if (p.get(k) && !(k === "type" && fixed)) st[k] = p.get(k); });
  var devs = {}; try { devs = JSON.parse(root.getAttribute("data-devs") || "{}"); } catch (e) {}
  ["loc", "bhk", "budget"].forEach(function (k) {
    var el = $('[name="' + k + '"]', root);
    if (!el) return;
    if (!$$("option", el).some(function (o) { return o.value === st[k]; })) st[k] = "";
    el.value = st[k];
    el.addEventListener("change", function () { st[k] = el.value; render(); });
  });
  $$("[data-type]", root).forEach(function (b) { b.addEventListener("click", function () { st.type = b.getAttribute("data-type"); render(); }); });
  var clr = $("[data-clear]", root);
  if (clr) clr.addEventListener("click", function () {
    st.loc = st.bhk = st.budget = st.dev = ""; if (!fixed) st.type = "all";
    ["loc", "bhk", "budget"].forEach(function (k) { var el = $('[name="' + k + '"]', root); if (el) el.value = ""; });
    render();
  });
  function ok(c) {
    var kind = c.getAttribute("data-kind");
    if (st.bhk === "comm") { if (kind !== "comm") return false; }
    else if (st.type === "buy") { if (kind === "rent") return false; } else if (st.type !== "all" && kind !== st.type) return false;
    if (st.loc && c.getAttribute("data-zone") !== st.loc && c.getAttribute("data-loc") !== st.loc) return false;
    if (st.bhk && st.bhk !== "comm") {
      var b = (c.getAttribute("data-bhk") || "").split(" ");
      if (st.bhk === "5" ? !b.some(function (x) { return +x >= 5; }) : b.indexOf(st.bhk) < 0) return false;
    }
    if (st.dev && (" " + (c.getAttribute("data-dev") || "") + " ").indexOf(" " + st.dev + " ") < 0) return false;
    if (st.budget) {
      var parts = st.budget.split(":"), r = parts[1].split("-"), lo = +r[0], hi = r[1] === "" ? 1e9 : +r[1];
      if (parts[0] === "r" ? (kind !== "rent" && kind !== "comm") : (kind === "rent" || kind === "comm")) return false;
      var pm = c.getAttribute("data-pmin");
      if (pm !== "" && !(+pm >= lo && +pm < hi)) return false;
    }
    return true;
  }
  function render() {
    var n = 0;
    cards.forEach(function (c) { var v = ok(c); c.hidden = !v; if (v) n++; });
    $$("[data-type]", root).forEach(function (b) { var t = b.getAttribute("data-type"); b.setAttribute("aria-pressed", (t === st.type || (st.type === "buy" && t === "all")) ? "true" : "false"); });
    var noun = root.getAttribute("data-noun") || "property";
    if (countEl) countEl.textContent = n + " " + (noun === "property" ? (n === 1 ? "property" : "properties") : noun + (n === 1 ? "" : "s"));
    if (empty) empty.hidden = n > 0;
    if (note) { note.hidden = !st.dev; $("b", note).textContent = devs[st.dev] || st.dev; }
  }
  render();
})();

// directory area chips
(function () {
  var root = $("[data-dir-root]");
  if (!root) return;
  var rows = $$(".drow", root), chips = $$(".achip", root), cnt = $("[data-dcount]", root);
  var area = new URLSearchParams(location.search).get("area") || "";
  function render() {
    var n = 0;
    rows.forEach(function (r) { var v = !area || r.getAttribute("data-area") === area; r.hidden = !v; if (v) n++; });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-area") === area ? "true" : "false"); });
    if (cnt) cnt.textContent = n + (n === 1 ? " project" : " projects") + (area ? " in " + area : "");
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { area = c.getAttribute("data-area"); render(); }); });
  if (area && !chips.some(function (c) { return c.getAttribute("data-area") === area; })) area = "";
  render();
})();
