// ===============================
// LIMPIAR INPUTS AL HACER CLICK
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".input-clear").forEach(input => {
    input.addEventListener("focus", function () {
      if (this.value === "0") this.value = "";
    });
  });
});


// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
function iniciarCalculo() {

  const datos = {
    L: parseFloat(document.getElementById("len").value) || 0,
    P: parseFloat(document.getElementById("pow").value) || 0,
    U: parseFloat(document.getElementById("volt").value) || 0,
    S: parseFloat(document.getElementById("sec").value) || 0,
    caida: parseFloat(document.getElementById("caida").value) || 0,
    temp: parseFloat(document.getElementById("temp").value) || 0,
    tipoCaida: document.getElementById("tipoCaida").value,
    material: document.getElementById("mat").value,
    sistema: document.getElementById("sistema").value,
    metodo: document.getElementById("metodoInstalacion")?.value || "B",
agrupamiento: parseInt(document.getElementById("agrupamiento")?.value) || 1,
simultaneidad: parseFloat(document.getElementById("simultaneidad")?.value) || 1,
servicio: document.getElementById("servicio")?.value || "normal",



    buscar: document.getElementById("buscar").value,

    gammaInput: parseFloat(document.getElementById("gamma").value) || null,
    rhoInput: parseFloat(document.getElementById("rho").value) || null,
    alphaInput: parseFloat(document.getElementById("alpha").value) || null,

  };

  if (!datos.buscar) {
    alert("Selecciona qué deseas calcular.");
    return;
  }

  calcular(datos);

  // Desplazar a la segunda pantalla
  document.getElementById("pantallaResultado").scrollIntoView({
  behavior: "smooth"
});


}



// ===============================
// FUNCIÓN TABLA γ
// ===============================
function obtenerGamma(material, temperatura) {

  if (material === "cobre") {
    if (temperatura >= 90) return 44;
    if (temperatura >= 70) return 48;
    if (temperatura >= 40) return 52;
    return 56;
  }

  if (material === "aluminio") {
    if (temperatura >= 90) return 28;
    if (temperatura >= 70) return 30;
    if (temperatura >= 40) return 32;
    return 35;
  }
}





