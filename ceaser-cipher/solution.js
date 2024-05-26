function movingShift(s, shift) {
    const coded = encodeString(s, shift);
    return splitString(coded);
}

function encodeString(s, shift) {
    let encoded = '';
    let currentShift = shift;

    for (const element of s) {
        encoded += shiftChar(element, currentShift);
        currentShift++;
    }

    return encoded;
}

function shiftChar(char, shift) {
    const lowerA = 'a'.charCodeAt(0);
    const upperA = 'A'.charCodeAt(0);

    if (char >= 'a' && char <= 'z') {
        return String.fromCharCode((char.charCodeAt(0) - lowerA + shift) % 26 + lowerA);
    } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode((char.charCodeAt(0) - upperA + shift) % 26 + upperA);
    } else {
        return char;
    }
}

function splitString(s) {
    const partSize = Math.ceil(s.length / 5);
    const parts = [];

    for (let i = 0; i < 5; i++) {
        parts.push(s.slice(i * partSize, (i + 1) * partSize));
    }

    return parts;
}

// Example usage:
const s = "I should have known that you would have a perfect answer for me!!!";
const shift = 1;
console.log(movingShift(s, shift));
