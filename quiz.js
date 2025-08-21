
// quiz.js — logic in an external file so it runs reliably in Colab's proxied tab
(function () {
  const form = document.getElementById('quizForm');
  const submitBtn = document.getElementById('submitBtn');
  const resultEl = document.getElementById('result');
  const bannerEl = document.getElementById('resultBanner');
  const detailsEl = document.getElementById('resultDetails');
  const noteEl = document.getElementById('resultNote');
  const progressEl = document.getElementById('progress');

  const categoryBlurb = {
    A: { title: "Charged Amino Acids",
         examples: "Lysine (Lys), Arginine (Arg), Aspartate (Asp), Glutamate (Glu)",
         vibe: "Bold connectors; often at protein surfaces making salt bridges and ionic interactions.",
         match: "You bring spark and structure — a catalyst for action." },
    B: { title: "Polar (Uncharged) Amino Acids",
         examples: "Serine (Ser), Threonine (Thr), Asparagine (Asn), Glutamine (Gln), Tyrosine (Tyr)",
         vibe: "Empathetic stabilizers. You form hydrogen bonds, enabling communication and flexibility.",
         match: "You’re the social glue that keeps teams coherent." },
    C: { title: "Hydrophobic Amino Acids",
         examples: "Valine (Val), Leucine (Leu), Isoleucine (Ile), Phenylalanine (Phe), Methionine (Met), Tryptophan (Trp)",
         vibe: "Stable and reliable. You create the core that everything depends on.",
         match: "Quiet power — dependable, grounded, and essential." },
    D: { title: "Special-Case Amino Acids",
         examples: "Proline (Pro), Glycine (Gly), Cysteine (Cys)",
         vibe: "Rule-benders that make structural magic (turns, hinges, disulfide bonds, flexibility).",
         match: "Creative shapeshifter — you enable big moves." }
  };

  function updateProgress() {
    let answered = 0;
    for (let i = 1; i <= 10; i++) {
      const picked = document.querySelector(`input[name="q${i}"]:checked`);
      if (picked) answered++;
    }
    if (progressEl) {
      progressEl.innerHTML = answered === 10
        ? '<span class="ok">All set — ready to submit!</span>'
        : `<span class="muted">${answered} / 10 answered</span>`;
    }
    if (submitBtn) submitBtn.disabled = answered !== 10;
  }

  function getScores() {
    const scores = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 1; i <= 10; i++) {
      const picked = document.querySelector(`input[name="q${i}"]:checked`);
      if (!picked) return null;
      scores[picked.value]++;
    }
    return scores;
  }

  function pickCategory(scores) {
    const order = ['D','B','A','C']; // tie-breaker preference
    let best = null, bestVal = -1;
    for (const k of Object.keys(scores)) {
      const v = scores[k];
      if (v > bestVal) { best = k; bestVal = v; }
      else if (v === bestVal) {
        if (order.indexOf(k) < order.indexOf(best)) best = k;
      }
    }
    return best;
  }

  function renderResult(category, scores) {
    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const pct = k => Math.round(100 * (scores[k] / total));
    const info = categoryBlurb[category];

    bannerEl.innerHTML = `<h2>You are: ${info.title}</h2>
      <div class="muted">Examples: ${info.examples}</div>`;

    detailsEl.innerHTML = `
      <p><strong>Why:</strong> ${info.vibe}</p>
      <p><strong>Personality match:</strong> ${info.match}</p>
      <p><strong>Your breakdown:</strong>
        <span class="pill">A (Charged): ${pct('A')}%</span>
        <span class="pill">B (Polar): ${pct('B')}%</span>
        <span class="pill">C (Hydrophobic): ${pct('C')}%</span>
        <span class="pill">D (Special): ${pct('D')}%</span>
      </p>`;

    noteEl.textContent = "Tip: Try retaking the quiz with your 'work self' vs 'weekend self' to see if your amino acid shifts.";
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Wire up events (use both 'input' and 'change' for reliability)
  document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    const form = document.getElementById('quizForm');
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    document.getElementById('resetBtn').addEventListener('click', () => {
      setTimeout(() => {
        updateProgress();
        const r = document.getElementById('result');
        r.style.display = 'none';
        document.getElementById('resultBanner').innerHTML = '';
        document.getElementById('resultDetails').innerHTML = '';
        document.getElementById('resultNote').textContent = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    });
    document.getElementById('submitBtn').addEventListener('click', () => {
      const scores = getScores();
      if (!scores) return;
      const category = pickCategory(scores);
      renderResult(category, scores);
    });
  });
})();
