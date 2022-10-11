// semanticCube.js
// Semantic "cube" that determines the result type of an operator applied to 2 operands
// Uses arithmetic algebra, so relational operators return "int"

// Access to an entry in semCube looks like: 
// semCube["operand1"]["operand2"]["operator"]
const semCube = {
    int: {
        int: {
            "+": "int",
            "-": "int",
            "*": "int",
            "/": "int",
            ">=": "int",
            ">": "int",
            "<=": "int",
            "<": "int",
            "==": "int",
            "!=": "int",
            "&": "error",
            "|": "error",
        },
        float: {
            "+": "float",
            "-": "float",
            "*": "float",
            "/": "float",
            ">=": "int",
            ">": "int",
            "<=": "int",
            "<": "int",
            "==": "int",
            "!=": "int",
            "&": "error",
            "|": "error",
        },
        char: {
            "+": "error",
            "-": "error",
            "*": "error",
            "/": "error",
            ">=": "error",
            ">": "error",
            "<=": "error",
            "<": "error",
            "==": "error",
            "!=": "error",
            "&": "error",
            "|": "error",
        }
    },
    float: {
        int: {
            "+": "float",
            "-": "float",
            "*": "float",
            "/": "float",
            ">=": "int",
            ">": "int",
            "<=": "int",
            "<": "int",
            "==": "int",
            "!=": "int",
            "&": "error",
            "|": "error",
        },
        float: {
            "+": "float",
            "-": "float",
            "*": "float",
            "/": "float",
            ">=": "int",
            ">": "int",
            "<=": "int",
            "<": "int",
            "==": "int",
            "!=": "int",
            "&": "error",
            "|": "error",
        },
        char: {
            "+": "error",
            "-": "error",
            "*": "error",
            "/": "error",
            ">=": "error",
            ">": "error",
            "<=": "error",
            "<": "error",
            "==": "error",
            "!=": "error",
            "&": "error",
            "|": "error",
        }
    },
    char: {
        int: {
            "+": "error",
            "-": "error",
            "*": "error",
            "/": "error",
            ">=": "error",
            ">": "error",
            "<=": "error",
            "<": "error",
            "==": "error",
            "!=": "error",
            "&": "error",
            "|": "error",
        },
        float: {
            "+": "error",
            "-": "error",
            "*": "error",
            "/": "error",
            ">=": "error",
            ">": "error",
            "<=": "error",
            "<": "error",
            "==": "error",
            "!=": "error",
            "&": "error",
            "|": "error",
        },
        char: {
            "+": "error",
            "-": "error",
            "*": "error",
            "/": "error",
            ">=": "error",
            ">": "error",
            "<=": "error",
            "<": "error",
            "==": "int",
            "!=": "int",
            "&": "error",
            "|": "error",
        }
    }
}

//const o1 = "int", o2 = "float", op = "*"
//console.log(semCube[o1][o2][op])

function semanticCube(operand1, operand2, operator) {
    return semCube[operand1][operand2][operator]
}

module.exports = semanticCube
