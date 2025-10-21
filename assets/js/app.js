// --- 1. CONFIGURACIÓN Y VARIABLES GLOBALES ---

const MARCOS_DISPONIBLES = [
    { id: 'suiza1', url: 'assets/img/marco_evento.png', nombre: 'Azul' },
    { id: 'suiza2', url: 'assets/img/marco_evento2.png', nombre: 'Rosa' },
    { id: 'suiza3', url: 'assets/img/marco_evento3.png', nombre: 'Naranja' }
];
// Variable que almacena la URL del marco seleccionado por el usuario. Inicialmente, el primero.
let marcoSeleccionadoUrl = MARCOS_DISPONIBLES[0].url; 

const OUTPUT_FOLDER = 'fotos_tomadas'; 
const URL_COMPARTIDA = "https://drive.google.com/drive/folders/1TvwzW0FasQBG1KtWoI38FRgptGohziB-?usp=sharing";

// Elementos del DOM (conexión con index.html)
const video = document.getElementById('webcam-stream');
const canvas = document.getElementById('photo-canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture-button');
const overlay = document.getElementById('overlay-message');
const countdownText = document.getElementById('countdown-text');
const qrDisplay = document.getElementById('qr-display');
const photoIdText = document.getElementById('photo-id-text');
const downloadLink = document.getElementById('download-link');
const closeQrButton = document.getElementById('close-qr-button');  //botoncito para cerrar el overlay
const opcionesDiv = document.getElementById('marco-opciones');

let photoCounter = 1;

// Inicializa la cámara web
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

// Genera el QR, usa una librería externa
function setupQrCode() {
    new QRCode(document.getElementById("qrcode"), {
        text: URL_COMPARTIDA,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}


function renderMarcoSelector() {
    opcionesDiv.innerHTML = ''; 
    
    MARCOS_DISPONIBLES.forEach(marco => {
        // 1. Creamos un botón/contenedor para el thumbnail
        const marcoContenedor = document.createElement('button');
        marcoContenedor.classList.add('marco-option');
        
        // 2. Creamos el elemento de imagen <img> para la miniatura
        const imagenMiniatura = document.createElement('img');
        imagenMiniatura.src = marco.url; // Le asignamos la ruta del marco
        imagenMiniatura.alt = `Miniatura de ${marco.nombre}`;
        imagenMiniatura.classList.add('marco-thumbnail');
        
        // Opcional: Nombre bajo la imagen
        const nombreMarco = document.createElement('p');
        nombreMarco.textContent = marco.nombre;
        
        // Ensamblamos el contenido: Imagen y Nombre
        marcoContenedor.appendChild(imagenMiniatura);
        marcoContenedor.appendChild(nombreMarco);
        
        // Estilo inicial para el marco por defecto
        if (marco.url === marcoSeleccionadoUrl) {
            marcoContenedor.classList.add('selected');
        }
        
        // Asignar el evento de clic (Lógica de selección, sin cambios)
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
    // A. Capturar el frame de la webcam en el canvas con efecto espejo
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); // Resetear transformación

    // B. Cargar el marco (usa la variable marcoSeleccionadoUrl)
    const marco = new Image();
    marco.src = marcoSeleccionadoUrl; 
    await new Promise(resolve => marco.onload = resolve);
    
    // C. Superponer el marco sobre la foto
    context.drawImage(marco, 0, 0, canvas.width, canvas.height);

    // D. Generar ID y descargar
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const photoID = `ID${photoCounter.toString().padStart(3, '0')}`;
    const filename = `${timestamp}_${photoID}.png`;
    
    photoIdText.textContent = filename;
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = filename;
    downloadLink.click(); 

    photoCounter++;
}

// --- 5. LÓGICA DE FLUJO (Cuenta Regresiva y QR) ---
function runCountdown() {
    let count = 3;
    overlay.classList.remove('hidden');
    qrDisplay.classList.add('hidden');
    captureButton.disabled = true;

    const timer = setInterval(() => {
        countdownText.textContent = count > 0 ? count : '¡SONRÍE!';
        
        if (count < 0) {
            clearInterval(timer);
            captureAndEdit(); 
            
            // Mostrar el QR y el ID de la foto
            countdownText.textContent = '';
            qrDisplay.classList.remove('hidden');
            
            // ELIMINAMOS EL BLOQUE DE TIMEOUT AQUÍ:
            /*
            setTimeout(() => {
                overlay.classList.add('hidden');
                captureButton.disabled = false;
            }, 8000); 
            */
            
            // EN SU LUGAR, DEJAMOS EL BOTÓN DE CAPTURA DESHABILITADO
            // HASTA QUE SE CIERRE MANUALMENTE.
        }
        count--;
    }, 1000);
}



// NUEVA FUNCIÓN: Cierre manual del overlay
function closeQrOverlay() {
    overlay.classList.add('hidden');
    captureButton.disabled = false; // Habilitar el botón de captura de nuevo
}


// --- 6. EVENT LISTENERS E INICIO ---

// Inicia la cuenta regresiva al hacer clic
captureButton.addEventListener('click', runCountdown);

// Asignar evento al nuevo botón
closeQrButton.addEventListener('click', closeQrOverlay);

// Inicia todo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    startCamera();
    setupQrCode();
    renderMarcoSelector(); 
});