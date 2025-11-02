const envoltura = document.querySelector(".envoltura-sobre");
const carta = document.querySelector(".carta");
const sobre = document.querySelector(".sobre");
const corazon = document.querySelector(".corazon");
const solapaDer = document.querySelector(".solapa-derecha");
const solapaIzq = document.querySelector(".solapa-izquierda");

// Respeta usuarios con reduced motion
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TRANSITION_MS = reducedMotion ? 0 : 500;

const isEnvelopeOpen = () => envoltura.classList.contains("abierto");
const isLetterOpen = () => carta.classList.contains("abierta");

let busy = false; // evita estados locos por doble click

function openEnvelope() {
  envoltura.classList.add("abierto");
}
function closeEnvelope() {
  envoltura.classList.remove("abierto");
}

function openLetter() {
  if (busy || isLetterOpen()) return;
  busy = true;
  carta.classList.add("mostrar-carta");
  // desactivar interacción con la solapa mientras la carta sube
  envoltura.classList.add("desactivar-sobre");

  setTimeout(() => {
    carta.classList.remove("mostrar-carta");
    carta.classList.add("abierta");
    busy = false;
  }, TRANSITION_MS);
}

function closeLetter() {
  if (busy || !isLetterOpen()) return;
  busy = true;
  carta.classList.add("cerrando-carta");
  envoltura.classList.remove("desactivar-sobre");

  setTimeout(() => {
    carta.classList.remove("cerrando-carta");
    carta.classList.remove("abierta");
    busy = false;
  }, TRANSITION_MS);
}

function toggleEnvelope() {
  if (busy) return;
  if (isEnvelopeOpen()) {
    // si la carta está abierta, ciérrala primero
    if (isLetterOpen()) closeLetter();
    closeEnvelope();
  } else {
    openEnvelope();
  }
}

function toggleLetter() {
  if (!isEnvelopeOpen()) {
    // si tocan la carta cuando el sobre está cerrado, primero abre el sobre
    openEnvelope();
    // y luego abre la carta con un pequeño delay para que la solapa se anime
    setTimeout(openLetter, reducedMotion ? 0 : 200);
    return;
  }
  isLetterOpen() ? closeLetter() : openLetter();
}

// Delegación de eventos principal (click/tap)
document.addEventListener("click", (e) => {
  const target = e.target;

  // 1) Interacción que abre/cierra el sobre
  if (
    target.matches(".sobre") ||
    target.matches(".solapa-derecha") ||
    target.matches(".solapa-izquierda") ||
    target.matches(".corazon")
  ) {
    toggleEnvelope();
    return;
  }

  // 2) Clic dentro del contenido de la carta
  if (target.closest(".sobre")) {
    // Ignora controles interactivos para no cerrar por accidente
    if (target.closest("a, button, input, textarea, select, [data-no-toggle]")) {
      return;
    }
    // Cualquier clic dentro del área de la carta alterna la carta
    toggleLetter();
  }
});

// Teclado: Enter/Espacio para abrir/cerrar; ESC para cerrar carta
document.addEventListener("keydown", (e) => {
  const active = document.activeElement;

  // ESC cierra solo la carta (si está abierta)
  if (e.key === "Escape") {
    if (isLetterOpen()) {
      e.preventDefault();
      closeLetter();
    }
    return;
  }

  // Enter/Espacio sobre elementos clave
  if (e.key === "Enter" || e.key === " ") {
    if (
      active &&
      (active.matches(".corazon") ||
        active.matches(".sobre") ||
        active.matches(".solapa-derecha") ||
        active.matches(".solapa-izquierda"))
    ) {
      e.preventDefault();
      toggleEnvelope();
    } else if (active && active.closest(".sobre")) {
      e.preventDefault();
      toggleLetter();
    }
  }
});

// Accesible: permite foco en elementos clicables principales
[sobre, corazon, solapaDer, solapaIzq].forEach((el) => {
  if (el) el.setAttribute("tabindex", "0");
});

// ===== MODAL INSTRUCCIONES =====
(function(){
  const MODAL_KEY = "instruccionesV1-visto";
  const backdrop = document.getElementById("modalInstrucciones");
  if (!backdrop) return;

  const btnOk = document.getElementById("btnEntendido");
  const btnX  = document.getElementById("btnCerrarModal");

  function openModal() {
    document.body.classList.add("modal-open");
    backdrop.setAttribute("data-open","true");
    backdrop.setAttribute("aria-hidden","false");
  }
  function closeModal() {
    document.body.classList.remove("modal-open");
    backdrop.setAttribute("data-open","false");
    backdrop.setAttribute("aria-hidden","true");
    try { localStorage.setItem(MODAL_KEY, "1"); } catch(_) {}
  }

  // Mostrar solo la primera vez
  let visto = false;
  try { visto = localStorage.getItem(MODAL_KEY) === "1"; } catch(_) {}
  if (!visto) openModal();

  // Cerrar con botón, con X, con clic fuera y con ESC
  btnOk && btnOk.addEventListener("click", closeModal);
  btnX  && btnX.addEventListener("click", closeModal);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.getAttribute("data-open")==="true") {
      e.preventDefault(); closeModal();
    }
  });
})();
