// app.js (CÓDIGO COMPLETO CON BOTÓN DE CIERRE MANUAL Y SIN QR)

// --- 1. CONFIGURACIÓN Y VARIABLES GLOBALES ---

const MARCOS_DISPONIBLES = [
    { id: 'suiza1', url: 'assets/img/marco_evento.png', nombre: 'Azul' },
    { id: 'suiza2', url: 'assets/img/marco_evento2.png', nombre: 'Rosa' },
    { id: 'suiza3', url: 'assets/img/marco_evento3.png', nombre: 'Naranja' }
];
let marcoSeleccionadoUrl = MARCOS_DISPONIBLES[0].url; 

const OUTPUT_FOLDER = 'fotos_tomadas'; 
// La URL_COMPARTIDA y la función setupQrCode ya no existen

// Elementos del DOM
const video = document.getElementById('webcam-stream');
const canvas = document.getElementById('photo-canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture-button');
const overlay = document.getElementById('overlay-message');
const countdownText = document.getElementById('countdown-text');
// const qrDisplay ya no existe
const photoIdText = document.getElementById('photo-id-text');
const downloadLink = document.getElementById('download-link');
const closeQrButton = document.getElementById('close-qr-button'); // ¡Mantenemos el botón de cierre!
const opcionesDiv = document.getElementById('marco-opciones');

let photoCounter = 1;


// --- 2. FUNCIONES DE INICIO ---

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo iniciar la cámara. Verifica la conexión.");
    }
}


// --- 3. FUNCIÓN DE SELECCIÓN DE MARCOS ---

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


// --- 4. LÓGICA DE CAPTURA Y EDICIÓN ---

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
    
    photoIdText.textContent = filename;
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = filename;
    downloadLink.click(); 

    photoCounter++;
}


// --- 5. LÓGICA DE CIERRE MANUAL ---

// Función para cerrar el overlay y habilitar el botón
function closeQrOverlay() {
    overlay.classList.add('hidden');
    captureButton.disabled = false; // Habilitar el botón de captura de nuevo
}


// --- 6. LÓGICA DE FLUJO (Cuenta Regresiva) ---

function runCountdown() {
    let count = 3;
    overlay.classList.remove('hidden');
    // Mantenemos el overlay visible hasta que se presione el botón de cierre
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


// --- 7. EVENT LISTENERS E INICIO ---

// A. Asignar el evento de Captura
captureButton.addEventListener('click', runCountdown);

// B. Asignar el evento de Cierre del Botón
closeQrButton.addEventListener('click', closeQrOverlay);


// C. Iniciar todo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    startCamera();
    renderMarcoSelector(); 
});