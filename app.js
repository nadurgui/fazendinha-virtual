
/**
 * Fazendinha Virtual (protótipo HTML)
 * - 2 telas com swipe (vaso <-> rancho)
 * - Plantio com 3 estágios, precisa regar para avançar
 * - Animais (até 3) geram moedas com o tempo
 * - Relógio real e progresso offline via localStorage + timestamps
 */

const STORAGE_KEY = "fazendinha_virtual_save_v2";
const STORAGE_KEY_OLD = "fazendinha_virtual_save_v1";

const GROWTH = {
  // crescimento por estágio = (tempo total da semente) / 2
  // (2 regas: para ir ao estágio 2 e 3)
  minTotalMs: 10 * 60_000
};

// 20 sementes iniciais (preço, tempo total, valor de venda)
const SEEDS = [
  { id:"alface", name:"Alface", emoji:"🥬", group:"Hortaliças", buy:10, growMin:10, sell:22 },
  { id:"rucula", name:"Rúcula", emoji:"🥗", group:"Hortaliças", buy:11, growMin:11, sell:24 },
  { id:"agriao", name:"Agrião", emoji:"🌿", group:"Hortaliças", buy:11, growMin:12, sell:25 },
  { id:"espinafre", name:"Espinafre", emoji:"🥬", group:"Hortaliças", buy:12, growMin:12, sell:27 },
  { id:"couve", name:"Couve", emoji:"🥬", group:"Hortaliças", buy:12, growMin:13, sell:28 },
  { id:"repolho", name:"Repolho", emoji:"🥬", group:"Hortaliças", buy:14, growMin:14, sell:32 },
  { id:"cenoura", name:"Cenoura", emoji:"🥕", group:"Hortaliças", buy:12, growMin:12, sell:26 },
  { id:"beterraba", name:"Beterraba", emoji:"🫜", group:"Hortaliças", buy:14, growMin:14, sell:32 },
  { id:"rabanete", name:"Rabanete", emoji:"🌶️", group:"Hortaliças", buy:12, growMin:12, sell:27 },
  { id:"cebola", name:"Cebola", emoji:"🧅", group:"Hortaliças", buy:15, growMin:14, sell:34 },
  { id:"alho", name:"Alho", emoji:"🧄", group:"Hortaliças", buy:16, growMin:15, sell:36 },
  { id:"batata", name:"Batata", emoji:"🥔", group:"Hortaliças", buy:14, growMin:13, sell:32 },
  { id:"batata_doce", name:"Batata-doce", emoji:"🍠", group:"Hortaliças", buy:16, growMin:16, sell:40 },
  { id:"abobrinha", name:"Abobrinha", emoji:"🥒", group:"Hortaliças", buy:16, growMin:16, sell:40 },
  { id:"pepino", name:"Pepino", emoji:"🥒", group:"Hortaliças", buy:15, growMin:15, sell:36 },
  { id:"tomate", name:"Tomate", emoji:"🍅", group:"Hortaliças", buy:16, growMin:14, sell:36 },
  { id:"milho", name:"Milho", emoji:"🌽", group:"Grãos", buy:18, growMin:15, sell:40 },
  { id:"trigo", name:"Trigo", emoji:"🌾", group:"Grãos", buy:18, growMin:16, sell:42 },
  { id:"arroz", name:"Arroz", emoji:"🍚", group:"Grãos", buy:20, growMin:18, sell:48 },
  { id:"soja", name:"Soja", emoji:"🫘", group:"Grãos", buy:22, growMin:20, sell:54 },
  { id:"feijao", name:"Feijão", emoji:"🫘", group:"Grãos", buy:20, growMin:18, sell:48 },
  { id:"lentilha", name:"Lentilha", emoji:"🫘", group:"Grãos", buy:22, growMin:20, sell:54 },
  { id:"ervilha", name:"Ervilha", emoji:"🟢", group:"Grãos", buy:18, growMin:16, sell:44 },
  { id:"grao_de_bico", name:"Grão-de-bico", emoji:"🫘", group:"Grãos", buy:24, growMin:22, sell:60 },
  { id:"morango", name:"Morango", emoji:"🍓", group:"Frutas", buy:22, growMin:18, sell:52 },
  { id:"uva", name:"Uva", emoji:"🍇", group:"Frutas", buy:26, growMin:22, sell:64 },
  { id:"melancia", name:"Melancia", emoji:"🍉", group:"Frutas", buy:35, growMin:35, sell:95 },
  { id:"melao", name:"Melão", emoji:"🍈", group:"Frutas", buy:32, growMin:32, sell:88 },
  { id:"abacaxi", name:"Abacaxi", emoji:"🍍", group:"Frutas", buy:30, growMin:30, sell:82 },
  { id:"banana", name:"Banana", emoji:"🍌", group:"Frutas", buy:30, growMin:30, sell:82 },
  { id:"mamao", name:"Mamão", emoji:"🧡", group:"Frutas", buy:28, growMin:28, sell:76 },
  { id:"maracuja", name:"Maracujá", emoji:"💛", group:"Frutas", buy:30, growMin:30, sell:84 },
  { id:"kiwi", name:"Kiwi", emoji:"🥝", group:"Frutas", buy:28, growMin:26, sell:74 },
  { id:"amora", name:"Amora", emoji:"🫐", group:"Frutas", buy:28, growMin:26, sell:74 },
  { id:"maca", name:"Maçã", emoji:"🍎", group:"Árvores", buy:24, growMin:20, sell:58 },
  { id:"pera", name:"Pera", emoji:"🍐", group:"Árvores", buy:24, growMin:20, sell:58 },
  { id:"laranja", name:"Laranja", emoji:"🍊", group:"Árvores", buy:25, growMin:24, sell:62 },
  { id:"limao", name:"Limão", emoji:"🍋", group:"Árvores", buy:25, growMin:24, sell:62 },
  { id:"tangerina", name:"Tangerina", emoji:"🍊", group:"Árvores", buy:26, growMin:26, sell:66 },
  { id:"manga", name:"Manga", emoji:"🥭", group:"Árvores", buy:30, growMin:30, sell:82 },
  { id:"goiaba", name:"Goiaba", emoji:"🍈", group:"Árvores", buy:28, growMin:28, sell:76 },
  { id:"abacate", name:"Abacate", emoji:"🥑", group:"Árvores", buy:34, growMin:34, sell:96 },
  { id:"pessego", name:"Pêssego", emoji:"🍑", group:"Árvores", buy:30, growMin:30, sell:84 },
  { id:"cereja", name:"Cereja", emoji:"🍒", group:"Árvores", buy:32, growMin:32, sell:90 },
  { id:"cafe", name:"Café", emoji:"☕", group:"Especiais", buy:40, growMin:45, sell:120 },
  { id:"cacau", name:"Cacau", emoji:"🍫", group:"Especiais", buy:42, growMin:48, sell:130 },
  { id:"cana", name:"Cana-de-açúcar", emoji:"🍬", group:"Especiais", buy:32, growMin:32, sell:90 },
  { id:"algodao", name:"Algodão", emoji:"🧶", group:"Especiais", buy:38, growMin:40, sell:110 },
  { id:"cha", name:"Chá", emoji:"🍵", group:"Especiais", buy:36, growMin:38, sell:104 },
  { id:"baunilha", name:"Baunilha", emoji:"🌼", group:"Especiais", buy:50, growMin:60, sell:170 },
];

const ANIMALS = {
  vaca:   { id:"vaca", name:"Vaca", emoji:"🐄", cost:120, payout:18, payoutEveryMs:60_000 },
  porco:  { id:"porco", name:"Porco", emoji:"🐖", cost: 90, payout:12, payoutEveryMs:60_000 },
  cavalo: { id:"cavalo", name:"Cavalo", emoji:"🐎", cost:150, payout:22, payoutEveryMs:60_000 }
};

