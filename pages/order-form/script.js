function setMinDeliveryDate() {
    const DAY = 24 * 60 * 60 * 1000;
    const NOW = Date.now();
    const tomorrow = NOW - (NOW % DAY) + DAY;
    const minDate = new Date(tomorrow);
    const isoDate = minDate.toISOString();
    console.log(isoDate.slice(0, isoDate.indexOf('T')));

    const deliveryDateInput = document.getElementById("delivery-date");
    deliveryDateInput.min = isoDate.slice(0, isoDate.indexOf('T'));
}
setMinDeliveryDate();

const submitBtn = document.getElementById("submit");

const nameInput = document.getElementById("name");
const nameError = document.querySelector("#name + span.error");

const surname = document.getElementById("surname");
const surnameError = document.querySelector("#surname + span.error");

const deliveryDate = document.getElementById("delivery-date");
const deliveryDateError = document.querySelector("#delivery-date + span.error");

const street = document.getElementById("street");
const streetError = document.querySelector("#street + span.error");

const house = document.getElementById("house");
const houseError = document.querySelector("#house + span.error");

const flat = document.getElementById("flat");
const flatError = document.querySelector("#flat + span.error");

const payments = document.getElementsByName("payment-type");
const paymentError = document.querySelector("#payment-type + span.error");

const gifts = document.getElementsByName("gifts");
const giftsError = document.querySelector("#gifts + span.error");

const form = document.querySelector("form");


function isFieldValid(field) {
    if (field.valueMissing || !field.validity.valid) {
        return false;
    }
    return true;
}


function isPaymentValid() {
    for (const payment of payments) {
        if (payment.checked) {
            return true;
        }
    }
    return false;
}

function getSelectedGiftsCount() {
    let checkedCount = 0;
    for (const gift of gifts) {
        if (gift.checked) {
            checkedCount++;
        }
    }
    return checkedCount;
}

function isGiftsValid() {
    let checkedCount = getSelectedGiftsCount();

    if (checkedCount > 2) {
        return false;
    }
    return true;
}

const setValidations = ({ missing = false, typeMismatch = false, pattern = false, tooShort = false, rangeUnderflow = false } = {}) => {
    return {
        missing,
        typeMismatch,
        pattern,
        tooShort,
        rangeUnderflow
    };
}

const formInputs = [
    {
        input: nameInput,
        inputError: nameError,
        validity: isFieldValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, tooShort: true }),
        showError: function () { showErrorCondition(nameInput, nameError, "name", this.validations, "a string of letters without spaces.") }
    },
    {
        input: surname,
        inputError: surnameError,
        validity: isFieldValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, tooShort: true }),
        showError: function () { showErrorCondition(surname, surnameError, "surname", this.validations, "a string of letters without spaces.") }
    },
    {
        input: deliveryDate,
        inputError: deliveryDateError,
        validity: isDeliveryDateValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, rangeUnderflow: true }),
        showError: function () { showErrorCondition(deliveryDate, deliveryDateError, "delivery-date", this.validations, "a date not earlier than tomorrow.") }
    },
    {
        input: street,
        inputError: streetError,
        validity: isFieldValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, tooShort: true }),
        showError: function () { showErrorCondition(street, streetError, "street", this.validations, "a string, numbers are allowed.") }
    },
    {
        input: house,
        inputError: houseError,
        validity: isFieldValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, rangeUnderflow: true }),
        showError: function () { showErrorCondition(house, houseError, "house", this.validations, "a positive integer.") }
    },
    {
        input: flat,
        inputError: flatError,
        validity: isFieldValid,
        validations: setValidations({ missing: true, typeMismatch: true, pattern: true, rangeUnderflow: true }),
        showError: function () { showErrorCondition(flat, flatError, "house", this.validations, "a positive integer, the dash symbol is allowed, shouldn't start with minus/dash symbol.") }
    },
    { input: payments, inputError: paymentError, validity: isPaymentValid, validations: {}, showError: showPaymentError },
    { input: gifts, inputError: giftsError, validity: isGiftsValid, validations: {}, showError: () => { } },
];

form.addEventListener("change", (event) => {
    event.stopPropagation();

    if (event.target.type == "checkbox") {
        const checkedCount = getSelectedGiftsCount();
        if (checkedCount >= 2) {
            for (const gift of gifts) {
                if (!gift.checked) {
                    gift.disabled = true;
                }
            }
        } else {
            for (const gift of gifts) {
                if (gift.disabled) {
                    gift.disabled = false;
                }
            }
        }
        return;
    }
});


form.addEventListener("input", (event) => {
    event.stopPropagation();
    const input = event.target;

    for (let inp of formInputs) {
        console.log(inp.input.name);
        if (inp.input instanceof NodeList && inp.input[0].name === input.name ||
            inp.input.name === input.name) {
            if (inp.validity(input)) {
                inp.inputError.innerText = ""; // Reset the content of the message
                inp.inputError.className = "error"; // Reset the visual state of the message
            } else {
                inp.showError();
            }
            setFormValidity();
            break;
        }
    }
});

function isDeliveryDateValid() {
    const date = deliveryDate.valueAsNumber;

    const DAY = 24 * 60 * 60 * 1000;
    const NOW = Date.now();
    const tomorrow = NOW - (NOW % DAY) + DAY;
    console.log(`NOW: ${NOW}`);
    console.log(`Tomorrow: ${tomorrow}`);
    if (deliveryDate.valueMissing || date < tomorrow) {
        return false;
    }
    return true;
}


function isFormValid() {
    for (const inputData of formInputs) {
        if (!inputData.validity(inputData.input)) {
            return false;
        }
    }
    return true;
}

function setFormValidity() {
     if (isPaymentValid()) {
        hidePaymentError();
    } else {
        showPaymentError();
    }

    if (isFormValid()) {
        submitBtn.disabled = false;
    }
    else {
        submitBtn.disabled = true;
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    showSentInfo();
});

function showErrorCondition(input, errorIndicator, inputName, validations, patternDesc) {
    console.log(...arguments);
    if (!validations) return;
    console.log("showErrorCondition");
    if (validations.missing && input.validity.valueMissing) {
        errorIndicator.innerText += `Please, enter your ${inputName}.`;
    }
    if (validations.typeMismatch && input.validity.typeMismatch) {
        errorIndicator.innerText = "Entered value needs to be a string.";
    }
    if (validations.pattern && input.validity.patternMismatch) {
        errorIndicator.innerText = `Entered value needs to be ${patternDesc}.`;
    }
    if (validations.tooShort && input.validity.tooShort) {
        errorIndicator.innerText = `${inputName.charAt(0).toUpperCase() + inputName.slice(1)} should be at least ${input.minLength} characters; you entered ${input.value.length}.`;
    }

    if (validations.rangeUnderflow && input.validity.rangeUnderflow) {
        errorIndicator.innerText = `Entered value should be larger than ${input.min}; you entered ${input.value}.`;
    }

    input.className = "error active";
}


function hidePaymentError() {
    const paymentLabel = document.querySelector("#payment-type");
    if (paymentLabel.classList.contains("invalid")) {
        paymentLabel.classList.toggle("invalid");
    }
}

function showPaymentError() {
    const paymentLabel = document.querySelector("#payment-type");
    if (paymentLabel.classList.contains("invalid")) {
        return;
    }

    paymentLabel.classList.toggle("invalid");
    paymentError.innerText = "Please, select payment type.";
    paymentError.className = "error active";
}