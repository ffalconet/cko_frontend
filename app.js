/* global Frames */
var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var errorStack = [];

var iframe = $('#singleIframe').contents();

Frames.addEventHandler(
    Frames.Events.CARD_VALIDATION_CHANGED,
    onCardValidationChanged
);

function onCardValidationChanged(event) {
    console.log("CARD_VALIDATION_CHANGED: %o", event);
    payButton.disabled = !Frames.isCardValid();
    frameSelector()
}

Frames.addEventHandler(
    Frames.Events.CARD_BIN_CHANGED,
    CARD_BIN_CHANGED
);

function CARD_BIN_CHANGED(event) {
    console.log("CARD_BIN_CHANGED: %o", event);
    //$(".scheme-choice-frame").hide();
    payButton.disabled = !Frames.isCardValid();
}


Frames.addEventHandler(
    Frames.Events.CARD_TOKENIZED,
    CARD_TOKENIZED
);

function CARD_TOKENIZED(event) {
    console.log("CARD_TOKENIZED: %o", event);
    console.log(JSON.stringify(event));
    payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
    Frames.Events.FRAME_VALIDATION_CHANGED,
    onValidationChanged
);

function onValidationChanged(event) {
    console.log("FRAME_VALIDATION_CHANGED: %o", event);

    var errorMessageElement = document.querySelector(".error-message");
    var hasError = !event.isValid && !event.isEmpty;

    if (hasError) {
        errorStack.push(event.element);
    } else {
        errorStack = errorStack.filter(function(element) {
            return element !== event.element;
        });
    }

    var errorMessage = errorStack.length ?
        getErrorMessage(errorStack[errorStack.length - 1]) :
        "";
    errorMessageElement.textContent = errorMessage;
}

function getErrorMessage(element) {
    var errors = {
        "card-number": "Please enter a valid card number",
        "expiry-date": "Please enter a valid expiry date",
        cvv: "Please enter a valid cvv code",
    };

    return errors[element];
}

Frames.addEventHandler(
    Frames.Events.CARD_TOKENIZATION_FAILED,
    onCardTokenizationFailed
);

function onCardTokenizationFailed(error) {
    console.log("CARD_TOKENIZATION_FAILED: %o", error);
    Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);

function onCardTokenized(event) {
    paymenttoken = event.token;
    console.log("Frames Success : " + event.token)
        /*var el = document.querySelector(".success-payment-message");
        el.innerHTML =
            "Card tokenization completed<br>" +
            'Your card token is: <span class="token">' +
            event.token +
            "</span>";*/
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    Frames.submitCard();
});