const FISHES = {
  tilapia: { id:"tilapia", name:"Tilápia", emoji:"🐟", cost:60, payout:8, payoutEveryMs:60_000 },
  dourado: { id:"dourado", name:"Dourado", emoji:"🐠", cost:90, payout:12, payoutEveryMs:60_000 },
  carpa:   { id:"carpa", name:"Carpa", emoji:"🐡", cost:120, payout:16, payoutEveryMs:60_000 }
};

const PLANT_GROW_TIME = {
  "cana": 2 * 60 * 1000,   // 2 minutos (teste)  // aqui está o teste do tempo contando
  "milho": 3 * 60 * 1000,
  "cenoura": 90 * 1000
};


function getSeed(seedId){
  return SEEDS.find(s=>s.id===seedId) || null;
}
function getStageMs(seedId){
  const s = getSeed(seedId);
  const total = Math.max(GROWTH.minTotalMs, (s ? s.growMin : 10) * 60_000);
  return Math.floor(total / 2);
}

function getPlantSpritePath(seedId, stage){
  const st = Math.max(1, Math.min(3, stage));
  // Prefer PNG por semente; fallback para SVG genérico
  return `assets/plants/${seedId}_${st}.png`;
}


function getPlantVisualTuning(seedId){
  const s = getSeed(seedId);
  const group = s?.group || "Hortaliças";

  // valores padrão (multiplicadores por estágio)
  // baseScale é aplicado em todos os estágios; stageScale multiplica o scale do estágio (1/2/3)
  // topShift ajusta a âncora vertical (em %), positivo = mais pra baixo
  const base = {
    baseScale: 1.0,
    stageScale: [1.0, 1.0, 1.0],
    topShift: [0.0, 0.0, 0.0]
  };

  // Hortaliças: menores e mais baixas
  if(group === "Hortaliças"){
    return { baseScale: 0.92, stageScale:[0.95, 0.98, 1.00], topShift:[+0.6, +0.4, +0.2] };
  }
  // Grãos: mais altos (milho/trigo etc.)
  if(group === "Grãos"){
    return { baseScale: 1.05, stageScale:[1.00, 1.06, 1.12], topShift:[-0.3, -0.7, -1.1] };
  }
  // Frutas (pequenas): médio
  if(group === "Frutas"){
    return { baseScale: 1.00, stageScale:[0.98, 1.02, 1.06], topShift:[0.0, -0.2, -0.4] };
  }
  // Árvores: bem maiores e mais pra cima
  if(group === "Árvores"){
    return { baseScale: 1.18, stageScale:[1.02, 1.10, 1.20], topShift:[-0.8, -1.3, -2.0] };
  }
  // Especiais: levemente grandes (café/cacau/baunilha)
  if(group === "Especiais"){
    return { baseScale: 1.10, stageScale:[1.00, 1.08, 1.16], topShift:[-0.3, -0.8, -1.4] };
  }
  return base;
}

function updatePlantInfoBalloon(){
  const el = document.getElementById("plantInfoBalloon");
  if(!el) return;

  const idx = (typeof state.selectedBed === "number" ? state.selectedBed : 0);
  const plant = getPlantAt(idx);

  if(!plant){
    el.classList.add("hidden");
    return;
  }

  const pos = BED_POS[idx] || {left:50, top:50};
  // Balao compacto acima do slot selecionado.
  // Pequeno deslocamento lateral nos slots do meio para reduzir sobreposicao.
  const xNudge = (idx === 1 ? -3.0 : (idx === 2 ? 3.0 : 0));
  el.style.left = (pos.left + xNudge) + '%';
  // Move o balao para cima e ancora pelo topo para evitar sobreposicao
  el.style.top = 'calc(' + (pos.top - 5.0) + '% + var(--safe-top))';
  el.style.transform = 'translate(-50%,-100%)';

  el.classList.remove("hidden");
  document.getElementById("plantInfoName").textContent = plant.seedName || "Planta";
  document.getElementById("plantInfoStage").textContent = `Estágio ${plant.stage || 1}`;

  const watered = !plant.needsWater;
  document.getElementById("plantInfoWater").textContent = watered ? "Regado" : "Não regado";
  el.classList.toggle("watered", watered);

  const timerEl = document.getElementById("plantInfoTimer");
  if(!timerEl) return;

  if(!watered || !plant.growStartAt){
    timerEl.textContent = "";
    el.classList.remove("ready");
    return;
  }

  const total = getStageMs(plant.seedId);
  const elapsed = Date.now() - plant.growStartAt;
  const remaining = total - elapsed;

  if(remaining <= 0){
    timerEl.textContent = (plant.stage >= 3) ? "Pronto para colher!" : "Pronto para evoluir!";
    el.classList.add("ready");
  }else{
    const sec = Math.ceil(remaining / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    timerEl.textContent = `Pronto em: ${min}:${String(s).padStart(2,"0")}`;
    el.classList.remove("ready");
  }
}


const $ = (sel) => document.querySelector(sel);

let state = loadState();
ensureInitialMoney();
updateHUD();


function migrateSave(){
  // Migração sem perder progresso:
  // - Saves antigos podem ter money 0 ou string por bugs antigos.
  // - Se NÃO existe moneyInitialized, damos 100 UMA vez se money estiver inválido/<=0.
  const hadFlag = (state.moneyInitialized === true);

  if(typeof state.money === "string"){
    const n = Number(state.money);
    state.money = Number.isFinite(n) ? n : 0;
  }

  if(!hadFlag){
    if(typeof state.money !== "number" || isNaN(state.money) || state.money <= 0){
      state.money = 100;
    }
    state.moneyInitialized = true;
  }

  if(state.saveVersion === undefined || state.saveVersion === null || state.saveVersion < 2){
    state.saveVersion = 2;
  }

  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.error("Save error:", e);
  }
}
migrateSave();

function defaultState(){
  const now = Date.now();
  return {
    saveVersion: 2,
    money: 100, // moedas iniciais
    moneyInitialized: true, // marca que já recebeu o bônus inicial
    seedInventory: {}, // {seedId: quantidade}
    seedUI: { shopCollapsed: {}, invCollapsed: {}, search: "", group: "Hortaliças" },
    screenIndex: 0, // sempre inicia no vaso
    selectedSeed: null,
    beds: [null, null, null, null], // 4 espaços do canteiro: cada item é { seedId, seedName, stage:1..3, growStartAt, needsWater }
    selectedBed: 0,
    animals: [], // each { typeId, boughtAtMs, lastPaidMs, fedUntilMs }
    selectedAnimalIndex: 0,
    fishes: [], // each { typeId, boughtAtMs, lastPaidMs, fedUntilMs }
    selectedFishIndex: 0,
    lastSeenMs: now
  };
}

