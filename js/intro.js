/* ==========================================================
   INTRO.JS
   Pantalla cinematográfica
   Cooperación Española en Mozambique
========================================================== */

const INTRO_ID = "introScreen";
const ENTER_BUTTON_ID = "enterMapBtn";
const SKIP_BUTTON_ID = "skipIntroBtn";

const SESSION_KEY = "aecid_intro_seen";

let intro = null;
let enterButton = null;
let skipButton = null;

let alreadyClosed = false;

/* ==========================================================
   Inicialización
========================================================== */

export function initIntro() {

    intro = document.getElementById(INTRO_ID);
    enterButton = document.getElementById(ENTER_BUTTON_ID);
    skipButton = document.getElementById(SKIP_BUTTON_ID);

    if (!intro) return;

    if (sessionStorage.getItem(SESSION_KEY)) {

        intro.remove();

        document.body.classList.add("app-ready");

        return;

    }

    enterButton?.addEventListener("click", closeIntro);

    skipButton?.addEventListener("click", closeIntro);

    document.addEventListener("keydown", keyboardHandler);

}

/* ==========================================================
   Cerrar intro
========================================================== */

export function closeIntro() {

    if (alreadyClosed) return;

    alreadyClosed = true;

    sessionStorage.setItem(SESSION_KEY, "true");

    intro.classList.add("hidden");

    document.body.classList.add("app-ready");

    document.removeEventListener("keydown", keyboardHandler);

    setTimeout(() => {

        intro.remove();

        window.dispatchEvent(
            new CustomEvent("introFinished")
        );

    }, 900);

}

/* ==========================================================
   Reiniciar intro
========================================================== */

export function resetIntro() {

    sessionStorage.removeItem(SESSION_KEY);

}

/* ==========================================================
   Mostrar otra vez
========================================================== */

export function showIntroAgain() {

    resetIntro();

    location.reload();

}

/* ==========================================================
   ESC
========================================================== */

function keyboardHandler(event) {

    if (event.key === "Escape") {

        closeIntro();

    }

}

/* ==========================================================
   API pública
========================================================== */

export default {

    initIntro,

    closeIntro,

    resetIntro,

    showIntroAgain

};
