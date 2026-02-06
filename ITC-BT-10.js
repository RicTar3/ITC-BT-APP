
//Pantalla 0 - Resumen

function numFromSpan(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const t = el.textContent.replace(/\./g, '').replace(',', '.');
  return parseFloat(t) || 0;
}

function updateResumen() {
  const pv  = numFromSpan('pv');
  const asc = numFromSpan('pAscTotal');
  const gp  = numFromSpan('pGpTotal');
  const al  = numFromSpan('pAlTotal');
  const lc  = numFromSpan('pLcTotal');
  const g   = numFromSpan('pGTotal');
  const ve  = numFromSpan('pVeTotal');

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
  };

  set('rPV', pv);
  set('rAsc', asc);
  set('rGP', gp);
  set('rAL', al);
  set('rLC', lc);
  set('rG', g);

  const total = pv + asc + gp + al + lc + g + ve;
  set('rTotal', total);
}

function recalcularPV() {

  const Nb = parseFloat(document.getElementById("vb").textContent) || 0;
  const Ne = parseFloat(document.getElementById("ve").textContent) || 0;
  const ks = parseFloat(document.getElementById("ks").textContent.replace(',', '.')) || 0;

  const potB = parseFloat(document.getElementById("potBasica").value);
  const potE = parseFloat(document.getElementById("potElevada").value);

  const n = Nb + Ne;

  document.getElementById("nViv").textContent = n;
  document.getElementById("nViv2").textContent = n;

  if (n === 0) {
    document.getElementById("pMedia").textContent = "0";
    document.getElementById("pv").textContent = "0";
    updateResumen();
    return;
  }

  const pMedia = ((Nb * potB) + (Ne * potE)) / n;
  const Pv = pMedia * ks;

  document.getElementById("pMedia").textContent =
    pMedia.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  document.getElementById("pv").textContent =
    Pv.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  updateResumen();
}
// Escuchar cambios en los select de potencia
document.addEventListener("change", function(e){
  if (
    e.target.id === "potBasica" ||
    e.target.id === "potElevada"
  ) {
    recalcularPV();
  }
});






// Inicializar editores inline
document.querySelectorAll('.editable').forEach(el => {
  el.addEventListener('click', () => openEditor(el));
});

function openEditor(span) {
  if (span.querySelector('input')) return;

  const original = span.textContent.trim();
  const input = document.createElement('input');

  input.type = 'number';
  input.value = original === '' ? 0 : original;

  input.className =
    'absolute inset-0 w-full h-full text-xs font-mono text-center bg-transparent outline-none';

  span.textContent = '';
  span.appendChild(input);

  input.focus();
  input.select();

  function commit() {
    const v = input.value === '' ? '0' : input.value;
    span.textContent = v;
    calcPV();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') span.textContent = original;
  });
}

// Cálculo de Pᵥ
function calcPV() {
  const nb = parseFloat(document.getElementById('vb').textContent) || 0;
  const ne = parseFloat(document.getElementById('ve').textContent) || 0;
  const ks = parseFloat(document.getElementById('ks').textContent) || 0;

  const n = nb + ne;
  document.getElementById('nViv').textContent = n;
  document.getElementById('nViv2').textContent = n;

  if (n === 0) {
    document.getElementById('pv').textContent = '0';
    return;
  }

  const pv = ((nb * 5750 + ne * 9200) / n) * ks;
  document.getElementById('pv').textContent = Math.round(pv);

  updateResumen();
}

calcPV();


function calcPV() {
  const nb = parseFloat(document.getElementById('vb').textContent) || 0;
  const ne = parseFloat(document.getElementById('ve').textContent) || 0;
  const ks = parseFloat(document.getElementById('ks').textContent) || 1;

  const n = nb + ne;

  document.getElementById('nViv').textContent = n;
  document.getElementById('nViv2').textContent = n;

  let media = 0;
  if (n > 0) {
    media = (nb * 5750 + ne * 9200) / n;
  }

  document.getElementById('pMedia').textContent = Math.round(media);

  const pv = media * ks;
  document.getElementById('pv').textContent = Math.round(pv);

  updateResumen();
}


//bloque






//Bloque ascensores


