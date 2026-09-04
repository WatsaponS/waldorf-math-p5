/* Guided session mode for subject pages.
   When a page is opened as page.html?s=<subject>-<n> (a link from plan.html),
   this activates the lesson tab that session uses and shows a banner with the
   session's instructions plus done/next controls that share the plan's
   localStorage progress. Without the ?s= parameter it does nothing. */
(function(){
  "use strict";
  if(!window.WALDORF_SESSIONS) return;

  var m = location.search.match(/[?&]s=([a-z]+)-(\d+)/);
  if(!m) return;

  var DATA = window.WALDORF_SESSIONS;
  var subject = null;
  for(var i=0;i<DATA.subjects.length;i++){
    if(DATA.subjects[i].id === m[1]){ subject = DATA.subjects[i]; break; }
  }
  if(!subject) return;
  var idx = parseInt(m[2], 10) - 1;
  if(idx < 0 || idx >= subject.sessions.length) return;
  var ses = subject.sessions[idx];
  var key = subject.id + "-" + (idx+1);

  function readState(){
    try{ return JSON.parse(localStorage.getItem(DATA.STORE_KEY) || "{}"); }catch(e){ return {}; }
  }
  function markDone(){
    var st = readState();
    st[key] = true;
    try{ localStorage.setItem(DATA.STORE_KEY, JSON.stringify(st)); }catch(e){}
  }

  /* open the lesson tab this session uses */
  var tabBtn = document.querySelector('nav.tabs button[data-target="' + ses.tab + '"]');
  if(tabBtn) tabBtn.click();

  /* banner above the lesson tabs */
  var tabs = document.querySelector("nav.tabs");
  if(!tabs) return;

  var done = !!readState()[key];
  var banner = document.createElement("div");
  banner.className = "card session-banner";
  banner.style.setProperty("--card-accent", subject.color);

  /* Artwork follows the real session number so added sessions never reuse old cells. */
  var artCell = idx;
  var extraArt = artCell >= 10;
  var artIndex = extraArt ? artCell - 10 : artCell;
  var artPos = (artIndex % 5) * 25 + "% " + (extraArt ? "50%" : (Math.floor(artIndex / 5) ? "100%" : "0%"));
  var artFile = "assets/session-sheet-" + subject.id + (extraArt ? "-extra" : "") + ".jpg";
  var artSize = extraArt ? "500% 100%" : "500% 200%";

  var hasNext = idx + 1 < subject.sessions.length;
  var nextUrl = subject.page + "?s=" + subject.id + "-" + (idx+2);
  var planUrl = "plan.html#subj-" + subject.id;

  banner.innerHTML =
    "<div class='session-banner-art' aria-hidden='true' style=\"background-image:url('" + artFile + "');background-size:" + artSize + ";background-position:" + artPos + "\"></div>" +
    "<div class='session-banner-copy'>" +
    "<div class='sb-eyebrow'>แผนการเรียน Home School · " + subject.name +
      " · Session " + (idx+1) + "/" + subject.sessions.length +
      (done ? " · <b class='sb-done-mark'>เรียนจบแล้ว ✓</b>" : "") + "</div>" +
    "<h2 class='sb-title'>" + ses.t + "</h2>" +
    "<p class='sb-desc'>" + ses.d + "</p>" +
    "<div class='sb-actions'>" +
      "<button class='btn' id='sbDone'>✓ เรียนจบ session นี้</button>" +
      (hasNext ? "<button class='btn ghost' id='sbDoneNext'>✓ จบแล้ว ไป session ถัดไป →</button>" : "") +
      "<a class='sb-back' href='" + planUrl + "'>กลับสู่แผนการเรียน</a>" +
    "</div></div>";

  tabs.parentNode.insertBefore(banner, tabs);

  document.getElementById("sbDone").addEventListener("click", function(){
    markDone();
    location.href = planUrl;
  });
  var nextBtn = document.getElementById("sbDoneNext");
  if(nextBtn){
    nextBtn.addEventListener("click", function(){
      markDone();
      location.href = nextUrl;
    });
  }

  /* keep the banner visible on load */
  banner.scrollIntoView({block:"nearest"});
})();
