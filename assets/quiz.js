/* Reusable tap-to-answer quiz used by every subject page.
   makeQuiz(rootEl, {
     items: [{prompt, answer, explain?, choices?}],   // answer = correct choice text
     fixedChoices: [...],   // used when an item has no choices of its own
     shuffleItems: true
   })
*/
(function(){
  "use strict";

  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }

  window.makeQuiz = function(root, opts){
    var items = opts.shuffleItems === false ? opts.items.slice() : shuffle(opts.items);
    var idx = 0, score = 0, locked = false;

    root.classList.add("quiz");
    root.innerHTML =
      "<div class='q-progress'></div>" +
      "<div class='q-prompt'></div>" +
      "<div class='q-choices'></div>" +
      "<div class='q-feedback' aria-live='polite'></div>" +
      "<button class='btn ghost q-next' style='display:none;'>ข้อถัดไป</button>";

    var elProg = root.querySelector(".q-progress");
    var elPrompt = root.querySelector(".q-prompt");
    var elChoices = root.querySelector(".q-choices");
    var elFb = root.querySelector(".q-feedback");
    var elNext = root.querySelector(".q-next");

    function renderItem(){
      locked = false;
      var it = items[idx];
      elProg.textContent = "ข้อ " + (idx+1) + " / " + items.length + " · คะแนน " + score;
      elPrompt.textContent = it.prompt;
      elFb.innerHTML = "";
      elNext.style.display = "none";
      var choices = it.choices ? shuffle(it.choices) : (opts.fixedChoices || []);
      elChoices.innerHTML = "";
      choices.forEach(function(c){
        var b = document.createElement("button");
        b.className = "choice";
        b.textContent = c;
        b.addEventListener("click", function(){ pick(b, c, it); });
        elChoices.appendChild(b);
      });
    }

    function pick(btn, c, it){
      if(locked) return;
      locked = true;
      var ok = (c === it.answer);
      if(ok){
        score++;
        btn.classList.add("correct");
        elFb.innerHTML = "<b>ถูกต้อง!</b> " + (it.explain || "");
      } else {
        btn.classList.add("wrong");
        elFb.innerHTML = "<b class='no'>ยังไม่ใช่</b> คำตอบคือ “" + it.answer + "” " + (it.explain || "");
      }
      elChoices.querySelectorAll(".choice").forEach(function(b){
        b.disabled = true;
        if(b.textContent === it.answer) b.classList.add("correct");
      });
      elProg.textContent = "ข้อ " + (idx+1) + " / " + items.length + " · คะแนน " + score;
      elNext.style.display = "inline-block";
      elNext.textContent = (idx === items.length-1) ? "ดูผลคะแนน" : "ข้อถัดไป";
    }

    elNext.addEventListener("click", function(){
      idx++;
      if(idx < items.length){ renderItem(); }
      else { renderFinal(); }
    });

    function renderFinal(){
      var msg;
      var pct = score/items.length;
      if(pct === 1) msg = "ยอดเยี่ยมมาก ได้คะแนนเต็ม!";
      else if(pct >= 0.7) msg = "เก่งมาก เกือบเต็มแล้ว!";
      else if(pct >= 0.5) msg = "ดีแล้ว ลองทบทวนอีกนิดนะ";
      else msg = "ไม่เป็นไร ลองอ่านเนื้อหาแล้วเล่นใหม่อีกครั้ง";
      elProg.textContent = "จบแบบฝึกหัด";
      elPrompt.innerHTML = "<span class='q-final'>ได้ " + score + " จาก " + items.length + " คะแนน — " + msg + "</span>";
      elChoices.innerHTML = "";
      elFb.innerHTML = "";
      elNext.style.display = "none";
      var again = document.createElement("button");
      again.className = "btn";
      again.textContent = "เริ่มใหม่";
      again.addEventListener("click", function(){
        items = opts.shuffleItems === false ? opts.items.slice() : shuffle(opts.items);
        idx = 0; score = 0;
        root.appendChild(elNext);
        renderItem();
      });
      elChoices.appendChild(again);
    }

    renderItem();
  };
})();
