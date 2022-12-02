// operationCodes.js
// Contains the numeric value representation of each operation available in the language
// Allows for quadruples to be generated as 4 numbers

const operations = {
    "+": 1,
    "-": 2,
    "*": 3,
    "/": 4,
    ">": 5,
    ">=": 6,
    "<": 7,
    "<=": 8,
    "==": 9,
    "!=": 10,
    "&": 11,
    "|": 12,
    "=": 13,
    "goToF": 14,
    "goToV": 15,
    "goTo": 16,
    "read": 17,
    "print": 18,
    "gosub": 19,
    "era": 20,
    "param": 21,
    "endfunc": 22,
}

// Function that receives the operation code name and returns its assigned number
function getOpCode(opCode) {
    return operations[opCode]
}

module.exports = getOpCode