document.addEventListener("DOMContentLoaded", function () {

  // ===============================
  // ELEMENTOS
  // ===============================
  const Pinput = document.getElementById("intP");
  const Iinput = document.getElementById("intI");
  const Uinput = document.getElementById("intU");
  const sistema = document.getElementById("sistema");
  const tipoCarga = document.getElementById("tipoCarga");
  const cosInput = document.getElementById("cosphi");
  const etaInput = document.getElementById("rendimiento");
  const resultado = document.getElementById("resultadoI");
  const explicacion = document.getElementById("explicacionI");
  const modoCalculo = document.getElementById("modoCalculo");
  const formulaMostrada = document.getElementById("formulaMostrada");

  const campoCos = document.getElementById("campoCos");
  const campoRend = document.getElementById("campoRend");
  const bandeja = document.getElementById("bandejaCos");

  // ===============================
  // VISUAL: Mostrar/Ocultar campos
  // ===============================
  function actualizarCampos() {
    if (tipoCarga.value === "resistiva") {
      campoCos.classList.add("hidden");
      campoRend.classList.add("hidden");
    } else {
      campoCos.classList.remove("hidden");
      campoRend.classList.remove("hidden");
    }
  }

  // ===============================
  // VISUAL: Fórmula mostrada arriba
  // ===============================
  function actualizarFormulaVisual() {

    if (modoCalculo.value === "intensidad") {

      if (sistema.value === "mono") {
        formulaMostrada.innerHTML =
          "Monofásico: I = P / (U · cosφ · η)";
      } else {
        formulaMostrada.innerHTML =
          "Trifásico: I = P / (√3 · U · cosφ · η)";
      }

    } else {

      if (sistema.value === "mono") {
        formulaMostrada.innerHTML =
          "Monofásico: P = U · I · cosφ · η";
      } else {
        formulaMostrada.innerHTML =
          "Trifásico: P = √3 · U · I · cosφ · η";
      }
    }
  }

  // ===============================
  // CÁLCULO
  // ===============================
  function calcular() {

    let P = parseFloat(Pinput.value) || 0;
    let I = parseFloat(Iinput.value) || 0;
    let U = parseFloat(Uinput.value) || 0;

    if (!U) {
      resultado.innerText = "0";
      explicacion.innerHTML = "";
      return;
    }

    let cosphi = 1;
    let eta = 1;

    if (tipoCarga.value !== "resistiva") {
      cosphi = parseFloat(cosInput.value) || 0.9;
      eta = parseFloat(etaInput.value) || 0.9;
    }

    let resultadoFinal = 0;
    let formulaTexto = "";
    let sustitucionTexto = "";

    if (modoCalculo.value === "intensidad") {

      if (!P) return;

      if (sistema.value === "mono") {
        resultadoFinal = P / (U * cosphi * eta);
        formulaTexto = "I = P / (U · cosφ · η)";
        sustitucionTexto = `I = ${P} / (${U} · ${cosphi} · ${eta})`;
      } else {
        resultadoFinal = P / (Math.sqrt(3) * U * cosphi * eta);
        formulaTexto = "I = P / (√3 · U · cosφ · η)";
        sustitucionTexto = `I = ${P} / (1.732 · ${U} · ${cosphi} · ${eta})`;
      }

      resultado.innerText = resultadoFinal.toFixed(2);

    } else {

      if (I === 0) {
  resultado.innerText = "0";
  explicacion.innerHTML = "";
  return;
}


      if (sistema.value === "mono") {
        resultadoFinal = U * I * cosphi * eta;
        formulaTexto = "P = U · I · cosφ · η";
        sustitucionTexto = `P = ${U} · ${I} · ${cosphi} · ${eta}`;
      } else {
        resultadoFinal = Math.sqrt(3) * U * I * cosphi * eta;
        formulaTexto = "P = √3 · U · I · cosφ · η";
        sustitucionTexto = `P = 1.732 · ${U} · ${I} · ${cosphi} · ${eta}`;
      }

      resultado.innerText = resultadoFinal.toFixed(2);
    }

    explicacion.innerHTML = `
      <hr class="my-3">
      <p><strong>Fórmula aplicada:</strong></p>
      <p>${formulaTexto}</p>
      <br>
      <p><strong>Sustitución:</strong></p>
      <p>${sustitucionTexto}</p>
      <br>
      <p class="text-blue-600 font-bold text-lg">
        Resultado = ${resultadoFinal.toFixed(2)} ${modoCalculo.value === "intensidad" ? "A" : "W"}
      </p>
    `;
  }

  // ===============================
  // BANDEJA cosφ
  // ===============================
  cosInput.addEventListener("focus", () => {
    bandeja.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!campoCos.contains(e.target)) {
      bandeja.classList.add("hidden");
    }
  });

  document.querySelectorAll(".opcionCos").forEach(btn => {
    btn.addEventListener("click", () => {
      cosInput.value = btn.dataset.value;
      bandeja.classList.add("hidden");
      calcular();
    });
  });

  // ===============================
  // EVENTOS
  // ===============================
  [
    Pinput,
    Iinput,
    Uinput,
    sistema,
    tipoCarga,
    cosInput,
    etaInput,
    modoCalculo
  ].forEach(el => el.addEventListener("input", () => {
    actualizarFormulaVisual();
    calcular();
  }));

  tipoCarga.addEventListener("change", actualizarCampos);

  // Inicialización
  actualizarCampos();
  actualizarFormulaVisual();
});
