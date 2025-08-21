// === Single best-match amino acid quiz ===
// Strategy: 10 questions -> property votes -> score each of 20 AAs by property overlap.
// Rarer properties get higher weights. Ties broken by stronger match on rare tags, then alphabetically.

// ---------------------- Question Set ----------------------
const QUESTIONS = [
  {
    q: "In a team, what do you naturally optimize for?",
    opts: [
      { t: "charge+", label: "Momentum & activation (catalyze decisions)" },
      { t: "polar",   label: "Communication & connectivity (H-bonding vibe)" },
      { t: "hydroph", label: "Stability & structure (quiet core strength)" },
      { t: "special", label: "Turning points & flexibility (quirky roles)" }
    ]
  },
  {
    q: "Pick your operating environment:",
    opts: [
      { t: "surface", label: "High-exposure interface (solvent-facing)" },
      { t: "core",    label: "Buried core (low noise, high focus)" },
      { t: "membrane",label: "Interfaces/edges (amphipathic balance)" },
      { t: "loop",    label: "Loops/turns (dynamic, adaptable)" }
    ]
  },
  {
    q: "Choose a vibe:",
    opts: [
      { t: "aromatic", label: "Deep, resonant, creative (aromatic ring energy)" },
      { t: "small",    label: "Minimalist, agile (fits anywhere)" },
      { t: "bulky",    label: "Commanding presence (big side chain)" },
      { t: "rigid",    label: "Architectural—kinks/turns/constraints" }
    ]
  },
  {
    q: "Conflict style?",
    opts: [
      { t: "basic", label: "Positively charged persuasion" },
      { t: "acid",  label: "Sharpened critique (acidic clarity)" },
      { t: "neutral",label: "Even-keeled mediation (uncharged polar)" },
      { t: "hydroph",label: "Quiet endurance (nonpolar)" }
    ]
  },
  {
    q: "Special power?",
    opts: [
      { t: "sulfur",   label: "Disulfides/methyl transfers (sulfur craft)" },
      { t: "aromatic", label: "π-stacking/fluorescent charisma" },
      { t: "glycine",  label: "Micro-hinges & tight turns" },
      { t: "proline",  label: "Helix breaker / structural elbow" }
    ]
  },
  {
    q: "Pick your scale:",
    opts: [
      { t: "tiny",  label: "Feather-light" },
      { t: "small", label: "Compact" },
      { t: "medium",label: "Balanced" },
      { t: "large", label: "Substantial" }
    ]
  },
  {
    q: "Preferred interaction type:",
    opts: [
      { t: "hbond",   label: "Hydrogen bonds" },
      { t: "salt",    label: "Salt bridges" },
      { t: "pi",      label: "π interactions" },
      { t: "vdw",     label: "Van der Waals pack" }
    ]
  },
  {
    q: "How experimental are you?",
    opts: [
      { t: "special", label: "Rule-bending innovator" },
      { t: "polar",   label: "Adaptive collaborator" },
      { t: "hydroph", label: "Reliable traditionalist" },
      { t: "aromatic",label: "Expressive visionary" }
    ]
  },
  {
    q: "Pick a metaphor:",
    opts: [
      { t: "starter", label: "Start codon energy (kickoff magnet)" },
      { t: "sensor",  label: "Chemical switch (pKa-sensitive)" },
      { t: "bridge",  label: "Cross-linker (disulfide bridges)" },
      { t: "anchor",  label: "Hydrophobic anchor" }
    ]
  },
  {
    q: "Where do you shine?",
    opts: [
      { t: "enzyme",  label: "Catalytic/active-site adjacent" },
      { t: "binding", label: "Binding interfaces & recognition" },
      { t: "scaffold",label: "Folding core/scaffolding" },
      { t: "motif",   label: "Turns/loops/motifs" }
    ]
  }
];