function loadState(){
  try{
    let raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      // tenta migrar save antigo
      raw = localStorage.getItem(STORAGE_KEY_OLD);
    }
    if(!raw) return defaultState();
    const data = JSON.parse(raw);

    // mescla com defaults para compatibilidade
    const merged = { ...defaultState(), ...data };

    // Migração: do modelo antigo (plant único) para canteiro 4x
    if(!Array.isArray(merged.beds)){
      merged.beds = [null, null, null, null];
    }
    if(typeof merged.selectedBed !== "number" || isNaN(merged.selectedBed)){
      merged.selectedBed = 0;
    }
    merged.selectedBed = Math.max(0, Math.min(3, Math.floor(merged.selectedBed)));

    // Se vier de save antigo com `plant`, joga no slot 0 (sem perder progresso)
    if(merged.plant && !merged.beds[0]){
      merged.beds[0] = merged.plant;
    }
    // mantém compatibilidade mas não usamos mais
    merged.plant = null;


    // Garantia: se o save vier com money 0/negativo (bug comum), começamos com 100.
    // (Se você realmente ficou sem moedas jogando, você pode zerar de novo gastando; mas não começa travado em 0.)
    if(typeof merged.money === "string"){
      const n = Number(merged.money);
      merged.money = Number.isFinite(n) ? n : 0;
    }
    if(typeof merged.money !== "number" || isNaN(merged.money) || merged.money <= 0){
      merged.money = 100;
    }


    // migração de bug antigo: saves sem flag e com money inválido/<=0 ganham 100 uma vez
    if(merged.moneyInitialized !== true){
      if(typeof merged.money === "string"){
        const n = Number(merged.money);
        merged.money = Number.isFinite(n) ? n : 0;
      }
      if(typeof merged.money !== "number" || isNaN(merged.money) || merged.money <= 0){
        merged.money = 100;
      }
      merged.moneyInitialized = true;
    }

    if(merged.saveVersion === undefined || merged.saveVersion === null || merged.saveVersion < 2){
      merged.saveVersion = 2;
    }
    // Migra formato antigo da planta (plantedAt/lastWaterAt) para o formato atual
    // Agora no canteiro: migramos para o slot 0, se existir.
    const p0 = merged.beds?.[0];
    if(p0){
      if(p0.growStartAt === undefined || p0.growStartAt === null){
        p0.growStartAt = p0.lastWaterAt || p0.plantedAt || Date.now();
      }
      if(p0.needsWater === undefined || p0.needsWater === null){
        if(p0.stage >= 3){
          p0.needsWater = false;
        }else if(p0.lastWaterAt && p0.lastWaterAt > 0){
          p0.needsWater = false;
        }else{
          p0.needsWater = true;
        }
      }
      p0.stage = Math.max(1, Math.min(3, Number(p0.stage) || 1));
    }

    return merged;
  }catch(e){
    console.error("Load error:", e);
    return defaultState();
  }
}

function saveState(){
  state.lastSeenMs = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> t.classList.add("hidden"), 2200);
}

/** Offline catch-up: aplica tempo passado desde lastSeenMs */
function applyOfflineProgress(){
  const now = Date.now();
  const dt = Math.max(0, now - (state.lastSeenMs || now));

  // Plant growth catch-up (para cada slot, apenas se já foi regada para o estágio atual)
  if(Array.isArray(state.beds)){
    for(const plant of state.beds){
      if(!plant) continue;

      let progressed = true;
      while(progressed){
        progressed = false;
        if(plant.stage >= 3) break;
        if(plant.needsWater) break;

        const elapsed = now - (plant.growStartAt || now);
        if(elapsed >= getStageMs(plant.seedId)){
          plant.stage += 1;
          progressed = true;
          if(plant.stage < 3){
            plant.needsWater = true;
            plant.growStartAt = null;
          }else{
            plant.needsWater = false;
          }
        }
      }
    }
  }

  // Animals payout catch-up
  for(const a of state.animals){
    const meta = ANIMALS[a.typeId];
    if(!meta) continue;
    const last = a.lastPaidMs || a.boughtAtMs || state.lastSeenMs || now;
    const cycles = Math.floor((now - last) / meta.payoutEveryMs);
    if(cycles > 0){
      const multiplier = (a.fedUntilMs && a.fedUntilMs > now) ? 2 : 1;
      state.money += cycles * meta.payout * multiplier;
      a.lastPaidMs = last + cycles * meta.payoutEveryMs;
    }
  }

  // Fish payout catch-up
  for(const f of state.fishes){
    const meta = FISHES[f.typeId];
    if(!meta) continue;
    const last = f.lastPaidMs || f.boughtAtMs || state.lastSeenMs || now;
    const cycles = Math.floor((now - last) / meta.payoutEveryMs);
    if(cycles > 0){
      const multiplier = (f.fedUntilMs && f.fedUntilMs > now) ? 2 : 1;
      state.money += cycles * meta.payout * multiplier;
      f.lastPaidMs = last + cycles * meta.payoutEveryMs;
    }
  }
}


function updateHud(){
  // Atualiza em todas as telas (pode haver HUD duplicado)
  const moneyEls = document.querySelectorAll(".moneyValue, #moneyValue");
  const v = (typeof state.money === "number" && !isNaN(state.money)) ? state.money : 0;
  moneyEls.forEach(el=> el.textContent = String(v));

  const clockEls = document.querySelectorAll(".clockValue, #clockValue");
  if(clockEls.length){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    const ss = String(d.getSeconds()).padStart(2,"0");
    clockEls.forEach(el=> el.textContent = `${hh}:${mm}:${ss}`);
  }
}

function updateClock(){
  // Algumas versões do HTML usam apenas a classe ".clockValue" (sem id "clockValue").
  // Quando o jogo era aberto direto no navegador, o seletor por id retornava null
  // e isso quebrava o JS logo no início, resultando em tela preta.
  // Mantemos compatibilidade atualizando todas as instâncias do relógio.
  const clockEls = document.querySelectorAll(".clockValue, #clockValue");
  if(!clockEls.length) return;

  const d = new Date();
  const pad = (n)=> String(n).padStart(2,"0");
  const txt = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  clockEls.forEach(el => { el.textContent = txt; });
}

function setScreen(idx){
  // 3 telas: 0=vaso, 1=rancho, 2=peixes
  state.screenIndex = Math.max(0, Math.min(2, idx));
  const slider = $("#slider");
  const step = 100/3;
  slider.style.transform = `translateX(${-step*state.screenIndex}%)`;
  saveState();
}

// Posições dos 4 slots do canteiro (em % da tela).
// Ajuste fino: elevamos o "top" para que a planta fique em cima da terra
// (antes ela aparecia colada na frente da jardineira).
/**
 * Ajuste fino do canteiro (4 espaços)
 *
 * ✅ Edite SOMENTE os valores de x/y abaixo para ajustar posição e espaçamento.
 * - x: move para esquerda/direita (em "px virtuais")
 * - y: move para cima/baixo (em "px virtuais")
 *
 * Observação: o jogo posiciona as plantas via porcentagem dentro do overlay (.beds).
 * Para você ajustar em "px", fazemos uma conversão simples (calibração) para left/top (%).
 */
const BED_POSITIONS = [
  { x: -145, y: -15 }, // slot 0
  { x: -40,  y: -15 }, // slot 1
  { x:  44,  y: -15 }, // slot 2
  { x: 120,  y: -15 }  // slot 3
];

// Calibração: mantém o layout atual como padrão e permite ajustar x/y com facilidade.
const BED_POSITIONS_CALIBRATION = {
  leftCenterPct: 50,     // centro do overlay
  leftPctPerPx: 0.1681,  // quanto 1px "virtual" move em %
  topBasePct: 59.0,      // topo (em %) onde o "pé" da planta encosta na terra
  topBaseYPx: 15,        // y (em px virtuais) que corresponde ao topBasePct
  topPctPerPx: 0.10      // quanto 1px "virtual" move em % (ajuste fino do encaixe vertical)
};

// Converte BED_POSITIONS (x/y) -> BED_POS (left/top em %), usado pelo CSS atual.
const BED_POS = BED_POSITIONS.map(p => ({
  left: BED_POSITIONS_CALIBRATION.leftCenterPct + (p.x * BED_POSITIONS_CALIBRATION.leftPctPerPx),
  top:  BED_POSITIONS_CALIBRATION.topBasePct + ((p.y - BED_POSITIONS_CALIBRATION.topBaseYPx) * BED_POSITIONS_CALIBRATION.topPctPerPx)
}));

