const boton = document.getElementById("btnToggle");

// Función auxiliar para cambiar el aspecto del botón sin repetir código
function actualizarBoton(activo) {
    if (activo) {
        boton.innerText = "Desactivar Diseño";
        boton.style.color = "#ff0000"; // Rojo
        boton.style.borderColor = "#ff0000";
    } else {
        boton.innerText = "Activar Diseño";
        boton.style.color = "#00ff00"; // Verde
        boton.style.borderColor = "#00ff00";
    }
}

// 1. AL ABRIR EL POPUP: Preguntamos a la memoria cómo estaba esta pestaña
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tab = tabs[0];
    let claveMemoria = "estadoCss_" + tab.id; // Creamos una llave única para esta pestaña

    // Leemos el almacenamiento local
    chrome.storage.local.get([claveMemoria], (resultado) => {
        let cssActivo = resultado[claveMemoria] || false; // Si no existe, por defecto es false
        actualizarBoton(cssActivo);
    });
});

// 2. AL HACER CLIC: Leemos, actuamos y guardamos el nuevo estado
boton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let claveMemoria = "estadoCss_" + tab.id;

    chrome.storage.local.get([claveMemoria], async (resultado) => {
        let cssActivo = resultado[claveMemoria] || false;

        if (!cssActivo) {
            // Si estaba APAGADO, lo encendemos y guardamos en memoria
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["estilos.css"]
            });
            chrome.storage.local.set({ [claveMemoria]: true });
            actualizarBoton(true);
        } else {
            // Si estaba ENCENDIDO, lo apagamos y actualizamos memoria
            await chrome.scripting.removeCSS({
                target: { tabId: tab.id },
                files: ["estilos.css"]
            });
            chrome.storage.local.set({ [claveMemoria]: false });
            actualizarBoton(false);
        }
    });
});