// ===============================
// MOTOR DE CÁLCULO
// ===============================
function calcular(datos) {

  const titulo = document.getElementById("titulo");
  const contenedor = document.getElementById("explicacion");

  contenedor.innerHTML = "";

  // Conductividad
let gamma;
let explicacionConversion = "";
let explicacionCalculo = "";


// 1️⃣ Conductividad directa
if (datos.gammaInput) {
  gamma = datos.gammaInput;
  explicacionConversion += `
  <p><strong>Conductividad introducida:</strong></p>
  <p>El usuario ha proporcionado γ = ${gamma}.</p>
  <p>Se utiliza directamente en el cálculo sin transformación.</p>
  `;
}

// 2️⃣ Resistividad
else if (datos.rhoInput) {

  gamma = 1 / datos.rhoInput;

  explicacionConversion += `
  <p><strong>Conversión de resistividad a conductividad:</strong></p>
  <p>Fórmula: γ = 1 / ρ</p>
  <p>Sustitución: γ = 1 / ${datos.rhoInput}</p>
  <p>Resultado: γ = ${gamma.toFixed(4)}</p>
  `;
}

// 3️⃣ Coeficiente α
else if (datos.alphaInput && datos.temp > 0) {

  let rho20 = datos.material === "cobre" ? 0.0178 : 0.028;
  let rhoT = rho20 * (1 + datos.alphaInput * (datos.temp - 20));
  gamma = 1 / rhoT;

  explicacionConversion += `
  <p><strong>Cálculo de resistividad corregida por temperatura:</strong></p>
  <p>Fórmula: ρ(T) = ρ₀ · (1 + α · (T − 20))</p>
  <p>Sustitución: ρ(T) = ${rho20} · (1 + ${datos.alphaInput} · (${datos.temp} − 20))</p>
  <p>Resultado: ρ(T) = ${rhoT.toFixed(6)}</p>

  <p><strong>Conversión a conductividad:</strong></p>
  <p>γ = 1 / ρ(T)</p>
  <p>γ = ${gamma.toFixed(4)}</p>
  `;
}


// 4️⃣ Tabla automática
else {

  gamma = obtenerGamma(datos.material, datos.temp);

  explicacionConversion += `
  <p><strong>Conductividad tomada de tabla:</strong></p>
  <p>Para ${datos.material} a ${datos.temp}°C → γ = ${gamma}</p>
  `;
}



  // Convertir % a voltios
 if (datos.tipoCaida === "porcentaje" && datos.caida > 0 && datos.U > 0) {

  let caidaVoltios = (datos.caida / 100) * datos.U;

  explicacionConversion += `
  <p><strong>Conversión de caída porcentual a voltios:</strong></p>
  <p>Fórmula: ΔV = (% / 100) · U</p>
  <p>Sustitución: ΔV = (${datos.caida} / 100) · ${datos.U}</p>
  <p>Resultado: ΔV = ${caidaVoltios.toFixed(2)} V</p>
  `;

  datos.caida = caidaVoltios;
}

 // Intensidad automática
let Ibase = 0;

if (datos.P > 0 && datos.U > 0) {
  if (datos.sistema === "mono") {
    Ibase = datos.P / datos.U;
  } else {
    Ibase = datos.P / (Math.sqrt(3) * datos.U);
  }
}

let I = Ibase;

// Aplicar simultaneidad
I *= datos.simultaneidad;

// Servicio continuo (125%)
if (datos.servicio === "continuo") {
  I *= 1.25;
}




  // ============================
// ============================
// CAÍDA DE TENSIÓN
// ============================
if (datos.buscar === "caida") {

  titulo.innerText = "Cálculo de caída de tensión (ΔV)";

  if (datos.L > 0 && datos.S > 0 && datos.P > 0 && datos.U > 0) {

    let factor = datos.sistema === "mono" ? 2 : Math.sqrt(3);

    let deltaV = (factor * datos.L * datos.P) /
                 (gamma * datos.S * datos.U);

    explicacionCalculo += `
      <hr class="my-4">

      <p><strong>Fórmula general:</strong></p>
      <p>ΔV = (k · L · P) / (γ · S · U)</p>

      <p>donde:</p>
      <ul class="list-disc ml-5">
        <li>k = ${factor.toFixed(3)}</li>
        <li>L = ${datos.L} m</li>
        <li>P = ${datos.P} W</li>
        <li>γ = ${gamma.toFixed(4)}</li>
        <li>S = ${datos.S} mm²</li>
        <li>U = ${datos.U} V</li>
      </ul>

      <p><strong>Sustitución numérica:</strong></p>
      <p>ΔV = (${factor.toFixed(3)} · ${datos.L} · ${datos.P}) 
      / (${gamma.toFixed(4)} · ${datos.S} · ${datos.U})</p>

      <p><strong>Resultado:</strong></p>
      <p class="text-lg font-bold text-blue-600">
        ΔV = ${deltaV.toFixed(2)} V
      </p>
    `;

  } else {
    explicacionCalculo += `
      <p class="text-red-500">
        Faltan datos para calcular la caída de tensión.
      </p>
    `;
  }
}



// ============================
// SECCIÓN (Método exacto libro)
// ============================
// ============================

// ============================
if (datos.buscar === "seccion") {

  titulo.innerText = "Cálculo de sección (S)";

if (datos.P > 0 && datos.U > 0) {

    // ==============================
    // 1️⃣ Conductividad final
    // ==============================

    let gammaFinal = 0;
    let origenGamma = "";

    if (datos.gammaInput && datos.gammaInput > 0) {
      gammaFinal = datos.gammaInput;
      origenGamma = "Conductividad introducida manualmente";
    } else if (gamma && gamma > 0) {
      gammaFinal = gamma;
      origenGamma = `Conductividad tomada de tabla para ${datos.material} a ${datos.temp}°C`;
    } else {
      explicacionCalculo += `
        <p class="text-red-500 font-semibold">
          No se dispone de conductividad suficiente para calcular la sección.
        </p>
      `;
      return;
    }

    // ==============================
    // 2️⃣ Factor del sistema
    // ==============================

    let factor = datos.sistema === "mono" ? 2 : 1;

    // ==============================
    // 3️⃣ Tensión final
    // ==============================

    let U2 = datos.caida > 0 ? datos.U - datos.caida : datos.U;
    


    if (U2 <= 0) {
      explicacionCalculo += `
        <p class="text-red-500 font-semibold">
          La tensión final resulta negativa o nula. Revise la caída de tensión.
        </p>
      `;
      return;
    }

    // ==============================
    // 4️⃣ Fórmula exacta libro
    // ==============================

    // ==============================
// 4️⃣ Cálculo de sección
// ==============================

let usarMetodoCaida = datos.L > 0 && datos.caida > 0;

let S = 0;
let Scomercial = 0;

if (usarMetodoCaida) {

  S = (factor * datos.L * datos.P) /
      (gammaFinal * datos.caida * U2);

  Scomercial = obtenerSeccionComercial(S);

} else {

  S = 0;
  Scomercial = 0;

  explicacionCalculo += `
    <p class="text-yellow-600 font-semibold">
      No se ha definido caída de tensión.
      La sección se calculará únicamente por criterio de intensidad.
    </p>
  `;


}


    explicacionCalculo += `
  <hr class="my-4">

  <p><strong>Conductividad utilizada:</strong></p>
  <p>${origenGamma}</p>
  <p>γ = ${gammaFinal}</p>
`;



    // ============================
// COMPROBACIÓN POR INTENSIDAD
// ============================

// Intensidad de diseño
let Ib = I;

// Sección mínima por intensidad
// Factores de corrección
let Fm = factoresMetodo[datos.metodo] || 1;

let Fa = obtenerFactorAgrupamiento(datos.agrupamiento || 1);

// Intensidad corregida
let Ib_corregida = Ib / (Fm * Fa);

// Sección mínima corregida
let S_intensidad = obtenerSeccionPorIntensidad(Ib_corregida);


// Sección definitiva (la mayor)
let S_final = usarMetodoCaida
  ? Math.max(Scomercial, S_intensidad)
  : S_intensidad;


// Motivo limitante
let mensaje = "";

if (!usarMetodoCaida) {
  mensaje = "Sección determinada únicamente por intensidad admisible";
} else if (Scomercial > S_intensidad) {
  mensaje = "Limitada por caída de tensión";
} else if (S_intensidad > Scomercial) {
  mensaje = "Limitada por intensidad admisible";
} else {
  mensaje = "Cumple por ambos criterios";
}







explicacionCalculo += `
<hr class="my-2">
<div class="space-y-1 text-sm">

  ${usarMetodoCaida ? `
  <!-- BLOQUE 1 -->
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="font-semibold text-sm mb-2">1️⃣ Cálculo por caída de tensión</h3>

    <p class="mb-2"><strong>Tensión final:</strong></p>
    <p>U₂ = U₁ − ΔV</p>
    <p>U₂ = ${datos.U} − ${datos.caida.toFixed(2)} = 
       <strong>${U2.toFixed(2)} V</strong></p>

    <div class="text-xs font-mono bg-white px-2 py-1 ">
      <p><strong>Fórmula utilizada:</strong></p>
      <p>S = (k · L · P) / (γ · ΔV · U₂)</p>
    </div>

    <div class="text-xs font-mono text-gray-700">
      <p><strong>Valores:</strong></p>
      <ul class="list-disc ml-5">
        <li>k = ${factor.toFixed(3)}</li>
        <li>L = ${datos.L} m</li>
        <li>P = ${datos.P} W</li>
        <li>γ = ${gamma.toFixed(4)}</li>
        <li>ΔV = ${datos.caida.toFixed(2)} V</li>
        <li>U₂ = ${U2.toFixed(2)} V</li>
      </ul>
    </div>

    <div class="pt-1">
      <span class="font-semibold">Resultado calculado:</span>
      <span class="text-base font-bold text-blue-600">
        S = ${S.toFixed(2)} mm²
      </span>
    </div>
  </div>
   ` : ``}


  <!-- BLOQUE 2 -->
  <div class="bg-green-50 p-4 rounded-lg">
    <h3 class="font-semibold text-sm mb-2">2️⃣ Sección normalizada</h3>

    <p>Se adopta la sección comercial inmediata superior:</p>

    <p class="text-xl font-bold text-green-600 mt-2">
      S comercial = ${Scomercial} mm²
    </p>
  </div>


  <!-- BLOQUE 3 -->
 <!-- BLOQUE 3 -->
<div class="bg-yellow-50 p-4 rounded-lg">
  <h3 class="font-semibold text-sm mb-2">
    3️⃣ Verificación por intensidad admisible
  </h3>

  <div class="mt-2">
    <p><strong>Intensidad base:</strong></p>
    <p>I = ${Ibase.toFixed(2)} A</p>
  </div>

  ${ (datos.simultaneidad !== 1 || datos.servicio === "continuo") ? `
  
  <div class="mt-3">
    <p><strong>Factores aplicados:</strong></p>
    <ul class="list-disc ml-5">
      <li>Simultaneidad = ${datos.simultaneidad}</li>
      <li>Servicio = ${datos.servicio === "continuo" ? "Continuo (×1.25)" : "Normal"}</li>
    </ul>
  </div>

  <div class="mt-2">
    <p><strong>Intensidad corregida:</strong></p>
    <p class="font-semibold">${Ib.toFixed(2)} A</p>
  </div>

  ` : `
  
  <div class="mt-2">
    <p><strong>Intensidad de cálculo:</strong></p>
    <p class="font-semibold">${Ib.toFixed(2)} A</p>
  </div>

  ` }

  <div class="mt-3">
    <p><strong>Factores de corrección instalación:</strong></p>
    <ul class="list-disc ml-5">
      <li>Fm = ${Fm}</li>
      <li>Fa = ${Fa}</li>
    </ul>
  </div>

  <div class="mt-2">
    <p><strong>Intensidad tras corrección térmica:</strong></p>
    <p class="font-semibold">${Ib_corregida.toFixed(2)} A</p>
  </div>

  <div class="mt-3">
    <p>Sección mínima por intensidad:</p>
    <p><strong>${S_intensidad} mm²</strong></p>
  </div>
</div>








  <!-- BLOQUE FINAL -->
  <div class="bg-purple-50 p-4 rounded-lg text-center">
    <h3 class="font-semibold text-sm mb-2">4️⃣ Sección definitiva</h3>

    <p class="text-2xl font-bold text-purple-600">
      ${S_final} mm²
    </p>

    <p class="mt-2 font-semibold text-blue-600">
      ${mensaje}
    </p>
  </div>

</div>
`;



  
  }
}






      
  // ============================
  // TENSIÓN FINAL
  // ============================
  if (datos.buscar === "ufinal") {

    titulo.innerText = "Tensión final (U₂)";

    if (datos.U > 0 && datos.caida > 0) {

      let U2 = datos.U - datos.caida;

      contenedor.innerHTML = `
        <p><strong>Fórmula:</strong></p>
        <p>U₂ = U₁ - ΔV</p>

        <p class="text-lg font-bold text-blue-600">
          U₂ = ${U2.toFixed(2)} V
        </p>
      `;
    } else {
      contenedor.innerHTML = "Faltan datos para calcular la tensión final.";
    }
  }

  // ============================
  // TENSIÓN INICIAL
  // ============================
  if (datos.buscar === "uinicio") {

    titulo.innerText = "Tensión inicial (U₁)";

    if (datos.U > 0 && datos.caida > 0) {

      let U1 = datos.U + datos.caida;

      contenedor.innerHTML = `
        <p><strong>Fórmula:</strong></p>
        <p>U₁ = U₂ + ΔV</p>

        <p class="text-lg font-bold text-blue-600">
          U₁ = ${U1.toFixed(2)} V
        </p>
      `;
    } else {
      contenedor.innerHTML = "Faltan datos para calcular la tensión inicial.";
    }
  }
contenedor.innerHTML = explicacionConversion + explicacionCalculo;

}

 // ============================
  // Resultado Sección Comercial
  // ============================