function getPlantAt(i){
  if(!Array.isArray(state.beds)) state.beds = [null,null,null,null];
  return state.beds[i] || null;
}
function setPlantAt(i, plant){
  if(!Array.isArray(state.beds)) state.beds = [null,null,null,null];
  state.beds[i] = plant;
}

function updateBedsSprites(){
  const prevStages = state._lastStages || [0,0,0,0];
  const nextStages = [0,0,0,0];

  for(let i=0;i<4;i++){
    const plant = getPlantAt(i);
    const sprite = document.getElementById(`plantSprite${i}`);
    const shadow = document.getElementById(`plantShadow${i}`);
    if(!sprite) continue;

    const pos = BED_POS[i] || {left:50, top:50};
    sprite.style.setProperty('--plant-left', `${pos.left}%`);
    sprite.style.setProperty('--plant-top', `${pos.top}%`);
    if(shadow){
      shadow.style.setProperty('--plant-left', `${pos.left}%`);
      shadow.style.setProperty('--plant-top', `${pos.top}%`);
    }

    if(!plant){
      sprite.classList.add('hidden');
      if(shadow) shadow.classList.add('hidden');
      continue;
    }

    sprite.classList.remove('hidden');
    if(shadow) shadow.classList.remove('hidden');

    const stage = Math.max(1, Math.min(3, plant.stage || 1));
    nextStages[i] = stage;

    sprite.classList.remove("stage1","stage2","stage3");
    if(shadow) shadow.classList.remove("stage1","stage2","stage3");
    sprite.classList.add(`stage${stage}`);
    if(shadow) shadow.classList.add(`stage${stage}`);

    if(stage !== prevStages[i]){
      sprite.classList.remove("grow");
      if(shadow) shadow.classList.remove("grow");
      void sprite.offsetWidth;
      sprite.classList.add("grow");
      if(shadow) shadow.classList.add("grow");
    }

    const tune = getPlantVisualTuning(plant.seedId);
    const idx = stage - 1;
    const scaleMul = (tune?.baseScale || 1) * (tune?.stageScale?.[idx] || 1);
    const topShift = (tune?.topShift?.[idx] || 0);

    sprite.style.setProperty("--plant-scale-mul", String(scaleMul));
    sprite.style.setProperty("--plant-top-shift", String(topShift));
    if(shadow){
      shadow.style.setProperty("--shadow-scale-mul", String(scaleMul));
      shadow.style.setProperty("--shadow-top-shift", String(topShift));
    }

    const sway = (typeof plant._swayDeg === "number") ? plant._swayDeg : 0;
    sprite.style.setProperty("--sway", `${sway}deg`);
    if(shadow) shadow.style.setProperty("--sway", `${sway}deg`);

    const seedId = plant.seedId || "morango";
    const tryPath = getPlantSpritePath(seedId, stage);
    sprite.onerror = () => {
      sprite.onerror = null;
      sprite.src = `assets/plant_stage${stage}.svg`;
    };
    sprite.src = tryPath;
    sprite.alt = "";
  }

  state._lastStages = nextStages;
  updatePlantInfoBalloon();
}

function openModal(id){
  $(id).classList.remove("hidden");
}
function closeModal(id){
  $(id).classList.add("hidden");
}

function selectSeed(seedId){
  state.selectedSeed = seedId;
  const s = getSeed(seedId);
  $("#seedSelected").textContent = s ? `${s.name}` : "nenhuma";
  saveState();
}

function ensureInventory(seedId){
  if(!state.seedInventory) state.seedInventory = {};
  if(!state.seedInventory[seedId]) state.seedInventory[seedId] = 0;
}

function buySeed(seedId){
  const s = getSeed(seedId);
  if(!s) return;
  ensureInventory(seedId);
  if(state.money < s.buy){
    toast(`Moedas insuficientes. Precisa de ${s.buy}.`);
    return;
  }
  state.money -= s.buy;
  updateHUD();
  state.seedInventory[seedId] += 1;
  saveState();
  updateHud();
  renderSeedShop();
  renderSeedInv();
  toast(`${s.emoji} ${s.name} +1 (comprado)`);
}

function renderSeedShop(){
  const box = $("#seedShop");
  if(!box) return;
  box.innerHTML = "";

  if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };

  const term = ($("#seedSearch")?.value || state.seedUI.search || "").trim().toLowerCase();
  state.seedUI.search = term;

  const group = state.seedUI.group || "Hortaliças";

  const items = SEEDS
    .filter(s => s.group === group)
    .filter(s => !term || (`${s.name} ${s.id}`.toLowerCase().includes(term)))
    .sort((a,b)=> a.buy - b.buy);

  // cabeçalho da lista
  const head = document.createElement("div");
  head.className = "item";
  head.innerHTML = `<div class="left"><div class="name">${group}</div><div class="meta">Ordenado por preço • ${items.length} itens</div></div>`;
  box.appendChild(head);

  for(const s of items){
    ensureInventory(s.id);
    const owned = state.seedInventory[s.id] || 0;
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="left">
        <div class="name">${s.emoji} ${s.name}</div>
        <div class="meta">Preço: <b>${s.buy}</b> • Cresce: <b>${s.growMin} min</b> • Venda: <b>${s.sell}</b></div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="pill">Você tem: ${owned}</span>
        <button class="btn primary" data-buy="${s.id}">Comprar</button>
      </div>
    `;
    box.appendChild(item);
  }

  box.onclick = (e)=>{
    const btn = e.target.closest("button[data-buy]");
    if(!btn) return;
    buySeed(btn.dataset.buy);
  };
}

function renderSeedInv(){
  const box = $("#seedInv");
  if(!box) return;
  box.innerHTML = "";

  if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };

  const term = ($("#seedSearch")?.value || state.seedUI.search || "").trim().toLowerCase();
  state.seedUI.search = term;

  const group = state.seedUI.group || "Hortaliças";

  const ownedEntries = Object.entries(state.seedInventory || {}).filter(([id,q])=>q>0);
  const items = ownedEntries
    .map(([id,q])=> ({ s: getSeed(id), q }))
    .filter(x => x.s && x.s.group === group)
    .filter(x => !term || (`${x.s.name} ${x.s.id}`.toLowerCase().includes(term)))
    .sort((a,b)=> a.s.buy - b.s.buy);

  const head = document.createElement("div");
  head.className = "item";
  head.innerHTML = `<div class="left"><div class="name">${group}</div><div class="meta">${items.length} itens no inventário</div></div>`;
  box.appendChild(head);

  if(items.length === 0){
    const empty = document.createElement("div");
    empty.className = "item";
    empty.innerHTML = `<div class="left"><div class="name">Nada aqui</div><div class="meta">Compre sementes dessa categoria na aba <b>Loja</b>.</div></div>`;
    box.appendChild(empty);
    return;
  }

  for(const {s,q} of items){
    const selected = (state.selectedSeed === s.id) ? " (selecionada)" : "";
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="left">
        <div class="name">${s.emoji} ${s.name} <span style="opacity:.8; font-size:12px;">${selected}</span></div>
        <div class="meta">Qtd: <b>${q}</b> • Cresce: <b>${s.growMin} min</b> • Venda: <b>${s.sell}</b></div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn" data-select="${s.id}">Selecionar</button>
      </div>
    `;
    box.appendChild(item);
  }

  box.onclick = (e)=>{
    const btn = e.target.closest("button[data-select]");
    if(!btn) return;
    selectSeed(btn.dataset.select);
renderSeedInv();
toast("Semente selecionada.");
// se abriu pelo Plantar, planta imediatamente
if(state.seedUI?.context === "plant"){
  closeModal("#seedModal");
  state.seedUI.context = "buy";
  saveState();
  plantSelectedSeed();
}
  };
}

