// Holy Homes Realty site script
// WhatsApp number the enquiry form sends to (country code + number, no "+").
var WHATSAPP_NUMBER = "919619599882";

(function () {
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Open menu");
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var form = document.getElementById("enquiry");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var need = form.elements.need.value;
      var msg = form.elements.message.value.trim();
      if (!name || !phone) {
        status.textContent = "Please add your name and phone number.";
        (name ? form.elements.phone : form.elements.name).focus();
        return;
      }
      status.textContent = "";
      var text = "Hello Holy Homes Realty, I'm " + name + " (" + phone + "). I'd like to: " + need + "." + (msg ? "\n" + msg : "");
      var u = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text); try { window.top.location.href = u; } catch (e) { window.open(u, "_blank"); }
    });
  }
})();

// Projects & listings filter (type tabs + developer chips + show more)
(function () {
  var root = document.querySelector("[data-filters]");
  var grid = document.querySelector("[data-grid]");
  if (!root || !grid) return;
  var cards = [].slice.call(grid.querySelectorAll(".pcard"));
  var moreBtn = document.querySelector("[data-more]");
  var empty = document.querySelector("[data-empty]");
  var chipsBox = root.querySelector(".chips");
  var state = { type: "new", dev: "", all: false };
  var LIMIT = 9;
  function setPressed(sel, attr, val) {
    [].forEach.call(root.querySelectorAll(sel), function (b) { b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false"); });
  }
  function render() {
    var shown = 0, match = 0;
    chipsBox.hidden = (state.type === "resale" || state.type === "rent");
    cards.forEach(function (c) {
      var ok = (state.type === "all" || c.getAttribute("data-kind") === state.type) &&
               (!state.dev || c.getAttribute("data-dev") === state.dev);
      if (ok) match++;
      var vis = ok && (state.all || match <= LIMIT);
      c.hidden = !vis;
      if (vis) shown++;
    });
    empty.hidden = match > 0;
    if (match > shown) { moreBtn.hidden = false; moreBtn.textContent = "Show all " + match; } else { moreBtn.hidden = true; }
    setPressed(".tab", "data-type", state.type);
    setPressed(".chip", "data-dev", state.dev);
  }
  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-type],[data-dev]");
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute("data-type")) { state.type = t.getAttribute("data-type"); if (state.type === "resale" || state.type === "rent") state.dev = ""; }
    else { state.dev = t.getAttribute("data-dev"); if (state.type === "resale" || state.type === "rent") state.type = "new"; }
    state.all = false; render();
  });
  moreBtn.addEventListener("click", function () { state.all = true; render(); });
  [].forEach.call(document.querySelectorAll("[data-set-type]"), function (a) {
    a.addEventListener("click", function () { state.type = a.getAttribute("data-set-type"); state.dev = ""; state.all = false; render(); });
  });
  render();
})();
