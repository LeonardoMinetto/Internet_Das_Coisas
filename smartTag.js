"use strict";

const elements = {
  batteryValue: document.querySelector("#batteryValue"),
  batteryBar: document.querySelector("#batteryBar"),
  signalValue: document.querySelector("#signalValue"),
  signalQuality: document.querySelector("#signalQuality"),
  temperatureValue: document.querySelector("#temperatureValue"),
  messageValue: document.querySelector("#messageValue"),
  lastUpdate: document.querySelector("#lastUpdate"),
  refreshButton: document.querySelector("#refreshButton"),
  refreshLabel: document.querySelector("#refreshLabel"),
};

const missingElements = Object.entries(elements)
  .filter(([, element]) => !element)
  .map(([name]) => name);

if (missingElements.length > 0) {
  console.error("Não foi possível iniciar a telemetria. Elementos ausentes:", missingElements);
} else {
  // Valores locais de demonstração. Ainda não vêm do ESP32 nem de um broker MQTT.
  const telemetry = {
    battery: 87,
    signal: -62,
    temperature: 22.6,
    messages: 124,
  };

  const number = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function getSignalQuality(signal) {
    if (signal >= -67) return "Bom";
    if (signal >= -80) return "Regular";
    return "Fraco";
  }

  function renderTelemetry() {
    const battery = Math.round(telemetry.battery);
    const signal = Math.round(telemetry.signal);
    const updatedAt = new Date();

    elements.batteryValue.textContent = battery;
    elements.batteryBar.style.width = `${battery}%`;
    elements.batteryBar.parentElement.setAttribute("aria-valuenow", battery);
    elements.signalValue.textContent = String(signal).replace("-", "−");
    elements.signalQuality.textContent = getSignalQuality(telemetry.signal);
    elements.signalQuality.classList.toggle("warning", telemetry.signal < -67);
    elements.temperatureValue.textContent = number.format(telemetry.temperature);
    elements.messageValue.textContent = telemetry.messages;
    elements.lastUpdate.textContent = time.format(updatedAt);
    elements.lastUpdate.dateTime = updatedAt.toISOString();
  }

  function simulateReading() {
    telemetry.battery = clamp(telemetry.battery - Math.random() * 0.04, 0, 100);
    telemetry.signal = clamp(telemetry.signal + (Math.random() - 0.5) * 5, -95, -45);
    telemetry.temperature = clamp(telemetry.temperature + (Math.random() - 0.5) * 0.3, 18, 32);
    telemetry.messages += 1;
    renderTelemetry();
  }

  function refreshNow() {
    // A variação maior deixa claro que o clique foi registrado na demonstração.
    telemetry.signal = clamp(telemetry.signal + (Math.random() - 0.5) * 8, -95, -45);
    telemetry.temperature = clamp(telemetry.temperature + (Math.random() - 0.5) * 0.8, 18, 32);
    telemetry.messages += 1;

    elements.refreshButton.disabled = true;
    elements.refreshButton.classList.add("is-updating");
    elements.refreshLabel.textContent = "Leitura atualizada";
    renderTelemetry();

    window.setTimeout(() => {
      elements.refreshButton.disabled = false;
      elements.refreshButton.classList.remove("is-updating");
      elements.refreshLabel.textContent = "Atualizar leitura";
    }, 1000);
  }

  elements.refreshButton.addEventListener("click", refreshNow);
  window.setInterval(simulateReading, 5000);
  renderTelemetry();
}