/** Rancho */
function renderAnimals(){
  const area = $("#animalArea");
  if(!area) return;
  area.innerHTML = "";

  const countEl = $("#animalCount");
  if(countEl) countEl.textContent = String(state.animals.length);

  if(state.animals.length === 0){
    const empty = document.createElement("div");
    empty.className = "animal-badge";
    empty.textContent = "Sem animais";
    empty.style.position = "absolute";
    empty.style.left = "50%";
    empty.style.top = "10%";
    empty.style.transform = "translateX(-50%)";
    empty.style.background = "rgba(0,0,0,.35)";
    empty.style.color = "#fff";
    empty.style.fontWeight = "900";
    empty.style.fontSize = "12px";
    empty.style.padding = "6px 10px";
    empty.style.borderRadius = "999px";
    area.appendChild(empty);
    return;
  }

  const now = Date.now();
  const spots = [
    { x: 32, y: 62 },
    { x: 55, y: 68 },
    { x: 78, y: 60 },
  ];

  state.animals.forEach((a, i)=>{
    const meta = ANIMALS[a.typeId];
    const spot = spots[i % spots.length];

    const wrap = document.createElement("div");
    wrap.className = "ranch-animal";
    wrap.style.left = spot.x + "%";
    wrap.style.top = spot.y + "%";
    wrap.textContent = meta ? meta.emoji : "❓";

    // badge se estiver alimentado (bônus ativo)
    if(a.fedUntilMs && a.fedUntilMs > now){
      const b = document.createElement("div");
      b.className = "badge";
      b.textContent = "🥕";
      wrap.appendChild(b);
    }

    area.appendChild(wrap);
  });
}

function buyAnimal(typeId){
  const meta = ANIMALS[typeId];
  if(!meta) return;

  if(state.animals.length >= 3){
    toast("Você já tem 3 animais.");
    return;
  }
  if(state.money < meta.cost){
    toast(`Moedas insuficientes. Precisa de ${meta.cost}.`);
    return;
  }

  const now = Date.now();
  state.money -= meta.cost;

  state.animals.push({
    typeId,
    boughtAtMs: now,
    lastPaidMs: now,
    fedUntilMs: 0
  });

  saveState();
  updateHud();
  renderAnimals();
  renderSeedShop();
  renderSeedInv();
  toast(`${meta.emoji} ${meta.name} comprado!`);
}

function feedAnimals(){
  if(state.animals.length === 0){
    toast("Compre um animal primeiro.");
    return;
  }
  const now = Date.now();
  // alimenta por 5 minutos: dobra ganhos enquanto ativo
  for(const a of state.animals){
    a.fedUntilMs = Math.max(a.fedUntilMs || 0, now + 5*60_000);
  }
  saveState();
  toast("Animais alimentados! (bônus 5 min)");
}

function collectRanch(){
  // coleta "agora": paga 1 ciclo se já passou
  const now = Date.now();
  let gained = 0;
  for(const a of state.animals){
    const meta = ANIMALS[a.typeId];
    if(!meta) continue;
    const last = a.lastPaidMs || a.boughtAtMs || now;
    if(now - last >= meta.payoutEveryMs){
      const cycles = Math.floor((now - last) / meta.payoutEveryMs);
      const multiplier = (a.fedUntilMs && a.fedUntilMs > now) ? 2 : 1;
      gained += cycles * meta.payout * multiplier;
      a.lastPaidMs = last + cycles * meta.payoutEveryMs;
    }
  }
  if(gained <= 0){
    toast("Ainda não tem moedas para coletar.");
    return;
  }
  state.money += gained;
  saveState();
  updateHud();
  toast(`Coletado do rancho! +${gained} moedas`);
}

/** Peixes */
function renderFish(){
  const area = $("#fishArea");
  if(!area) return;
  area.innerHTML = "";

  const countEl = $("#fishCount");
  if(countEl) countEl.textContent = String(state.fishes.length);

  if(state.fishes.length === 0){
    const empty = document.createElement("div");
    empty.className = "animal-badge";
    empty.textContent = "Sem peixes";
    empty.style.position = "absolute";
    empty.style.left = "50%";
    empty.style.top = "8%";
    empty.style.transform = "translateX(-50%)";
    empty.style.background = "rgba(0,0,0,.35)";
    empty.style.color = "#fff";
    empty.style.fontWeight = "900";
    empty.style.fontSize = "12px";
    empty.style.padding = "6px 10px";
    empty.style.borderRadius = "999px";
    area.appendChild(empty);
    return;
  }

  const now = Date.now();
  const spots = [
    { x: 34, y: 52 },
    { x: 52, y: 58 },
    { x: 68, y: 48 },
    { x: 46, y: 44 },
    { x: 60, y: 62 },
  ];

  state.fishes.forEach((f, i)=>{
    const meta = FISHES[f.typeId];
    const spot = spots[i % spots.length];
    const wrap = document.createElement("div");
    wrap.className = "fish-sprite";
    wrap.style.left = spot.x + "%";
    wrap.style.top = spot.y + "%";
    wrap.textContent = meta ? meta.emoji : "❓";

    if(f.fedUntilMs && f.fedUntilMs > now){
      const b = document.createElement("div");
      b.className = "badge";
      b.textContent = "🍞";
      // reaproveita o estilo do badge do rancho
      b.style.position = "absolute";
      b.style.right = "-8px";
      b.style.top = "-10px";
      b.style.background = "rgba(34,197,94,.92)";
      b.style.color = "#fff";
      b.style.fontSize = "12px";
      b.style.fontWeight = "900";
      b.style.padding = "4px 7px";
      b.style.borderRadius = "999px";
      wrap.appendChild(b);
    }

    area.appendChild(wrap);
  });
}

function buyFish(typeId){
  const meta = FISHES[typeId];
  if(!meta) return;

  if(state.fishes.length >= 5){
    toast("Você já tem 5 peixes.");
    return;
  }
  if(state.money < meta.cost){
    toast(`Moedas insuficientes. Precisa de ${meta.cost}.`);
    return;
  }

  const now = Date.now();
  state.money -= meta.cost;
  state.fishes.push({ typeId, boughtAtMs: now, lastPaidMs: now, fedUntilMs: 0 });
  saveState();
  updateHud();
  renderFish();
  toast(`${meta.emoji} ${meta.name} comprado!`);
}

function feedFish(){
  if(state.fishes.length === 0){
    toast("Compre um peixe primeiro.");
    return;
  }
  const now = Date.now();
  for(const f of state.fishes){
    f.fedUntilMs = Math.max(f.fedUntilMs || 0, now + 5*60_000);
  }
  saveState();
  toast("Peixes alimentados! (bônus 5 min)");
}

function collectFish(){
  const now = Date.now();
  let gained = 0;
  for(const f of state.fishes){
    const meta = FISHES[f.typeId];
    if(!meta) continue;
    const last = f.lastPaidMs || f.boughtAtMs || now;
    if(now - last >= meta.payoutEveryMs){
      const cycles = Math.floor((now - last) / meta.payoutEveryMs);
      const multiplier = (f.fedUntilMs && f.fedUntilMs > now) ? 2 : 1;
      gained += cycles * meta.payout * multiplier;
      f.lastPaidMs = last + cycles * meta.payoutEveryMs;
    }
  }
  if(gained <= 0){
    toast("Ainda não tem moedas para coletar.");
    return;
  }
  state.money += gained;
  saveState();
  updateHud();
  toast(`Coletado do lago! +${gained} moedas`);
}

