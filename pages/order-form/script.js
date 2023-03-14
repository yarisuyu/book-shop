import { addElement } from "../../assets/scripts/helper.js"

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
const giftsError = undefined;

const form = document.querySelector("form");


function formatDate(date) {
    const isoDate = date.toISOString();
    return isoDate.slice(0, isoDate.indexOf('T'));
}

function setMinDeliveryDate() {
    const DAY = 24 * 60 * 60 * 1000;
    const NOW = Date.now();
    const tomorrow = NOW - (NOW % DAY) + DAY;
    const minDate = new Date(tomorrow);

    deliveryDate.min = formatDate(minDate);
}

setMinDeliveryDate();

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

function printInput(container, input, printValue = undefined) {
    const row = addElement(container, "div", "summary-row");
    const labelText = (input instanceof NodeList) ? input.item(0).name : input.id;
    const dashless = labelText.replace("-", " ");
    const capitalizedLabel =
        dashless.charAt(0).toUpperCase()
        + dashless.slice(1);

    addElement(row, "span", "summary-row-label", `${capitalizedLabel}: `);
    let printedValue = "";
    if (typeof printValue === "function") {
        printedValue = printValue(input);
    } else {
        printedValue = input.value;
    }
    addElement(row, "span", "summary-row-value", printedValue);
}

const formInputs = [
    {
        input: nameInput,
        inputError: nameError,
        isValid: function () { return isFieldValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: surname,
        inputError: surnameError,
        isValid: function() { return isFieldValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: deliveryDate,
        inputError: deliveryDateError,
        isValid: function() { return isDeliveryDateValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: street,
        inputError: streetError,
        isValid: function() { return isFieldValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: house,
        inputError: houseError,
        isValid: function() { return isFieldValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: flat,
        inputError: flatError,
        isValid: function() { return isFieldValid(this.input) },
        print: function (container) { printInput(container, this.input); }
    },
    {
        input: payments,
        inputError: paymentError,
        isValid: function() { return isPaymentValid(this.input) },
        print: function (container) {
            printInput(container, this.input, inputs => {
                let result = "";
                for (let input of inputs) {
                    if (input.checked) {
                        result = input.value;
                        break;
                    }
                }
                return result;
            });
        }
    },
    {
        input: gifts,
        inputError: giftsError,
        isValid: function() { return isGiftsValid(this.input) },
        print: function (container) {
            let giftsChecked = false;
            for (let input of this.input) {
                if (input.checked) {
                    giftsChecked = true;
                    break;
                }
            }
            if (!giftsChecked) return;

            printInput(container, this.input, inputs => {
                let result = "";
                for (let input of inputs) {
                    if (input.checked) {
                        const textSpan = input.nextElementSibling;
                        result += `${textSpan.innerText}; `;
                    }
                }
                return result;
            });
        }
    },
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

        setFormValidity();
    }

});


form.addEventListener("input", (event) => {
    event.stopPropagation();
    const input = event.target;

    for (let inp of formInputs) {
        if (inp.input instanceof NodeList && inp.input.item(0).name === input.name ||
            inp.input.name === input.name) {
            if (inp.inputError === undefined) {
                break;
            }
            if (inp.isValid(inp.input)) {
                inp.inputError.innerText = ""; // Reset the content of the message
                inp.inputError.className = "error"; // Reset the visual state of the message
            } else {
                inp.input.className = "error active";
                inp.inputError.innerText = "The field is invalid";
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
    if (deliveryDate.valueMissing || date < tomorrow) {
        return false;
    }
    return true;
}


function isFormValid() {
    for (const inputData of formInputs) {
        if (!inputData.isValid(inputData.input)) {
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

function showSentInfo() {
    submitBtn.disabled = true;

    const form = document.getElementById("order-form");
    form.classList.add("hidden");

    const summary = document.getElementById("summary");
    while (summary.firstChild) {
        summary.removeChild(summary.firstChild);
    }

    addElement(summary, "h2", "form-summary__header", "The order was created: ");


    for (let inputData of formInputs) {
        inputData.print(summary);
    }
    summary.classList.add("visible");
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    showSentInfo();
});


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