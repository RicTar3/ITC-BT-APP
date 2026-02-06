document.addEventListener("DOMContentLoaded", function () {

  const Pinput = document.getElementById("potencia");
  const unidadP = document.getElementById("unidadPotencia");
  const Tinput = document.getElementById("tiempo");
  const unidadT = document.getElementById("unidadTiempo");
  const precioInput = document.getElementById("precio");

  const resultadoE = document.getElementById("resultadoEnergia");
  const resultadoC = document.getElementById("resultadoCoste");
  const explicacion = document.getElementById("explicacionEnergia");

  function calcular() {

    function convertirNumero(valor) {
  if (!valor) return 0;
  return parseFloat(valor.replace(",", ".")) || 0;
}

let P = convertirNumero(Pinput.value);
let t = convertirNumero(Tinput.value);
let precio = convertirNumero(precioInput.value);


    if (P === 0 || t === 0) {
      resultadoE.innerHTML = "0";
      resultadoC.innerHTML = "0";
      explicacion.innerHTML = "";
      return;
    }

    // 🔹 Convertir potencia a kW
    if (unidadP.value === "W") {
      P = P / 1000;
    }

    // 🔹 Convertir tiempo a horas
    if (unidadT.value === "min") {
      t = t / 60;
    }

    // 🔹 Energía base (diaria)
    let energiaDia = P * t; // kWh/día
    let energiaMes = energiaDia * 30;
    let energiaAnual = energiaDia * 365;

    function formatearEnergia(kWh) {

  let energiaWh = kWh * 1000; // siempre partimos de Wh

  if (energiaWh >= 1000) {
    return (energiaWh / 1000).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }) + " kWh";
  } else {
    return energiaWh.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }) + " Wh";
  }
}



    let costeDia = energiaDia * precio;
    let costeMes = energiaMes * precio;
    let costeAnual = energiaAnual * precio;

    resultadoE.innerHTML = `
  Día: ${formatearEnergia(energiaDia)}<br>
  Mes: ${formatearEnergia(energiaMes)}<br>
  Año: ${formatearEnergia(energiaAnual)}
`;



    resultadoC.innerHTML = precio > 0 ? `
      Día: ${costeDia.toFixed(2)} €<br>
      Mes: ${costeMes.toFixed(2)} €<br>
      Año: ${costeAnual.toFixed(2)} €
    ` : "0";

    // =========================
    // EXPLICACIÓN DETALLADA
    // =========================

    explicacion.innerHTML = `
      <p><strong>1️⃣ Conversión de unidades</strong></p>
      <ul class="list-disc ml-5">
        <li>Potencia convertida a kW = ${P.toFixed(3)} kW</li>
        <li>Tiempo convertido a horas = ${t.toFixed(3)} h/día</li>
      </ul>

      <br>

      <p><strong>2️⃣ Cálculo de energía diaria</strong></p>
      <p>Fórmula: E = P · t</p>
      <p>Sustitución: E = ${P.toFixed(3)} · ${t.toFixed(3)}</p>
      <p class="text-blue-600 font-semibold">
        Energía diaria = ${formatearEnergia(energiaDia)}


      </p>

      <br>

      <p><strong>3️⃣ Energía mensual</strong></p>
      <p>E_mes = E_día · 30</p>
      <p>${formatearEnergia(energiaDia)} · 30 = ${formatearEnergia(energiaMes)}

</p>

      <br>

      <p><strong>4️⃣ Energía anual</strong></p>
      <p>E_año = E_día · 365</p>
      <p>
  ${formatearEnergia(energiaDia)} · 365 =
${formatearEnergia(energiaAnual)}

</p>


      ${precio > 0 ? `
      <br>
      <p><strong>5️⃣ Cálculo del coste</strong></p>
      <p>Coste = Energía (en kWh) · Precio kWh</p>
      <ul class="list-disc ml-5">
        <li>Día: ${energiaDia.toFixed(3)} · ${precio} = ${costeDia.toFixed(2)} €</li>
        <li>Mes: ${energiaMes.toFixed(3)} · ${precio} = ${costeMes.toFixed(2)} €</li>
        <li>Año: ${energiaAnual.toFixed(3)} · ${precio} = ${costeAnual.toFixed(2)} €</li>
      </ul>
      ` : ""}
    `;
  }

  [Pinput, unidadP, Tinput, unidadT, precioInput]
    .forEach(el => el.addEventListener("input", calcular));

});
