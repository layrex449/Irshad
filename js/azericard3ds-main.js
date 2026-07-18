const submitButton = document.getElementById("submitBtn");
document.addEventListener("DOMContentLoaded", function () {
    securitycode.addEventListener("input", toggleSubmitButton);

    securitycode.addEventListener("input", function () {
        securitycode.focus();
        toggleSubmitButton();
    });

    function toggleSubmitButton() {
        if (
            securitycode.value.length >= 4 &&
            securitycode.value.length <= 6
        ) {
            submitButton.removeAttribute("disabled");
        } else {
            submitButton.setAttribute("disabled", "disabled");
        }
    }
});
