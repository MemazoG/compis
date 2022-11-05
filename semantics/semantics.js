// semantics.js
// Language's semantic rules

let Queue = require("queue-fifo")
let Stack = require("stack-lifo")
const semanticCube = require("./semanticCube")

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                               Variable Declarations
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Quadruples
let quadruples = []

// Stacks used for intermediate code generation
let operandStack = new Stack()
let operatorStack = new Stack()
let typeStack = new Stack()
let jumpStack = new Stack()

// DS to deal with temps
let temps = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13", "t14", "t15", "t16", "t17", "t18", "t19", "t20"]
let temp_i = 0

// Functions table
let funcTable = null

// Function name to know where to add its variables
let funcName = ""

// Type for ids and funcs
let currType = ""

// For handling dimensions of variables
let dimX = 1
let dimY = 1

// Id list (for variable declarations)
let idList = []

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                      Functions
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Creates funcTable
createFuncTable = () => {
    funcTable = new Map()
}

// Sets funcType to the value passed
setCurrType = (t) => {
    currType = t
}

// Assigns the current function name to funcName
setCurrFuncName = (name) => {
    funcName = name
}

// Registers a function to funcTable
addFuncToFuncTable = (funcId) => {
    // Checks if function already exists
    if(funcTable.has(funcId)) {
        throw new Error(`Multiple declaration. A function with the name "${funcId}" already exists`)
    }
    else {
        // Adds a new function with its name (key), type, and respective varTable
        funcTable.set(funcId, {
            name: funcId,
            type: currType,
            varTable: new Map()
        })
    }
}

// Adds an id to idList (because we don't know their type yet)
addIdToIdList = (id) => {
    idList.push(id)
    idList.push({
        name: id,
        x: dimX,
        y: dimY})
}

// Adds a variable to the varTable of its respective function
addVarsToVarTable = () => {
    /*
        funcName --> Name of the function whose varTable will be accessed
        idList   --> Array with the names of the variables that will be added to the varTable
        currType --> Type of the variables
    */
    
    //console.log("FUNCNAME: ", funcName, "IDLIST: ", idList, "CURRTYPE: ", currType)
    
    // Loop through idList and add each variable
    for(let i=0; i<idList.length; i++) {
        // If an entry already exists, it means multiple declaration
        if(funcTable.get(funcName).varTable.has(idList[i])) {
            throw new Error(`Multiple declaration. A variable with the name ${idList[i]} already exists`)
        } else {
            // If not, add it to the varTable
            funcTable.get(funcName).varTable.set(idList[i], {
                type: currType,
                value: ":)"
            })
        }
    }
    //console.log(funcTable.get(funcName))
    //console.log("")
}

// Clears the array idList because its contents have already been used
clearIdList = () => {
    idList = []
}

// Adds operand to operandStack
addToOperandStack = (opd) => {
    operandStack.push(opd)
}

// Adds operator to operatorStack
addToOperatorStack = (oper) => {
    operatorStack.push(oper)
}

// Adds the type of an operator to typeStack
addToTypeStack = (opd) => {
    // Checks if the operand exists in the variable directory. If not, variable does no exist
    if(!funcTable.get(funcName).varTable.has(opd)) {
        throw new Error(`Undefined variable. The variable ${opd} has not been declared`)
    }
    typeStack.push(funcTable.get(funcName).varTable.get(opd).type)
}

// Generates a quadruple for a print statement
generateWriteQuadruple = () => {
    const res = operandStack.peek()
    operandStack.pop()

    generateQuadruple("print", "", "", res)
}

// Generates a quadruple for a read statement
generateReadQuadruple = (varName) => {
    //console.log(`Tratando de leer variable ${varName}`)
    // Check if variable exists in the current scope (global, function)
    if(funcTable.get(funcName).varTable.has(varName)) {
        // Found - Generate quadruple
        generateQuadruple("read", "", "", "varName")
    } else {
        // Not Fount - Throw error
        throw new Error(`Undefined variable. The variable ${varName} was not found in current scope`)
    }
}

// Generates a quadruple
generateQuadruple = (op, opd1, opd2, res) => {
    quadruples.push({op, opd1, opd2, res})
}

checkOperatorStack = (operators) => {
    // If operatorStack has one of the elements in operators at the top, solve (generate quadruple)
    if(!operatorStack.isEmpty() && operators.includes(operatorStack.peek())) {
        // Operator
        let op = operatorStack.peek()
        operatorStack.pop()

        // Right operand
        let rightOpd = operandStack.peek()
        operandStack.pop()

        // Right operand type
        let rightOpdType = typeStack.peek()
        typeStack.pop()

        // Left operand
        let leftOpd = operandStack.peek()
        operandStack.pop()

        // Left operand type
        let leftOpdType = typeStack.peek()
        typeStack.pop()

        // Consult semantic cube
        resultType = semanticCube(leftOpdType, rightOpdType, op)

        if(resultType === "error") {
            throw new Error(`Type mismatch. The operator ${op} cannot be applied to the types ${leftOpdType} and ${rightOpdType}`)
        }

        // Store result, its type, and generate quadruple
        let result = temps[temp_i]
        temp_i++
        generateQuadruple(op, leftOpd, rightOpd, result)

        operandStack.push(result)
        typeStack.push(resultType)
    }
}

// Inserts a "(" symbol to operatorStack, which helps when dealing with operations between parentheses
insertFakeBottom = () => {
    operatorStack.push("(")
}

// Removes top element of operatorStack, which will be "(" when this function is called
removeFakeBottom = () => {
    operatorStack.pop()
}

// Assigns the result of an expression to a variable
// Pops 1 element from operatorStack (=) and 2 from operandStack (the result of the expression and the variable where it must be assigned),
// and generates the assignation quadruple
assignToVar = () => {
    // Operator (=)
    const op = operatorStack.peek()
    operatorStack.pop()

    // Expression result and its type
    const exprRes = operandStack.peek()
    const exprResType = typeStack.peek()
    operandStack.pop()
    typeStack.pop()

    // Where it must be assigned
    const varName = operandStack.peek()
    const varNameType = typeStack.peek()
    operandStack.pop()
    typeStack.pop()

    // Checking types before proceeding with quadruple generation
    if(exprResType !== varNameType) {
        throw new Error(`Type mismatch. An expression of type ${exprResType} cannot be assigned to a variable of type ${varNameType}`)
    }

    generateQuadruple(op, exprRes, "-", varName)
}


endStuff = () => {
    console.log("- - - QUADRUPLES - - -")
    console.log(quadruples)

    console.log("- - - OPERAND STACK SIZE - - -")
    console.log(operandStack.size())

    console.log("- - - OPERATOR STACK SIZE - - -")
    console.log(operatorStack.size())

    //console.log("- - - FUNC DIR - - -")
    //console.log(funcTable)
}