function obtenerSeccionComercial(S_calculada) {

  const seccionesNormalizadas = [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50,
    70, 95, 120, 150, 185, 240, 300
  ];

  for (let s of seccionesNormalizadas) {
    if (s >= S_calculada) {
      return s;
    }
  }

  return seccionesNormalizadas[seccionesNormalizadas.length - 1];
}





// ============================
// TABLA INTENSIDAD ADMISIBLE
// ============================
const tablaIz = [
  { seccion: 1.5, iz: 15 },
  { seccion: 2.5, iz: 21 },
  { seccion: 4, iz: 28 },
  { seccion: 6, iz: 36 },
  { seccion: 10, iz: 50 },
  { seccion: 16, iz: 68 },
  { seccion: 25, iz: 89 },
  { seccion: 35, iz: 110 },
  { seccion: 50, iz: 140 },
  { seccion: 70, iz: 175 },
  { seccion: 95, iz: 215 },
  { seccion: 120, iz: 250 }
];

function obtenerSeccionPorIntensidad(Ib) {
  for (let cable of tablaIz) {
    if (Ib <= cable.iz) {
      return cable.seccion;
    }
  }
  return tablaIz[tablaIz.length - 1].seccion;
}


// ============================
// FACTORES DE CORRECCIÓN
// ============================

const factoresMetodo = {
  A: 0.9,
  B: 1,
  C: 1.15
};

function obtenerFactorAgrupamiento(n) {
  if (n <= 1) return 1;
  if (n === 2) return 0.8;
  if (n === 3) return 0.7;
  if (n <= 6) return 0.65;
  return 0.6;
}


// cajon parametros avanzados - conductividade y coeficiente
function toggleAvanzado() {
  const bloque = document.getElementById("bloqueAvanzado");
  bloque.classList.toggle("hidden");
}

function toggleIntensidad() {
  const bloque = document.getElementById("bloqueIntensidad");
  bloque.classList.toggle("hidden");
}
