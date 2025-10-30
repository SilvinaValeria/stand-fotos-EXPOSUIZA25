const FOTO_ANCHO = 1080;
const FOTO_ALTO = 1720;

const MARCOS_DISPONIBLES = [
    { id: 'suiza1', url: 'assets/img/marco_evento.png', nombre: 'Multicolor' },
    { id: 'suiza2', url: 'assets/img/marco_evento2.png', nombre: 'Azul' },
    { id: 'suiza3', url: 'assets/img/marco_evento3.png', nombre: 'Verde' }
];
let marcoSeleccionadoUrl = MARCOS_DISPONIBLES[0].url; 

const OUTPUT_FOLDER = 'fotos_tomadas'; 

const video = document.getElementById('webcam-stream');
const canvas = document.getElementById('photo-canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture-button');
const overlay = document.getElementById('overlay-message');
const countdownText = document.getElementById('countdown-text');

const downloadLink = document.getElementById('download-link'); 

const closeQrButton = document.getElementById('close-qr-button'); 
const opcionesDiv = document.getElementById('marco-opciones');

let photoCounter = 1;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: FOTO_ANCHO * 1 },
                height: { ideal: FOTO_ALTO * 1}
            } 
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            canvas.width = FOTO_ANCHO;
            canvas.height = FOTO_ALTO;
        };
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        console.warn("No se pudo iniciar la cámara. Verifica la conexión.");
    }
}

function renderMarcoSelector() {
    opcionesDiv.innerHTML = ''; 

    MARCOS_DISPONIBLES.forEach(marco => {
        const marcoContenedor = document.createElement('button');
        marcoContenedor.classList.add('marco-option');

        const imagenMiniatura = document.createElement('img');
        imagenMiniatura.src = marco.url; 
        imagenMiniatura.alt = `Miniatura de ${marco.nombre}`;
        imagenMiniatura.classList.add('marco-thumbnail');

        const nombreMarco = document.createElement('p');
        nombreMarco.textContent = marco.nombre;

        marcoContenedor.appendChild(imagenMiniatura);
        marcoContenedor.appendChild(nombreMarco);

        if (marco.url === marcoSeleccionadoUrl) {
            marcoContenedor.classList.add('selected');
        }

        marcoContenedor.addEventListener('click', () => {
            marcoSeleccionadoUrl = marco.url;

            document.querySelectorAll('.marco-option').forEach(btn => {
                btn.classList.remove('selected');
            });
            marcoContenedor.classList.add('selected');
        });

        opcionesDiv.appendChild(marcoContenedor);
    });
}


async function captureAndEdit() {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0);

    const marco = new Image();
    marco.src = marcoSeleccionadoUrl; 
    await new Promise(resolve => marco.onload = resolve); 
    context.drawImage(marco, 0, 0, canvas.width, canvas.height);


    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const photoID = `ID${photoCounter.toString().padStart(3, '0')}`;
    const filename = `${timestamp}_${photoID}.png`;

    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = filename;
    downloadLink.click(); 
    photoCounter++;
}

function closeQrOverlay() {
    overlay.classList.add('hidden');
    captureButton.disabled = false; 
}

function runCountdown() {
    let count = 3;
    overlay.classList.remove('hidden');
    captureButton.disabled = true;

    const timer = setInterval(() => {
        countdownText.textContent = count > 0 ? count : '¡FOTO LISTA! Presiona (X)'; 

        if (count < 0) {
            clearInterval(timer);
            captureAndEdit();
        }
        count--;
    }, 1000);
}

captureButton.addEventListener('click', runCountdown);

closeQrButton.addEventListener('click', closeQrOverlay);

document.addEventListener('DOMContentLoaded', () => {
    startCamera();
    renderMarcoSelector(); 
});