/** Swipe / drag */
function setupSwipe(){
  const slider = $("#slider");
  const isUI = (el)=> !!(el && el.closest && el.closest('.hit, .modal, .modal-card, .btn, .tab, .tile, button'));
  let startX = 0;
  let startY = 0;
  let dragging = false;

  function onStart(x,y){
    startX = x; startY = y;
    dragging = true;
    slider.style.transition = "none";
  }
  function onMove(x,y){
    if(!dragging) return;
    const dx = x - startX;
    const dy = y - startY;
    if(Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12){
      // provável rolagem vertical
      return;
    }
    // move proporcional ao dx
    const width = $("#app").clientWidth;
    const step = 100/3;
    const base = -step*state.screenIndex;
    const pct = (dx / width) * step;
    slider.style.transform = `translateX(${base + pct}%)`;
  }
  function onEnd(x){
    if(!dragging) return;
    dragging = false;
    slider.style.transition = "";
    const dx = x - startX;
    if(dx < -60) setScreen(state.screenIndex + 1);
    else if(dx > 60) setScreen(state.screenIndex - 1);
    else setScreen(state.screenIndex);
  }
  // touch
  slider.addEventListener("touchstart", (e)=>{
    if(isUI(e.target)) return;
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  slider.addEventListener("touchmove", (e)=>{
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });

  slider.addEventListener("touchend", (e)=>{
    const t = (e.changedTouches && e.changedTouches[0]) || { clientX: startX };
    onEnd(t.clientX);
  }, { passive: true });
  // mouse
  slider.addEventListener("mousedown", (e)=>{
    if(isUI(e.target)) return;
    onStart(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e)=> onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e)=> onEnd(e.clientX));
}

function wireUI(){
  // --- Modais (sementes / animais) ---
  const btnChooseSeed = $("#btnChooseSeed");
  if(btnChooseSeed){
    btnChooseSeed.addEventListener("click", ()=>{
      openSeedModal("shop","buy");

      // aplica categoria salva
      const g = state.seedUI?.group || "Hortaliças";
      document.querySelectorAll(".rail-btn").forEach(b=>{
        b.classList.toggle("active", b.dataset.group === g);
      });

      if(!state.seedUI) state.seedUI = { search:"", group:g };
      state.seedUI.group = g;

      // abre na Loja por padrão
      $("#tabShop").classList.add("active");
      $("#tabInv").classList.remove("active");
      $("#seedShop").classList.remove("hidden");
      $("#seedInv").classList.add("hidden");

      renderSeedShop();
      renderSeedInv();
    });
  }

  $("#closeSeedModal")?.addEventListener("click", ()=> closeModal("#seedModal"));
  $("#seedModal")?.addEventListener("click", (e)=>{
    if(e.target && e.target.id === "seedModal") closeModal("#seedModal");
  });

  const btnBuyAnimals = $("#btnBuyAnimals");
  if(btnBuyAnimals){
    btnBuyAnimals.addEventListener("click", ()=>{
      $("#animalCount").textContent = String(state.animals.length);
      openModal("#animalModal");
    });
  }
  $("#closeAnimalModal")?.addEventListener("click", ()=> closeModal("#animalModal"));
  $("#animalModal")?.addEventListener("click", (e)=>{
    if(e.target && e.target.id === "animalModal") closeModal("#animalModal");
  });

  // --- Abas sementes ---
  const tabShop = $("#tabShop");
  const tabInv  = $("#tabInv");
  tabShop?.addEventListener("click", ()=>{
    tabShop.classList.add("active");
    tabInv?.classList.remove("active");
    $("#seedShop").classList.remove("hidden");
    $("#seedInv").classList.add("hidden");
    if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };
    state.seedUI.activeTab = "shop";
    saveState();
    renderSeedShop();
  });

  tabInv?.addEventListener("click", ()=>{
    tabInv.classList.add("active");
    tabShop?.classList.remove("active");
    $("#seedInv").classList.remove("hidden");
    $("#seedShop").classList.add("hidden");
    if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };
    state.seedUI.activeTab = "inv";
    saveState();
    renderSeedInv();
  });

  // --- Categorias (menu lateral) ---
  const railBtns = Array.from(document.querySelectorAll(".rail-btn"));
  railBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      railBtns.forEach(b=> b.classList.remove("active"));
      btn.classList.add("active");
      if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };
      state.seedUI.group = btn.dataset.group || "Hortaliças";
      saveState();
      renderSeedShop();
      renderSeedInv();
    });
  });

  // --- Busca ---
  const seedSearch = $("#seedSearch");
  if(seedSearch){
    seedSearch.value = state.seedUI?.search || "";
    seedSearch.addEventListener("input", ()=>{
      if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };
      state.seedUI.search = seedSearch.value || "";
      saveState();
      renderSeedShop();
      renderSeedInv();
    });
  }

  // --- Render inicial ---
  renderSeedShop();
  renderSeedInv();
  renderAnimals();
  renderFish();
  updateHud();

  // --- Grid de animais (comprar) ---
  const animalGrid = document.querySelector("#animalModal .grid");
  animalGrid?.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-animal]");
    if(!btn) return;
    buyAnimal(btn.dataset.animal);
    $("#animalCount").textContent = String(state.animals.length);
  });

  // --- Grid de peixes (comprar) ---
  const fishGrid = document.querySelector("#fishModal .grid");
  fishGrid?.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-fish]");
    if(!btn) return;
    buyFish(btn.dataset.fish);
    $("#fishCount").textContent = String(state.fishes.length);
  });

  // --- Ações vaso ---
  $("#btnPlant")?.addEventListener("click", plantSeed);
  $("#btnWater")?.addEventListener("click", waterPlant);
  $("#btnHarvest")?.addEventListener("click", harvestPlant);

  // Seleção do canteiro (4 slots)
  for(let i=0;i<4;i++){
    document.getElementById(`btnBed${i}`)?.addEventListener("click", ()=>{
      state.selectedBed = i;
      saveState();
      updatePlantGrowth();
      const plant = getPlantAt(i);
      toast(plant ? `Espaço ${i+1}: ${plant.seedName || "Planta"}` : `Espaço ${i+1} vazio`);
    });
  }


  // --- Ações rancho ---
  $("#btnFeed")?.addEventListener("click", feedAnimals);
  $("#btnHarvestRanch")?.addEventListener("click", collectRanch);
  $("#btnChooseAnimal")?.addEventListener("click", ()=>{
    if(state.animals.length === 0){ toast("Sem animais."); return; }
    state.selectedAnimalIndex = (state.selectedAnimalIndex + 1) % state.animals.length;
    saveState();
    const meta = ANIMALS[state.animals[state.selectedAnimalIndex].typeId];
    toast(`Selecionado: ${meta.emoji} ${meta.name}`);
  });

  // --- Ações peixes ---
  $("#btnBuyFish")?.addEventListener("click", ()=>{
    openModal("#fishModal");
    renderFish();
  });
  $("#closeFishModal")?.addEventListener("click", ()=> closeModal("#fishModal"));
  $("#btnFeedFish")?.addEventListener("click", feedFish);
  $("#btnHarvestFish")?.addEventListener("click", collectFish);
  $("#btnChooseFish")?.addEventListener("click", ()=>{
    if(state.fishes.length === 0){ toast("Sem peixes."); return; }
    state.selectedFishIndex = (state.selectedFishIndex + 1) % state.fishes.length;
    saveState();
    const meta = FISHES[state.fishes[state.selectedFishIndex].typeId];
    toast(`Selecionado: ${meta.emoji} ${meta.name}`);
  });

  // --- Hints ---
  setTimeout(()=>{
    $("#hintPot")?.classList.add("hidden");
    $("#hintRanch")?.classList.add("hidden");
    $("#hintFish")?.classList.add("hidden");
  }, 5000);
}

