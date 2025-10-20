

export function checkpassword(password) {
    const checklist = [];

    checklist[0] = (!minCharacterLength(password)) ? 0 : 1;
    checklist[1] = (!containsNumber(password)) ? 0 : 1;
    checklist[2] = (!containsUppercase(password)) ? 0 : 1;
    checklist[3] = (!containsLowercase(password)) ? 0 : 1;
    checklist[4] = (!containsSpecialCharacters(password)) ? 0 : 1;
    checklist[5] = (noSpaces(password)) ? 0 : 1;

    return checklist;
}

function minCharacterLength(password) {
    if (password.length >= 8) return true;
    return false;
}

function noSpaces(password) {
    const pattern = /\s/;
    const contains = pattern.test(password);
    return contains;
}

function containsSpecialCharacters(password) {
    const pattern = /[^A-Za-z0-9\s]/;
    const contains = pattern.test(password);
    return contains;
}

function containsUppercase(password) {
    const pattern = /[A-Z]/;
    const contains = pattern.test(password);
    return contains;
}

function containsLowercase(password) {
    const pattern = /[a-z]/;
    const contains = pattern.test(password);
    return contains;
}

function containsNumber(password) {
    const pattern = /[0-9]/;
    const contains = pattern.test(password);
    return contains;
}