// ---------------------- Amino Acid Property Map ----------------------
// Tags roughly summarize biochemical tendencies (not exhaustive; tuned for fun + separation).
// Each AA has: code, name, tags array, and a one-liner.
const AAS = [
  {code:"A", name:"Alanine", tags:["hydroph","small","tiny","core","vdw","neutral","scaffold"], why:"Lean, stable, unflashy core builder."},
  {code:"R", name:"Arginine", tags:["charge+","basic","polar","surface","salt","sensor","medium"], why:"Talkative, surface-active, strong salt-bridger."},
  {code:"N", name:"Asparagine", tags:["polar","neutral","surface","hbond","binding","small"], why:"Diplomatic H-bonder at interfaces."},
  {code:"D", name:"Aspartate", tags:["charge-","acid","polar","surface","enzyme","salt","small"], why:"Acidic clarity; catalytic-adjacent."},
  {code:"C", name:"Cysteine", tags:["polar","neutral","sulfur","bridge","special","binding","small"], why:"Covalent cross-linker; redox-savvy."},
  {code:"E", name:"Glutamate", tags:["charge-","acid","polar","surface","salt","enzyme","medium"], why:"Extended acidic reach; dynamic at surfaces."},
  {code:"Q", name:"Glutamine", tags:["polar","neutral","surface","hbond","binding","medium"], why:"Adaptable H-bond networker."},
  {code:"G", name:"Glycine", tags:["special","tiny","glycine","loop","motif","neutral","sensor"], why:"Unconstrained hinges and tight turns."},
  {code:"H", name:"Histidine", tags:["polar","basic","sensor","aromatic","pi","enzyme","surface","medium"], why:"pKa-tuned switch; catalytic favorite."},
  {code:"I", name:"Isoleucine", tags:["hydroph","core","anchor","vdw","bulky","large","scaffold"], why:"Hydrophobic anchor in the core."},
  {code:"L", name:"Leucine", tags:["hydroph","core","anchor","vdw","bulky","large","scaffold"], why:"Versatile core stabilizer."},
  {code:"K", name:"Lysine", tags:["charge+","basic","polar","surface","salt","binding","medium"], why:"Positive connector; modification hotspot."},
  {code:"M", name:"Methionine", tags:["hydroph","sulfur","starter","anchor","vdw","medium"], why:"Start codon rep; soft sulfur flexibility."},
  {code:"F", name:"Phenylalanine", tags:["hydroph","aromatic","pi","core","bulky","large","vdw"], why:"Aromatic heft; packs and stacks."},
  {code:"P", name:"Proline", tags:["special","rigid","proline","motif","loop","scaffold","neutral"], why:"Helix breaker; structural elbow."},
  {code:"S", name:"Serine", tags:["polar","neutral","surface","hbond","binding","small","sensor"], why:"Small polar switch; easy to tune."},
  {code:"T", name:"Threonine", tags:["polar","neutral","surface","hbond","binding","small","rigid"], why:"Polar with a hint of steric control."},
  {code:"W", name:"Tryptophan", tags:["hydroph","aromatic","pi","core","bulky","large","binding"], why:"Rare, expressive, fluorescent charisma."},
  {code:"Y", name:"Tyrosine", tags:["aromatic","polar","pi","surface","binding","sensor","medium"], why:"Aromatic with polar nuance; signaling-ready."},
  {code:"V", name:"Valine", tags:["hydroph","core","vdw","bulky","medium","scaffold"], why:"Compact strength; packs densely."}
];

// Rarity prior: rarer tags score higher when matched
const TAG_WEIGHTS = {
  "charge+": 2.0, "charge-": 2.0, "basic": 1.6, "acid": 1.6,
  "polar": 1.1, "hydroph": 1.1, "neutral": 1.0,
  "surface": 1.0, "core": 1.0, "membrane": 1.3, "loop": 1.1,
  "aromatic": 1.7, "sulfur": 1.8, "special": 1.6,
  "glycine": 2.0, "proline": 2.0,
  "tiny": 1.5, "small": 1.1, "medium": 1.0, "large": 1.2, "bulky": 1.2, "rigid": 1.4,
  "hbond": 1.0, "salt": 1.2, "pi": 1.2, "vdw": 1.0,
  "starter": 1.5, "sensor": 1.5, "bridge": 1.6, "anchor": 1.0,
  "enzyme": 1.2, "binding": 1.1, "scaffold": 1.0, "motif": 1.1
};

// ---------------------- Render Quiz ----------------------
const form = document.getElementById("quizForm");
const progressEl = document.getElementById("progress");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const resultEl = document.getElementById("result");
const resultCard = document.getElementById("resultCard");
const aaBadge = document.getElementById("aaBadge");
const aaTitle = document.getElementById("aaTitle");
const aaMeta = document.getElementById("aaMeta");
const aaWhy = document.getElementById("aaWhy");
const aaTags = document.getElementById("aaTags");
const confettiRoot = document.getElementById("confetti");

function renderQuestions(){
  form.innerHTML = "";
  QUESTIONS.forEach((q, idx) => {
    const fs = document.createElement("fieldset");
    const lg = document.createElement("legend");
    lg.textContent = `${idx+1}) ${q.q}`;
    fs.appendChild(lg);
    q.opts.forEach((o, i) => {
      const lab = document.createElement("label");
      const inp = document.createElement("input");
      inp.type = "radio"; inp.name = `q${idx+1}`; inp.value = o.t; inp.id = `q${idx+1}_${i}`;
      const text = document.createTextNode(" " + o.label);
      lab.appendChild(inp); lab.appendChild(text);
      fs.appendChild(lab);
    });
    form.appendChild(fs);
  });
}
renderQuestions();

// ---------------------- Progress & Tally ----------------------
function answeredCount(){
  let n = 0;
  for(let i=1;i<=QUESTIONS.length;i++){
    if (form.querySelector(`input[name="q${i}"]:checked`)) n++;
  }
  return n;
}
function updateProgress(){
  const n = answeredCount();
  progressEl.innerHTML = n === QUESTIONS.length
    ? `<span class="ok">All set — ready to reveal!</span>`
    : `<span>${n} / ${QUESTIONS.length} answered</span>`;
  submitBtn.disabled = n !== QUESTIONS.length;
}
form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);
updateProgress();

