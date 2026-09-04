window.addEventListener("message", function (event) {
    // dial is our message within extension to distinguish from other comands
    if (!event.data || event.data.type !== "dial") return;

    if (shouldEnableDialer() === false) {
        console.log("Dialer disabled by configuration.");
        return;
    }

    const linkValueNumberOrName = event.data.linkValue;


     if (!linkValueNumberOrName || !isValidPhoneNumber(linkValueNumberOrName)) {
        console.log("Invalid or missing phone number:", linkValueNumberOrName);
        //lookupContact(linkValueNumberOrName);
        displayInvalidHtml();
        return;
    }

    window.parent.dispatchEvent(new CustomEvent("onclicktoact", {detail:{openDialog:true, value: linkValueNumberOrName }} ))

    console.log("Received dial request:", linkValueNumberOrName);
});


function shouldEnableDialer() {
    let shouldRenderDialer = false;
    try {
        const isMultiSessionApp = (window.Xrm && window.Xrm.App && window.Xrm.App.sessions) != null; // Using XRM as APM not available in single session apps
        if (isMultiSessionApp) {
            shouldRenderDialer = true; // if APM is not loaded before ribbon, falling back to current behavior (Bug 5178501)
            let windowMicrosoft = window.Microsoft;
            if (windowMicrosoft && windowMicrosoft.AppRuntime && windowMicrosoft.AppRuntime.Internal
                && windowMicrosoft.AppRuntime.Internal.shouldRenderPresence) {
                // if API api for shouldRenderPresence is available, update the state
                shouldRenderDialer = windowMicrosoft.AppRuntime.Internal.shouldRenderPresence();
            }
        }
    }
    catch (error) {
        if (window.Xrm && window.Xrm.Reporting) {
            window.Xrm.Reporting.reportFailure("shouldEnableDialer", error);
        }
    }
    return shouldRenderDialer;
}

function isValidPhoneNumber(number) {
    // Check for international format first (+followed by digits only)
    if (isValidInternationalPhoneNumber(number)) {
        // Remove the + for length validation
        const digitsOnly = number.substring(1);
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }
        
    return false;
}

function isValidInternationalPhoneNumber(number) {
    // Check if number starts with + and contains only digits after the +
    const internationalPattern = /^\+\d+$/;
    return internationalPattern.test(number);
}



function displayInvalidHtml() {
    // Remove any existing invalid number dialog
    const existingDialog = document.getElementById('invalid-number-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    const lang = Xrm.Utility.getGlobalContext().userSettings.languageId;
    const localizedText = getLocalizedText(lang);

    // Create dialog HTML
    const dialogHtml = `
        <div id="invalid-number-dialog" style="
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            background: white; 
            border: 2px solid #dc3545; 
            border-radius: 8px;
            padding: 30px; 
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            z-index: 10001;
            min-width: 300px;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <div style="
                color: #dc3545; 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            ">
                <span style="font-size: 24px;">⚠️</span>
                ${localizedText.InvalidNumber}
            </div>
            <p style="
                color: #666; 
                margin: 0 0 20px 0; 
                font-size: 14px;
            ">${localizedText.InvalidNumberMessage}</p>
            <button onclick="closeInvalidDialog()" style="
                padding: 10px 20px; 
                background: #dc3545; 
                color: white; 
                border: none; 
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            " onmouseover="this.style.background='#c82333'" 
               onmouseout="this.style.background='#dc3545'">
                ${localizedText.OkButtonText}
            </button>
        </div>
        <div id="invalid-dialog-overlay" style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.5); 
            z-index: 10000;
        " onclick="closeInvalidDialog()"></div>
    `;
    
    // Add dialog to page
    const dialogContainer = document.createElement('div');
    dialogContainer.innerHTML = dialogHtml;
    document.body.appendChild(dialogContainer);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closeInvalidDialog();
    }, 3000);
}

function closeInvalidDialog() {
    const dialog = document.getElementById('invalid-number-dialog');
    const overlay = document.getElementById('invalid-dialog-overlay');
    
    if (dialog) {
        dialog.parentElement.remove();
    }
    if (overlay) {
        overlay.remove();
    }
}


function getLocalizedText(languageId) {
    // Default to English
    const defaultText = {
        InvalidNumber: "Invalid Number",
        InvalidNumberMessage: "The phone number format is not valid or dialing is not available.",
        OkButtonText: "OK"
    };

    // Add localized text for different languages
    const localizations = {
    1031: { // German
        InvalidNumber: "Ungültige Nummer",
        InvalidNumberMessage: "Das Telefonnummernformat ist nicht gültig oder das Wählen ist nicht verfügbar.",
        OkButtonText: "OK"
    },
    1036: { // French
        InvalidNumber: "Numéro invalide",
        InvalidNumberMessage: "Le format du numéro de téléphone n'est pas valide ou la numérotation n'est pas disponible.",
        OkButtonText: "OK"
    },
    1040: { // Italian
        InvalidNumber: "Numero non valido",
        InvalidNumberMessage: "Il formato del numero di telefono non è valido o la chiamata non è disponibile.",
        OkButtonText: "OK"
    },
    1044: { // Norwegian (Bokmål)
        InvalidNumber: "Ugyldig nummer",
        InvalidNumberMessage: "Telefonnummerformatet er ikke gyldig eller oppringning er ikke tilgjengelig.",
        OkButtonText: "OK"
    },
    1038: { // Hungarian
        InvalidNumber: "Érvénytelen szám",
        InvalidNumberMessage: "A telefonszám formátuma nem érvényes, vagy a tárcsázás nem elérhető.",
        OkButtonText: "OK"
    },
    1034: { // Spanish (Spain)
        InvalidNumber: "Número inválido",
        InvalidNumberMessage: "El formato del número de teléfono no es válido o la marcación no está disponible.",
        OkButtonText: "OK"
    }
};

    return { ...defaultText, ...(localizations[languageId] || {}) };
}




// Make closeInvalidDialog available globally for the onclick handler
window.closeInvalidDialog = closeInvalidDialog;





