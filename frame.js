// iPhone Safari fills the area behind the clock with whatever lies just above the top of
// the screen. A strip of velvet sits there (--above in stage.css) and the window opens
// scrolled down by exactly that strip and stays there, so the clock sits on the paper,
// not on a flat colour. Nothing is pinned to the screen edges.
// Same frame as ivolopes.com.
(function () {
  var y = 160;
  function keep() { if (Math.abs(window.scrollY - y) > 0.5) window.scrollTo(0, y); }
  keep();
  document.addEventListener("DOMContentLoaded", keep);
  window.addEventListener("load", keep);
  window.addEventListener("resize", keep);
  window.addEventListener("pageshow", keep);
  window.addEventListener("scroll", keep, { passive: true });
})();