document.addEventListener('DOMContentLoaded', () => {

  const ascTable = document.getElementById('ascTable');
  const addAscBtn = document.getElementById('addAsc');

  const ascSumEl = document.getElementById('ascSum');
  const ascMaxEl = document.getElementById('ascMax');
  const ascMax2El = document.getElementById('ascMax2');
  const ascBaseEl = document.getElementById('ascBase');
  const pAscTotalEl = document.getElementById('pAscTotal');

  function recalcAsc() {
    const inputs = [...document.querySelectorAll('.asc-input')];
    const values = inputs.map(i => parseFloat(i.value) || 0);

    const sum = values.reduce((a, b) => a + b, 0);
    const max = values.length ? Math.max(...values) : 0;

    const base = sum - max;
    const totalKW = base + max * 1.3;
    const totalW = Math.round(totalKW * 1000);

    ascSumEl.textContent = sum.toFixed(2);
    ascMaxEl.textContent = max.toFixed(2);
    ascMax2El.textContent = max.toFixed(2);
    ascBaseEl.textContent = base.toFixed(2);
    pAscTotalEl.textContent = totalW.toLocaleString('es-ES');
  }

  document.addEventListener('input', e => {
    if (e.target.classList.contains('asc-input')) {
      recalcAsc();
    }
    updateResumen();
  });

  addAscBtn.addEventListener('click', () => {
    const n = ascTable.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-2">${n}</td>
      <td class="border p-2">
        <input type="number" step="0.1"
               class="w-full text-center border rounded p-1 asc-input"
               placeholder="0">
      </td>
      <td class="border p-2">kW</td>
    `;
    ascTable.appendChild(tr);
  });
  updateResumen();
});



// Grupo de presión
let contadorGP = 1;

function agregarGrupo() {

  contadorGP++;

  const lista = document.getElementById("gpList");

  const fila = document.createElement("div");
  fila.className = "flex items-center gap-3";

  fila.innerHTML = `
    <span class="w-10 text-center">${contadorGP}</span>

    <input type="number" step="0.1"
           class="gpPower flex-1 border rounded p-2 text-center"
           placeholder="0">

    <select class="gpUnit border rounded p-2">
      <option value="w">W</option>
      <option value="cv">CV</option>
    </select>
  `;

  lista.appendChild(fila);

  recalcularGP();
}
// -------------------------------
// Cálculo automático
// -------------------------------
function recalcularGP() {

  const powers = document.querySelectorAll(".gpPower");
  const units = document.querySelectorAll(".gpUnit");

  let valores = [];

  powers.forEach((input, i) => {

    let valor = parseFloat(input.value);

    if (isNaN(valor)) valor = 0;

    if (units[i].value === "cv") {
      valor *= 736;
    }

    valores.push(valor);
  });

  if (valores.length === 0) return;

  const suma = valores.reduce((a, b) => a + b, 0);
  const mayor = Math.max(...valores);

  const resultado = suma + (mayor * 0.25);

  document.getElementById("gpSuma").innerText = suma.toFixed(2);
  document.getElementById("gpMayor").innerText = mayor.toFixed(2);
  document.getElementById("gpResultado").innerText = resultado.toFixed(2);
}
// -------------------------------
// 🔥 ESCUCHA GLOBAL AUTOMÁTICA
// -------------------------------
document.addEventListener("input", function(e) {

  if (
    e.target.classList.contains("gpPower") ||
    e.target.classList.contains("gpUnit")
  ) {
    recalcularGP();
  }

});


//ALUMBRADO

function calcAL() {
  const area = parseFloat(document.getElementById('alArea').value) || 0;
  const coef = parseFloat(document.getElementById('alCoef').value) || 0;
  const type = document.getElementById('alType').value;

  const k = type === 'descarga' ? 1.8 : 1;
  const result = area * coef * k;

  document.getElementById('alExtra').classList.toggle('hidden', k === 1);
  document.getElementById('pAlTotal').textContent = Math.round(result);

updateResumen();
}

document.getElementById('alArea')?.addEventListener('input', calcAL);
document.getElementById('alCoef')?.addEventListener('input', calcAL);
document.getElementById('alType')?.addEventListener('change', calcAL);



//Locales comerciales


// ===== Locales comerciales y oficinas (P_LC) =====

function recalcLC() {
  const rows = document.querySelectorAll('#lcTable tr');
  let total = 0;

  rows.forEach(row => {
    const areaEl = row.querySelector('.lc-area');
    const coefEl = row.querySelector('.lc-coef');
    const out = row.querySelector('.lc-out');

    const area = parseFloat(areaEl?.value) || 0;
    const coef = parseFloat(coefEl?.value) || 0;

    const raw = area * coef;   // potencia calculada real
    let applied = raw;         // potencia que se aplicará

    if (raw > 0 && raw < 3450) {
      applied = 3450;

      out.innerHTML = `
        <span class="text-gray-400 line-through mr-1">
          ${Math.round(raw)} W
        </span>
        <span class="font-semibold text-amber-700">
          ${applied} W
        </span>
      `;
      out.title = 'Aplicado mínimo reglamentario (3.450 W)';
    } else if (raw > 0) {
      out.textContent = `${Math.round(raw)} W`;
      out.removeAttribute('title');
    } else {
      out.textContent = '0';
      out.removeAttribute('title');
    }

    total += applied > 0 ? applied : 0;
  });

  const totalEl = document.getElementById('pLcTotal');
  if (totalEl) totalEl.textContent = Math.round(total);

  updateResumen();
}

// Recalcular cuando se edita cualquier campo
document.addEventListener('input', e => {
  if (e.target.classList.contains('lc-area') ||
      e.target.classList.contains('lc-coef')) {
    recalcLC();
  }
  updateResumen();
});

// Añadir nuevo local
document.getElementById('addLc')?.addEventListener('click', () => {
  const table = document.getElementById('lcTable');
  const n = table.children.length + 1;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="border p-2">${n}</td>
    <td class="border p-2">
      <input type="number"
             class="w-full text-center border rounded p-1 lc-area"
             placeholder="0">
    </td>
    <td class="border p-2">
      <input type="number"
             class="w-full text-center border rounded p-1 lc-coef"
             placeholder="0">
    </td>
    <td class="border p-2">
      <span class="lc-out">0</span>
    </td>
  `;

  table.appendChild(tr);
  updateResumen();
});






//Garaje




// Garaje
// Garaje
const gTable = document.getElementById('gTable');
const addGBtn = document.getElementById('addG');
const gType = document.getElementById('gType');

const gSumEl = document.getElementById('gSum');
const gBaseEl = document.getElementById('gBase');
const gMinEl = document.getElementById('gMin');
const pGTotalEl = document.getElementById('pGTotal');

function calcG() {
  const inputs = [...document.querySelectorAll('.g-input')];
  const areas = inputs.map(i => parseFloat(i.value) || 0);

  const sum = areas.reduce((a, b) => a + b, 0);

  let k, min;
  if (gType.value === 'natural') {
    k = 10;
    min = 3450;
  } else {
    k = 20;
    min = 3450;
  }

  const base = sum * k;
  const result = Math.max(base, min);

  gSumEl.textContent = sum.toFixed(1);
  gBaseEl.textContent = Math.round(base);
  gMinEl.textContent = min.toLocaleString('es-ES');
  pGTotalEl.textContent = Math.round(result).toLocaleString('es-ES');
}

document.addEventListener('input', e => {
  if (e.target.classList.contains('g-input')) {
    calcG();
  }
});

gType?.addEventListener('change', calcG);

addGBtn?.addEventListener('click', () => {
  const n = gTable.children.length + 1;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="border p-2">${n}</td>
    <td class="border p-2">
      <input type="number"
             class="w-full text-center border rounded p-1 g-input"
             placeholder="0">
    </td>
  `;
  gTable.appendChild(tr);

  updateResumen();
});




//Veiculos electricos

function calcVE() {
  const plazas = parseFloat(document.getElementById('vePlazas')?.value) || 0;
  const mode = document.getElementById('veMode')?.value || 'sin';

  const FS = mode === 'con' ? 0.3 : 1;

  const base = 0.10 * plazas * 3680;   // W
  const total = base * FS;

  const fsEl = document.getElementById('veFs');
  const baseEl = document.getElementById('veBase');
  const totalEl = document.getElementById('pVeTotal');

  if (fsEl) fsEl.textContent = FS.toString().replace('.', ',');
  if (baseEl) baseEl.textContent = base.toLocaleString('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

if (totalEl) totalEl.textContent = total.toLocaleString('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
}

// Reaccionar a cambios en inputs
document.addEventListener('input', e => {
  if (e.target.id === 'vePlazas') {
    calcVE();
  }
});

// Reaccionar específicamente al cambio del select
document.getElementById('veMode')?.addEventListener('change', calcVE);

// Cálculo inicial

updateResumen(); 

calcVE();



