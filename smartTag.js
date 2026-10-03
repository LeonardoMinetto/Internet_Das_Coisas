const batteryValue = document.querySelector("#batteryValue");
const batteryBar = document.querySelector("#batteryBar");
const signalValue = document.querySelector("#signalValue");
const signalQuality = document.querySelector("#signalQuality");
const temperatureValue = document.querySelector("#temperatureValue");
const messageValue = document.querySelector("#messageValue");
const lastUpdate = document.querySelector("#lastUpdate");
const refreshButton = document.querySelector("#refreshButton");

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
  batteryValue.textContent = Math.round(telemetry.battery);
  batteryBar.style.width = `${telemetry.battery}%`;
  signalValue.textContent = String(Math.round(telemetry.signal)).replace("-", "−");
  signalQuality.textContent = getSignalQuality(telemetry.signal);
  signalQuality.classList.toggle("warning", telemetry.signal < -67);
  temperatureValue.textContent = number.format(telemetry.temperature);
  messageValue.textContent = telemetry.messages;
  lastUpdate.textContent = time.format(new Date());
  lastUpdate.dateTime = new Date().toISOString();
}

function simulateReading() {
  telemetry.battery = clamp(telemetry.battery - Math.random() * 0.04, 0, 100);
  telemetry.signal = clamp(telemetry.signal + (Math.random() - 0.5) * 5, -95, -45);
  telemetry.temperature = clamp(telemetry.temperature + (Math.random() - 0.5) * 0.3, 18, 32);
  telemetry.messages += 1;
  renderTelemetry();
}

refreshButton.addEventListener("click", simulateReading);
setInterval(simulateReading, 5000);
renderTelemetry();