function startLoops(){
  setInterval(updatePlantInfoBalloon, 1000);
  setInterval(updateClock, 250);
  setInterval(()=>{
    tryAdvancePlant();
    // salva de tempos em tempos (se o usuário ficar com a aba aberta)
    saveState();
  }, 1000);
  setInterval(()=>{
    // payout online (se o usuário deixar aberto)
    const now = Date.now();
    let gained = 0;
    for(const a of state.animals){
      const meta = ANIMALS[a.typeId];
      if(!meta) continue;
      const last = a.lastPaidMs || a.boughtAtMs || now;
      if(now - last >= meta.payoutEveryMs){
        const cycles = Math.floor((now - last) / meta.payoutEveryMs);
        const multiplier = (a.fedUntilMs && a.fedUntilMs > now) ? 2 : 1;
        gained += cycles * meta.payout * multiplier;
        a.lastPaidMs = last + cycles * meta.payoutEveryMs;
      }
    }

    for(const f of state.fishes){
      const meta = FISHES[f.typeId];
      if(!meta) continue;
      const last = f.lastPaidMs || f.boughtAtMs || now;
      if(now - last >= meta.payoutEveryMs){
        const cycles = Math.floor((now - last) / meta.payoutEveryMs);
        const multiplier = (f.fedUntilMs && f.fedUntilMs > now) ? 2 : 1;
        gained += cycles * meta.payout * multiplier;
        f.lastPaidMs = last + cycles * meta.payoutEveryMs;
      }
    }
    if(gained > 0){
      state.money += gained;
      updateHud();
      saveState();
    }
  }, 2000);
}

function init(){
  applyOfflineProgress();
  updateHud();
  updateClock();
  updateBedsSprites();
  renderAnimals();
  renderFish();

  // Garante que modais iniciem fechados
  closeModal("#seedModal");
  closeModal("#animalModal");
  closeModal("#fishModal");
  setScreen(0);
  setupSwipe();
  wireUI();
  updateHUD();
  setInterval(updateHUD, 1000);
  setupBGM();
  updateHUD();
  startLoops();
}

window.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState === "hidden"){
    saveState();
  }else{
    applyOfflineProgress();
    updateHud();
    updateBedsSprites();
    renderAnimals();
  }
});

init();


function ensureInitialMoney(){
  // Para novos jogadores, money já vem 100 no defaultState.
  // Para saves quebrados, garantimos 100 sem "roubar" progresso:
  // - Se money estiver undefined/NaN, corrigimos sempre.
  // - Se money estiver 0/negativo E o save aparenta estar "novo" (sem planta/animais/inventário), damos 100.
  if(state.money === undefined || state.money === null){
    state.money = 100;
  }
  if(typeof state.money !== "number" || isNaN(state.money)){
    state.money = 100;
  }

  const noProgress =
    (!Array.isArray(state.beds) || state.beds.every(x=>!x)) &&
    (!state.animals || state.animals.length === 0) &&
    (!state.seedInventory || Object.keys(state.seedInventory).length === 0);

  if(typeof state.money === "number" && state.money <= 0 && noProgress){
    state.money = 100;
    state.moneyInitialized = true;
    saveState();
  }
}



function openSeedModal(tab="shop", context="buy"){
  if(!state.seedUI) state.seedUI = { search:"", group:"Hortaliças" };
  state.seedUI.activeTab = (tab === "inv" ? "inv" : "shop");
  state.seedUI.context = context; // "buy" | "plant"
  saveState();

  openModal("#seedModal");

  // aplica categoria salva no rail
  const g = state.seedUI?.group || "Hortaliças";
  document.querySelectorAll('.rail-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.group === g);
});

  // seleciona aba
  const tabShop = $("#tabShop");
  const tabInv = $("#tabInv");
  if(tabShop && tabInv){
    const isInv = state.seedUI.activeTab === "inv";
    tabShop.classList.toggle("active", !isInv);
    tabInv.classList.toggle("active", isInv);
  }
  $("#seedShop")?.classList.toggle("hidden", state.seedUI.activeTab === "inv");
  $("#seedInv")?.classList.toggle("hidden", state.seedUI.activeTab !== "inv");

  const ss = $("#seedSearch");
  if(ss){
    ss.value = state.seedUI?.search || "";
    ss.focus();
    ss.select();
  }

  renderSeedShop();
  renderSeedInv();
}


function plantSelectedSeed(){
  const idx = (typeof state.selectedBed === "number" ? state.selectedBed : 0);
  if(getPlantAt(idx)){ toast("Esse espaço já está ocupado."); return; }
  if(!state.selectedSeed){ toast("Escolha uma semente no inventário."); return; }

  ensureInventory(state.selectedSeed);
  if((state.seedInventory[state.selectedSeed]||0) <= 0){
    toast("Você não tem essa semente.");
    return;
  }

  const seedMeta = getSeed(state.selectedSeed);
  // Consome 1 semente e cria a planta no slot selecionado
  state.seedInventory[state.selectedSeed] -= 1;

  setPlantAt(idx, {
    seedId: state.selectedSeed,
    seedName: seedMeta?.name || "Planta",
    stage: 1,
    growStartAt: null,      // só começa a contar depois de regar
    needsWater: true,
    _phase: Math.random()*Math.PI*2 // para vento desalinhado
  });

  saveState();
  updatePlantGrowth();
  toast(`Plantado no espaço ${idx+1}! Agora regue para crescer!`);
}

function plantSeed(){
  // Plantar abre o modal j no inventrio (contexto: plant)
  openSeedModal("inv", "plant");
  const tabShop = $("#tabShop");
  const tabInv  = $("#tabInv");
  tabInv?.classList.add("active");
  tabShop?.classList.remove("active");
  $("#seedInv")?.classList.remove("hidden");
  $("#seedShop")?.classList.add("hidden");
  renderSeedInv();
}

function waterPlant(){
  const idx = (typeof state.selectedBed === "number" ? state.selectedBed : 0);
  const plant = getPlantAt(idx);
  if(!plant){ toast("Nada plantado nesse espaço."); return; }
  if(plant.stage >= 3){
    toast("Já está pronto para colher!");
    return;
  }
  if(!plant.needsWater){
    toast("Já foi regado. Aguarde crescer.");
    return;
  }

  plant.needsWater = false;
  plant.growStartAt = Date.now();

  saveState();
  updatePlantGrowth();
  toast("Regado! 💧");
}

function harvestPlant(){
  const idx = (typeof state.selectedBed === "number" ? state.selectedBed : 0);
  const plant = getPlantAt(idx);
  if(!plant){ toast("Nada para colher nesse espaço."); return; }
  if(plant.stage < 3){
    toast("Ainda não está pronto. Regue e espere crescer.");
    return;
  }
  const s = getSeed(plant.seedId);
  const gain = s ? s.sell : 20;
  state.money += gain;
  setPlantAt(idx, null);
  saveState();
  updatePlantGrowth();
  renderSeedShop();
  renderSeedInv();
  toast(`Colhido! +${gain} moedas`);
}