// ---------------------- Scoring ----------------------
function getVotes(){
  const votes = {};
  for(let i=1;i<=QUESTIONS.length;i++){
    const picked = form.querySelector(`input[name="q${i}"]:checked`);
    if (picked) votes[picked.value] = (votes[picked.value]||0) + 1;
  }
  return votes; // map tag -> count
}
function scoreAA(aa, votes){
  let s = 0;
  let rareBonus = 0;
  aa.tags.forEach(tag=>{
    const v = votes[tag]||0;
    const w = TAG_WEIGHTS[tag]||1.0;
    s += v * w;
    if (v>0 && w>=1.6) rareBonus += 0.15*v; // small edge for rare matches
  });
  return s + rareBonus;
}
function pickBestAA(votes){
  let best = null, bestScore = -1;
  AAS.forEach(aa=>{
    const sc = scoreAA(aa, votes);
    if (sc > bestScore || (sc === bestScore && aa.name < best.name)){
      best = aa; bestScore = sc;
    }
  });
  return {best, score: bestScore};
}

// ---------------------- Confetti & Reveal ----------------------
function burstConfetti(){
  confettiRoot.innerHTML = "";
  confettiRoot.classList.remove("hidden");
  const COLORS = ["#7aa2ff","#77ffc0","#ffd166","#ff6b6b","#c792ea"];
  const N = 80;
  for(let i=0;i<N;i++){
    const p = document.createElement("div");
    p.className = "p";
    const x = Math.random()*100;  // vw
    const x2 = (x + (Math.random()*30-15));
    const dur = (8 + Math.random()*6).toFixed(2) + "s";
    const spd = (1 + Math.random()*1.5).toFixed(2) + "s";
    p.style.setProperty("--x", x+"vw");
    p.style.setProperty("--x2", x2+"vw");
    p.style.setProperty("--dur", dur);
    p.style.setProperty("--spd", spd);
    p.style.left = x+"vw";
    p.style.top = (-10 - Math.random()*20) + "vh";
    p.style.background = COLORS[Math.floor(Math.random()*COLORS.length)];
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiRoot.appendChild(p);
  }
  // remove after 6s
  setTimeout(()=> confettiRoot.classList.add("hidden"), 6000);
}

function renderResult(aa, votes){
  aaBadge.textContent = aa.code;
  aaTitle.textContent = `You are: ${aa.name}`;
  aaMeta.textContent = prettyMeta(aa);
  aaWhy.textContent = aa.why;

  // Show top-matched tags
  const weighted = Object.entries(votes)
    .map(([t,c]) => ({t, sc:c*(TAG_WEIGHTS[t]||1)}))
    .sort((a,b)=>b.sc-a.sc)
    .slice(0,6);
  aaTags.innerHTML = weighted.map(x=>`<span class="pill">${x.t} × ${Math.round(x.sc)}</span>`).join(" ");

  resultEl.style.display = "block";
  resultCard.classList.remove("pulse");
  // trigger CSS pulse
  void resultCard.offsetWidth; // reflow
  resultCard.classList.add("pulse");
  burstConfetti();
}

function prettyMeta(aa){
  // compress a few iconic tags for display
  const icon = [];
  if (aa.tags.includes("aromatic")) icon.push("aromatic");
  if (aa.tags.includes("sulfur")) icon.push("sulfur");
  if (aa.tags.includes("charge+")) icon.push("basic (+)");
  if (aa.tags.includes("charge-")) icon.push("acidic (–)");
  if (aa.tags.includes("hydroph")) icon.push("hydrophobic");
  if (aa.tags.includes("polar")) icon.push("polar");
  if (aa.tags.includes("special")) icon.push("special");
  if (aa.tags.includes("tiny")) icon.push("tiny");
  if (aa.tags.includes("bulky") || aa.tags.includes("large")) icon.push("bulky");
  return icon.join(" · ");
}

// ---------------------- Wire buttons ----------------------
submitBtn.addEventListener("click", ()=>{
  const votes = getVotes();
  const {best} = pickBestAA(votes);
  renderResult(best, votes);
  window.scrollTo({top: resultEl.offsetTop - 12, behavior:"smooth"});
});

resetBtn.addEventListener("click", ()=>{
  setTimeout(()=>{
    resultEl.style.display = "none";
    aaBadge.textContent = "AA"; aaTitle.textContent = "You are: …";
    aaMeta.textContent = "…"; aaWhy.textContent = "…"; aaTags.innerHTML = "";
    confettiRoot.classList.add("hidden");
    updateProgress();
    window.scrollTo({top:0, behavior:"smooth"});
  }, 0);
});

