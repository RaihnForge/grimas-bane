/* Grima's Bane — popup controller. */

var DEFAULTS = {
  master: true,
  youtube: true,
  facebook: true,
  instagram: true,
  tiktok: true
};

var KEYS = ["master", "youtube", "facebook", "instagram", "tiktok"];

function reflect(settings) {
  KEYS.forEach(function (k) {
    var el = document.getElementById(k);
    if (el) el.checked = !!settings[k];
  });
  // When the master is off, dim the per-site rows.
  var dim = !settings.master;
  document.querySelectorAll(".row[data-key]").forEach(function (row) {
    row.classList.toggle("dim", dim);
  });
}

function loadAndRender() {
  chrome.storage.sync.get(DEFAULTS, reflect);
}

function save(partial) {
  chrome.storage.sync.set(partial);
}

document.addEventListener("DOMContentLoaded", function () {
  loadAndRender();

  KEYS.forEach(function (k) {
    var el = document.getElementById(k);
    if (!el) return;
    el.addEventListener("change", function () {
      var patch = {};
      patch[k] = el.checked;
      save(patch);
      if (k === "master") {
        document.querySelectorAll(".row[data-key]").forEach(function (row) {
          row.classList.toggle("dim", !el.checked);
        });
      }
    });
  });

  var reload = document.getElementById("reload");
  if (reload) {
    reload.addEventListener("click", function (e) {
      e.preventDefault();
      chrome.tabs.reload();
      window.close();
    });
  }
});
