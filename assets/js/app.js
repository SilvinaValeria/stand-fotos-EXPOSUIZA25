const FOTO_ANCHO = 720;
const FOTO_ALTO = 1080;

const MARCOS_DISPONIBLES = [
  { id: "suiza1", url: "assets/img/marco_evento.png", nombre: "Multicolor" },
  { id: "suiza2", url: "assets/img/marco_evento2.png", nombre: "Azul" },
  { id: "suiza3", url: "assets/img/marco_evento3.png", nombre: "Verde" },
];
let marcoSeleccionadoUrl = MARCOS_DISPONIBLES[0].url;

const OUTPUT_FOLDER = "fotos_tomadas";

const video = document.getElementById("webcam-stream");
const canvas = document.getElementById("photo-canvas");
const context = canvas.getContext("2d");
const captureButton = document.getElementById("capture-button");
const overlay = document.getElementById("overlay-message");
const countdownText = document.getElementById("countdown-text");

const downloadLink = document.getElementById("download-link");

const closeQrButton = document.getElementById("close-qr-button");
const opcionesDiv = document.getElementById("marco-opciones");

let photoCounter = 1;

async function selectVideoDevice() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    if (videoDevices.length === 0) {
      console.error("No se encontraron cámaras de video disponibles.");
      return null;
    }

    return videoDevices[0].deviceId;
  } catch (err) {
    console.error("Error al enumerar dispositivos:", err);
    return null;
  }
}

async function startCamera() {
  const deviceId = await selectVideoDevice();

  if (!deviceId) {
    alert("ERROR: No hay cámaras de video disponibles.");
    return;
  }

  const streamConstraints = {
    video: {
      deviceId: { exact: deviceId },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(streamConstraints);
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      canvas.width = FOTO_ANCHO;
      canvas.height = FOTO_ALTO;
    };
  } catch (err) {
    console.error("Error FATAL al acceder a la cámara:", err);
    alert(`Fallo en la cámara: ${err.name}. Revisa la consola (F12)`);
    video.style.display = "none";
  }
}

async function captureAndEdit() {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  const canvasRatio = canvas.width / canvas.height;
  const videoRatio = videoWidth / videoHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = videoWidth;
  let sourceHeight = videoHeight;

  if (videoRatio > canvasRatio) {
    // El video es más ancho que el canvas (ej: 16:9 vs 10:17), recortar ancho
    sourceWidth = videoHeight * canvasRatio;
    sourceX = (videoWidth - sourceWidth) / 2;
  } else if (videoRatio < canvasRatio) {
    // El video es más alto que el canvas, recortar alto (menos común en webcams)
    sourceHeight = videoWidth / canvasRatio;
    sourceY = (videoHeight - sourceHeight) / 2;
  }

  /*
  ver si es necesario el espejado(?)
  context.translate(canvas.width, 0);
  context.scale(-1, 1);*/

  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.setTransform(1, 0, 0, 1, 0, 0); 

  const marco = new Image();
  marco.src = marcoSeleccionadoUrl;
  await new Promise((resolve) => (marco.onload = resolve));
  context.drawImage(marco, 0, 0, canvas.width, canvas.height);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const photoID = `ID${photoCounter.toString().padStart(3, "0")}`;
  const filename = `${timestamp}_${photoID}.png`;

  downloadLink.href = canvas.toDataURL("image/png");
  downloadLink.download = filename;
  downloadLink.click();
  photoCounter++;
}

function renderMarcoSelector() {
  opcionesDiv.innerHTML = "";

  MARCOS_DISPONIBLES.forEach((marco) => {
    const marcoContenedor = document.createElement("button");
    marcoContenedor.classList.add("marco-option");

    const imagenMiniatura = document.createElement("img");
    imagenMiniatura.src = marco.url;
    imagenMiniatura.alt = `Miniatura de ${marco.nombre}`;
    imagenMiniatura.classList.add("marco-thumbnail");

    const nombreMarco = document.createElement("p");
    nombreMarco.textContent = marco.nombre;

    marcoContenedor.appendChild(imagenMiniatura);
    marcoContenedor.appendChild(nombreMarco);

    if (marco.url === marcoSeleccionadoUrl) {
      marcoContenedor.classList.add("selected");
    }

    marcoContenedor.addEventListener("click", () => {
      marcoSeleccionadoUrl = marco.url;

      document.querySelectorAll(".marco-option").forEach((btn) => {
        btn.classList.remove("selected");
      });
      marcoContenedor.classList.add("selected");
    });

    opcionesDiv.appendChild(marcoContenedor);
  });
}

function closeQrOverlay() {
  overlay.classList.add("hidden");
  captureButton.disabled = false;
}

function runCountdown() {
  let count = 3;
  overlay.classList.remove("hidden");
  captureButton.disabled = true;

  const timer = setInterval(() => {
    countdownText.textContent = count > 0 ? count : "¡FOTO LISTA! Presiona (X)";

    if (count < 0) {
      clearInterval(timer);
      captureAndEdit();
    }
    count--;
  }, 1000);
}

captureButton.addEventListener("click", runCountdown);

closeQrButton.addEventListener("click", closeQrOverlay);

document.addEventListener("DOMContentLoaded", () => {
  startCamera();
  renderMarcoSelector();
});
