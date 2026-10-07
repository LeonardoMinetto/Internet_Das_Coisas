"use strict";

const elements = {
  batteryValue: document.querySelector("#batteryValue"),
  batteryBar: document.querySelector("#batteryBar"),
  batteryProgress: document.querySelector("#batteryProgress"),
  signalValue: document.querySelector("#signalValue"),
  signalQuality: document.querySelector("#signalQuality"),
  temperatureValue: document.querySelector("#temperatureValue"),
  temperatureQuality: document.querySelector("#temperatureQuality"),
  messageValue: document.querySelector("#messageValue"),
  lastUpdate: document.querySelector("#lastUpdate"),
  refreshButton: document.querySelector("#refreshButton"),
  refreshLabel: document.querySelector("#refreshLabel"),
  impactValue: document.querySelector("#impactValue"),
  impactQuality: document.querySelector("#impactQuality"),
  accelerationValue: document.querySelector("#accelerationValue"),
  orientationValue: document.querySelector("#orientationValue"),
  orientationQuality: document.querySelector("#orientationQuality"),
  angularVelocityValue: document.querySelector("#angularVelocityValue"),
  occurrenceCount: document.querySelector("#occurrenceCount"),
  occurrenceList: document.querySelector("#occurrenceList"),
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
    impact: 0.4,
    acceleration: 1,
    orientation: 4.2,
    angularVelocity: 1.8,
    messages: 124,
  };

  const parameters = {
    batteryMinimum: 20,
    signalMinimum: -80,
    temperatureMinimum: 18,
    temperatureMaximum: 28,
    impactMaximum: 3,
    orientationMaximum: 30,
  };

  const now = Date.now();
  const occurrences = [
    {
      id: 5,
      type: "impact",
      title: "Impacto acima do limite",
      description: "O acelerômetro registrou uma aceleração acima da faixa permitida.",
      source: "Acelerômetro",
      evidence: "Aceleração resultante de 5,4 g",
      value: "5,8 g",
      limit: "máximo de 3 g",
      occurredAt: new Date(now - 4 * 60 * 1000),
    },
    {
      id: 4,
      type: "temperature",
      title: "Temperatura acima do limite",
      description: "A carga permaneceu acima da faixa recomendada.",
      source: "SmartTag",
      value: "30,4 °C",
      limit: "máximo de 28 °C",
      occurredAt: new Date(now - 12 * 60 * 1000),
    },
    {
      id: 3,
      type: "orientation",
      title: "Orientação incorreta",
      description: "A inclinação da carga ultrapassou a posição permitida.",
      source: "Giroscópio",
      evidence: "Velocidade angular de 48,3 °/s",
      value: "64,7°",
      limit: "máximo de 30°",
      occurredAt: new Date(now - 24 * 60 * 1000),
    },
    {
      id: 2,
      type: "signal",
      title: "Sinal abaixo do recomendado",
      description: "A comunicação da tag ficou instável.",
      source: "SmartTag",
      value: "−84 dBm",
      limit: "mínimo de −80 dBm",
      occurredAt: new Date(now - 37 * 60 * 1000),
    },
    {
      id: 1,
      type: "battery",
      title: "Nível de bateria baixo",
      description: "A autonomia estimada entrou na faixa de atenção.",
      source: "SmartTag",
      value: "18%",
      limit: "mínimo de 20%",
      occurredAt: new Date(now - 74 * 60 * 1000),
    },
  ];

  const activeOccurrences = new Set();
  let nextOccurrenceId = occurrences.length + 1;

  const number = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const occurrenceTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const occurrenceDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function getSignalQuality(signal) {
    if (signal >= -67) return "Bom";
    if (signal >= -80) return "Regular";
    return "Fraco";
  }

  function getTemperatureQuality(temperature) {
    if (temperature < parameters.temperatureMinimum) return "Baixa";
    if (temperature > parameters.temperatureMaximum) return "Alta";
    return "Normal";
  }

  function formatOccurrenceTime(date) {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday ? `Hoje, ${occurrenceTime.format(date)}` : occurrenceDate.format(date);
  }

  function renderOccurrences() {
    elements.occurrenceCount.textContent = `${occurrences.length} ${occurrences.length === 1 ? "ocorrência" : "ocorrências"}`;
    elements.occurrenceList.replaceChildren();

    if (occurrences.length === 0) {
      const empty = document.createElement("li");
      empty.className = "occurrence-empty";
      empty.textContent = "Nenhuma ocorrência registrada nesta sessão.";
      elements.occurrenceList.append(empty);
      return;
    }

    occurrences.forEach((occurrence) => {
      const item = document.createElement("li");
      item.className = "occurrence-item";
      item.dataset.type = occurrence.type;

      const marker = document.createElement("span");
      marker.className = "occurrence-marker";
      marker.setAttribute("aria-hidden", "true");

      const content = document.createElement("div");
      content.className = "occurrence-content";

      const titleRow = document.createElement("div");
      titleRow.className = "occurrence-title";

      const title = document.createElement("h3");
      title.textContent = occurrence.title;

      const status = document.createElement("span");
      status.textContent = "Fora do limite";

      const description = document.createElement("p");
      description.textContent = occurrence.description;

      const source = document.createElement("span");
      source.className = "occurrence-source";
      source.textContent = occurrence.evidence
        ? `${occurrence.source} · ${occurrence.evidence}`
        : occurrence.source;

      const reading = document.createElement("div");
      reading.className = "occurrence-reading";

      const value = document.createElement("strong");
      value.textContent = occurrence.value;

      const limit = document.createElement("span");
      limit.textContent = occurrence.limit;

      const occurredAt = document.createElement("time");
      occurredAt.dateTime = occurrence.occurredAt.toISOString();
      occurredAt.textContent = formatOccurrenceTime(occurrence.occurredAt);

      titleRow.append(title, status);
      content.append(titleRow, description, source);
      reading.append(value, limit);
      item.append(marker, content, reading, occurredAt);
      elements.occurrenceList.append(item);
    });
  }

  function getOutOfRangeReadings() {
    const outOfRange = [];

    if (telemetry.battery < parameters.batteryMinimum) {
      outOfRange.push({
        type: "battery",
        title: "Nível de bateria baixo",
        description: "A autonomia estimada entrou na faixa de atenção.",
        source: "SmartTag",
        value: `${Math.round(telemetry.battery)}%`,
        limit: `mínimo de ${parameters.batteryMinimum}%`,
      });
    }

    if (telemetry.signal < parameters.signalMinimum) {
      outOfRange.push({
        type: "signal",
        title: "Sinal abaixo do recomendado",
        description: "A comunicação da tag ficou instável.",
        source: "SmartTag",
        value: `${Math.round(telemetry.signal).toString().replace("-", "−")} dBm`,
        limit: `mínimo de ${parameters.signalMinimum.toString().replace("-", "−")} dBm`,
      });
    }

    if (telemetry.temperature < parameters.temperatureMinimum || telemetry.temperature > parameters.temperatureMaximum) {
      const direction = telemetry.temperature < parameters.temperatureMinimum ? "abaixo" : "acima";
      const threshold = direction === "abaixo" ? parameters.temperatureMinimum : parameters.temperatureMaximum;
      outOfRange.push({
        type: "temperature",
        title: `Temperatura ${direction} do limite`,
        description: "A carga permaneceu fora da faixa recomendada.",
        source: "SmartTag",
        value: `${number.format(telemetry.temperature)} °C`,
        limit: `${direction === "abaixo" ? "mínimo" : "máximo"} de ${threshold} °C`,
      });
    }

    if (telemetry.impact > parameters.impactMaximum) {
      outOfRange.push({
        type: "impact",
        title: "Impacto acima do limite",
        description: "O acelerômetro registrou uma aceleração acima da faixa permitida.",
        source: "Acelerômetro",
        evidence: `Aceleração resultante de ${number.format(telemetry.acceleration)} g`,
        value: `${number.format(telemetry.impact)} g`,
        limit: `máximo de ${parameters.impactMaximum} g`,
      });
    }

    if (telemetry.orientation > parameters.orientationMaximum) {
      outOfRange.push({
        type: "orientation",
        title: "Orientação incorreta",
        description: "A inclinação da carga ultrapassou a posição permitida.",
        source: "Giroscópio",
        evidence: `Velocidade angular de ${number.format(telemetry.angularVelocity)} °/s`,
        value: `${number.format(telemetry.orientation)}°`,
        limit: `máximo de ${parameters.orientationMaximum}°`,
      });
    }

    return outOfRange;
  }

  function registerOccurrences() {
    const readings = getOutOfRangeReadings();
    const currentTypes = new Set(readings.map(({ type }) => type));
    let hasNewOccurrence = false;

    readings.forEach((reading) => {
      if (activeOccurrences.has(reading.type)) return;

      occurrences.unshift({
        ...reading,
        id: nextOccurrenceId,
        occurredAt: new Date(),
      });
      if (occurrences.length > 20) occurrences.pop();
      nextOccurrenceId += 1;
      activeOccurrences.add(reading.type);
      hasNewOccurrence = true;
    });

    Array.from(activeOccurrences).forEach((type) => {
      if (!currentTypes.has(type)) activeOccurrences.delete(type);
    });

    if (hasNewOccurrence) renderOccurrences();
  }

  function renderTelemetry() {
    const battery = Math.round(telemetry.battery);
    const signal = Math.round(telemetry.signal);
    const updatedAt = new Date();

    elements.batteryValue.textContent = battery;
    elements.batteryBar.style.width = `${battery}%`;
    elements.batteryProgress.setAttribute("aria-valuenow", battery);
    elements.batteryProgress.classList.toggle("warning", telemetry.battery < parameters.batteryMinimum);
    elements.signalValue.textContent = String(signal).replace("-", "−");
    elements.signalQuality.textContent = getSignalQuality(telemetry.signal);
    elements.signalQuality.classList.toggle("warning", telemetry.signal < -67);
    elements.temperatureValue.textContent = number.format(telemetry.temperature);
    elements.temperatureQuality.textContent = getTemperatureQuality(telemetry.temperature);
    elements.temperatureQuality.classList.toggle(
      "warning",
      telemetry.temperature < parameters.temperatureMinimum || telemetry.temperature > parameters.temperatureMaximum,
    );
    elements.impactValue.textContent = number.format(telemetry.impact);
    elements.impactQuality.textContent = telemetry.impact > parameters.impactMaximum ? "Impacto" : "Normal";
    elements.impactQuality.classList.toggle("warning", telemetry.impact > parameters.impactMaximum);
    elements.accelerationValue.textContent = number.format(telemetry.acceleration);
    elements.orientationValue.textContent = number.format(telemetry.orientation);
    elements.orientationQuality.textContent = telemetry.orientation > parameters.orientationMaximum ? "Incorreta" : "Correta";
    elements.orientationQuality.classList.toggle("warning", telemetry.orientation > parameters.orientationMaximum);
    elements.angularVelocityValue.textContent = number.format(telemetry.angularVelocity);
    elements.messageValue.textContent = telemetry.messages;
    elements.lastUpdate.textContent = time.format(updatedAt);
    elements.lastUpdate.dateTime = updatedAt.toISOString();
    registerOccurrences();
  }

  function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
  }

  function simulateInstrumentReadings(isManualRefresh = false) {
    const hasImpact = Math.random() < (isManualRefresh ? 0.16 : 0.04);
    const hasIncorrectOrientation = Math.random() < (isManualRefresh ? 0.1 : 0.02);

    telemetry.impact = hasImpact ? randomBetween(3.2, 6.8) : randomBetween(0.1, 0.8);
    telemetry.acceleration = hasImpact ? telemetry.impact * randomBetween(0.85, 1) : randomBetween(0.95, 1.05);
    telemetry.orientation = hasIncorrectOrientation ? randomBetween(34, 75) : randomBetween(1.5, 12);
    telemetry.angularVelocity = hasIncorrectOrientation ? randomBetween(18, 70) : randomBetween(0.2, 4);
  }

  function simulateReading() {
    telemetry.battery = clamp(telemetry.battery - Math.random() * 0.04, 0, 100);
    telemetry.signal = clamp(telemetry.signal + (Math.random() - 0.5) * 5, -95, -45);
    telemetry.temperature = clamp(telemetry.temperature + (Math.random() - 0.5) * 0.3, 18, 32);
    simulateInstrumentReadings();
    telemetry.messages += 1;
    renderTelemetry();
  }

  function refreshNow() {
    // A variação maior deixa claro que o clique foi registrado na demonstração.
    telemetry.signal = clamp(telemetry.signal + (Math.random() - 0.5) * 8, -95, -45);
    telemetry.temperature = clamp(telemetry.temperature + (Math.random() - 0.5) * 0.8, 18, 32);
    simulateInstrumentReadings(true);
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
  renderOccurrences();
  renderTelemetry();
}