function tryAdvancePlant(){
  if(!Array.isArray(state.beds)) state.beds = [null,null,null,null];
  let changed = false;
  const now = Date.now();

  for(const plant of state.beds){
    if(!plant) continue;
    if(plant.needsWater) continue;
    if(plant.stage >= 3) continue;
    if(!plant.growStartAt) continue;

    const elapsed = now - plant.growStartAt;
    const need = getStageMs(plant.seedId);

    if(elapsed >= need){
      plant.stage += 1;
      changed = true;
      if(plant.stage < 3){
        plant.needsWater = true;
        plant.growStartAt = null;
      }else{
        plant.needsWater = false;
      }
    }
  }

  // vento sutil: atualiza fase de cada planta
  for(const plant of state.beds){
    if(!plant) continue;
    const phase = (plant._phase || 0) + 0.05;
    plant._phase = phase;
    plant._swayDeg = Math.sin(phase) * 2.0; // ±2°
  }

  if(changed){
    saveState();
    updatePlantGrowth();
  }
}

function updatePlantGrowth(){
  updateBedsSprites();
  updateHud();

  const idx = (typeof state.selectedBed === "number" ? state.selectedBed : 0);
  const plant = getPlantAt(idx);

  const btnPlant = $("#btnPlant");
  const btnWater = $("#btnWater");
  const btnHarvest = $("#btnHarvest");

  if(btnPlant){
    // Plantar fica habilitado se o slot selecionado estiver vazio
    btnPlant.disabled = !!plant;
    btnPlant.style.opacity = btnPlant.disabled ? "0.6" : "1";
  }
  if(btnWater){
    const canWater = !!plant && plant.stage < 3 && plant.needsWater;
    btnWater.disabled = !canWater;
    btnWater.style.opacity = btnWater.disabled ? "0.6" : "1";
  }
  if(btnHarvest){
    const canHarvest = !!plant && plant.stage >= 3;
    btnHarvest.disabled = !canHarvest;
    btnHarvest.style.opacity = btnHarvest.disabled ? "0.6" : "1";
  }

  // destaca slot selecionado (se existir)
  for(let i=0;i<4;i++){
    const b = document.getElementById(`btnBed${i}`);
    if(b) b.classList.toggle("active", i===idx);
  }
}

function updateHUD(){
  // Compat: algumas versões usam classes em vez de ids
  const moneyEls = document.querySelectorAll(".moneyValue, #moneyValue");
  const v = (typeof state.money === "number" && !isNaN(state.money)) ? state.money : 0;
  moneyEls.forEach(el=> el.textContent = String(v));

  const clockEls = document.querySelectorAll(".clockValue, #clockValue");
  if(clockEls.length){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    const ss = String(d.getSeconds()).padStart(2,"0");
    clockEls.forEach(el=> el.textContent = `${hh}:${mm}:${ss}`);
  }
}

function setupBGM(){
  const bgm = document.getElementById("bgm");
  const modal = document.getElementById("musicModal");
  const btnToggle = document.getElementById("btnMusicToggle");
  const vol = document.getElementById("musicVolume");
  const btnClose = document.getElementById("btnCloseMusic");
  const btnFixMoney = document.getElementById("btnFixMoney");

  // Pode existir mais de um botão de música (telas diferentes)
  const btnMusicButtons = Array.from(document.querySelectorAll("#btnMusic, .btnMusic"));

  if(!bgm || !modal || !btnToggle || !vol || !btnClose) return;

  let enabled = (localStorage.getItem("bgm_enabled") ?? "1") === "1";
  let volume = Number(localStorage.getItem("bgm_volume") ?? "35");
  if(!Number.isFinite(volume)) volume = 35;
  volume = Math.max(0, Math.min(100, volume));

 // Se o volume veio zerado de um save antigo, usa um padro audvel
  if(volume === 0) volume = 35;

  bgm.loop = true;
  // Gate de áudio (Chrome bloqueia autoplay com som em file://)
  const audioGate = document.getElementById("audioGate");
  const btnEnableAudio = document.getElementById("btnEnableAudio");

  // Tenta "pré-tocar" em mudo: autoplay mudo costuma ser permitido.
  // Depois liberamos o som no primeiro clique/toque do usuário.
  bgm.muted = true;
  bgm.volume = volume / 100;
  vol.value = String(volume);

  function refresh(){
    btnToggle.textContent = enabled ? "🔊 Ligada" : "🔇 Desligada";
    btnMusicButtons.forEach(b=>{ b.textContent = enabled ? "🎵" : "🔇"; });
  }
  refresh();

  // Tenta iniciar em mudo; se falhar, mostra o gate.
  playNow();

  function showGate(){
    if(audioGate) audioGate.classList.remove("hidden");
  }
  function hideGate(){
    if(audioGate) audioGate.classList.add("hidden");
  }

  // Se o áudio começar a tocar por qualquer motivo, garantimos que o popup suma.
  bgm.addEventListener("playing", hideGate);
  bgm.addEventListener("canplay", ()=>{
    // Não força autoplay aqui, apenas evita popup preso quando o arquivo carrega.
    if(!bgm.paused && !bgm.muted) hideGate();
  });
  function playNow(){
    if(!enabled) return Promise.resolve(false);
    try{
      const p = bgm.play();
      if(p && typeof p.then === "function"){
        return p.then(()=>{ hideGate(); return true; }).catch(()=>{ showGate(); return false; });
      }
      // Alguns navegadores retornam void
      hideGate();
      return Promise.resolve(true);
    }catch(e){
      showGate();
      return Promise.resolve(false);
    }
  }

  const unlock = ()=>{
    // Importante: não use await aqui; em alguns Chromes o "user activation" se perde com async/await.
    bgm.muted = false;
    bgm.volume = volume / 100;
    playNow();
  };
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("click", unlock, { once: true });

  if(btnEnableAudio){
    const enable = ()=>{
      enabled = true;
      localStorage.setItem("bgm_enabled", "1");
      refresh();
      // some versões do Chrome mostram o aviso e não fecham; fechamos imediatamente.
      hideGate();
      unlock();
    };
    btnEnableAudio.addEventListener("click", enable);
    // Também permite clicar no overlay todo
    if(audioGate) audioGate.addEventListener("click", (e)=>{ if(e.target === audioGate) enable(); });
  }


  btnMusicButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      modal.classList.remove("hidden");
      /* Clique no boto conta como gesto do usurio: desmuta aqui para garantir som no Chrome */
      bgm.muted = false;
      bgm.volume = volume / 100;
      playNow();
    });
  });

  btnClose.addEventListener("click", ()=>{
    modal.classList.add("hidden");
  });

  btnToggle.addEventListener("click", async ()=>{
    enabled = !enabled;
    localStorage.setItem("bgm_enabled", enabled ? "1" : "0");
    refresh();
    if(enabled){
      playNow();
    }else{
      bgm.pause();
      bgm.currentTime = 0;
    }
  });

  vol.addEventListener("input", ()=>{
    const v = Number(vol.value);
    const vv = Number.isFinite(v) ? v : 35;
    bgm.volume = Math.max(0, Math.min(1, vv/100));
    localStorage.setItem("bgm_volume", String(Math.max(0, Math.min(100, vv))));
  });

  if(btnFixMoney){
    btnFixMoney.addEventListener("click", ()=>{
      // Corrige save antigo sem apagar progresso: se money inválido/<=0, seta 100.
      if(typeof state.money !== "number" || isNaN(state.money) || state.money <= 0){
        state.money = 100;
        state.moneyInitialized = true;
        saveState();
        updateHud();
        toast("Moedas corrigidas: 100");
      }else{
        toast("Suas moedas já estão OK.");
      }
    });
  }

  // tenta tocar se já estiver liberado
  playNow();
}

function setSoilWet(isWet){
  // Desativado: efeito de terra úmida removido (evita sombra esverdeada no vaso)
  const soil = document.getElementById("soilWet");
  if(!soil) return;
  soil.classList.add("hidden");
  soil.classList.remove("active");
}


function updatePlantWaterStatusUI(){
  // Mantido para compatibilidade; o status principal está no balão de info da planta.
  return;
}
