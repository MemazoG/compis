// semantics.js
// Language's semantic rules

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                      Imports
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let Queue = require("queue-fifo")
let Stack = require("stack-lifo")
const semanticCube = require("./semanticCube")
const getOpCode = require("./operationCodes")
const VirtualMemory = require("./virtualMemory")

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                               Variable Declarations
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Virtual memory
let virtualMemory = null

// Relevant DS for virtual machine
// Declared as a GLOBAL OBJECT, so it can be used in ANY of the files without explicitly exporting it
// Used in parse.js to pass it to the virtual machine
relevantDSVM = null

// Quadruples
let quadruples = []

// Stacks used for intermediate code generation
let operandStack = new Stack()
let operatorStack = new Stack()
let typeStack = new Stack()
let jumpStack = new Stack()

// Program name
let programName = ""

// Functions table
let funcTable = null

// Constants table
let constantsTable = null

// Function name to know where to add its variables
let funcName = ""

// Type for ids and funcs
let currType = ""

// Stores the name of the function called. It's a stack because of functions being called within functions
let funcCalled = new Stack()

let currVarName = null

// Holds id of current variable
let currId = null

let dimensionsStack = new Stack()
let currDim = new Stack()
let currDimList = new Stack()
let dim2 = false

// Id list (for variable declarations)
let idList = []

// Parameter list (for parameter list of functions)
let paramList = []

// Parameter name list (used to distinguish parameters from other local vars in the varTable)
let paramNameList = []

// Iterates over params during the matching in function call
let paramCount = new Stack()
let paramTypes = new Stack()

// True when a return statement is identified inside non-void function
let hasReturnStmt = false

// Helps with counting number of variables of each type inside a function
let funcSizes = null

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                      Functions
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Creates funcTable and initializes the virtual memory
createFuncTable = () => {
    funcTable = new Map()
    virtualMemory = new VirtualMemory()
}

// Creates constantsTable
createConstantsTable = () => {
    constantsTable = new Map()
}

// Sets funcType to the value passed
setCurrType = (t) => {
    currType = t
}

// Assigns the current function name to funcName
setCurrFuncName = (name) => {
    funcName = name
}

// Assigns program id to programName
// This variable will help differentiate if funcName refers to a local function or the global environment (= programName)
setProgramId = (name) => {
    programName = name
}

// Registers a function to funcTable
addFuncToFuncTable = (funcId) => {
    //console.log(`- - - Agregando funcion ${funcId} de tipo ${currType} a funcTable`)
    // Checks if function already exists
    if(funcTable.has(funcId)) {
        throw new Error(`Multiple declaration. A function with the name "${funcId}" already exists`)
    }
    else {
        // Adds a new function with its name (key), type, and respective varTable
        funcTable.set(funcId, {
            type: currType,
            varTable: new Map(),
            funcSizeCount: new Map(),
        })

        // PARCHE GUADALUPANO - If functions returns something (NOT void), create a global variable with its name (helps with the return)
        if(currType === "int" || currType === "float" || currType === "char") {
            // Assign an address
            const funcVarAddr = virtualMemory.reserveAddress("global", currType, "regular")
            // Create entry in current func's varTable
            funcTable.get(programName).varTable.set(funcId, {
                type: currType,
                vAddr: funcVarAddr
            })
            // Mark the return address to the newly created variable for the function
            funcTable.get(funcId).retAddress = funcVarAddr
        }
    }
}

// Adds an id to idList (because we don't know their type yet)
addIdToIdList = (id) => {
    //idList.push(id)
    idList.push({ name: id, x: 0, y: 0})

    currVarName = id
}

updateXDim = (val) => {
    // Throw error if size is less than 1
    if(parseInt(val) < 1) {
        throw new Error(`Dimension sizes for arrays and matrices must be greater than 0`)
    }

    for(let i = 0; i < idList.length; i++) {
        if(idList[i].name === currVarName) {
            // Update entry's X dimension value
            idList[i].x = parseInt(val)
        }
    }
}

updateYDim = (val) => {
    // Throw error if size is less than 1
    if(parseInt(val) < 1) {
        throw new Error(`Dimension sizes for arrays and matrices must be greater than 0`)
    }

    for(let i = 0; i < idList.length; i++) {
        if(idList[i].name === currVarName) {
            // Update entry's Y dimension value
            idList[i].y = parseInt(val)
        }
    }
}

setCurrId = (idName) => {
    currId = idName
}

addIdOperand = () => {
    addToTypeAndOperandStacks(currId, "var")
    
    currId = null
}

arrMatStart = () => {
    const opdAddress = operandStack.peek()
    const opdType = typeStack.peek()

    operandStack.pop()
    typeStack.pop()

    let baseAddress = arrMatId = arrMatType = null
    let foundLocally = foundGlobally = false

    // Search in current function's varTable
    for(let [id, value] of funcTable.get(funcName).varTable) {
        if(value.vAddress === opdAddress) {
            if(value.dimension === null) {
                throw new Error(`Trying to access an index of a variable that has no dimensions`)
            }

            arrMatId = id
            arrMatType = value.type
            currDimList.push(value.dimension)
            baseAddress = value.vAddress
            foundLocally = true // Found in local environment
            break
        }
    }

    // If it was not found locally
    if(!foundLocally) {
        // Search in global function's varTable
        for(let [id, value] of funcTable.get(programName).varTable) {
            if(value.vAddress === opdAddress) {
                if(value.dimension === null) {
                    throw new Error(`Trying to access an index of a variable that has no dimensions`)
                }

                arrMatId = id
                arrMatType = value.type
                currDimList.push(value.dimension)
                baseAddress = value.vAddress
                foundGlobally = true
                break
            }
        }
    }

    currDim.push(1)

    dimensionsStack.push({
        arrMatId,
        dimension: currDim.peek(),
        baseAddress,
        type: arrMatType,
        foundGlobally
    })

    insertFakeBottom()
}

arrMatDimension = () => {
    // Get index value from the top of operandStack
    const indexingVar = operandStack.peek()
    const indexingVarType = typeStack.peek()

    // Check indexing variable's type
    if(indexingVarType !== "int") {
        throw new Error(`Indexing variable must be of type int`)
    }

    if(currDimList.peek() === null) {
        throw new Error(`Trying to access the index of a variable that does not have the specified dimensions`)
    }

    // Generate VERIFY quadruple
    generateQuadruple(getOpCode("verify"), indexingVar, "-", addToConstantsTable(currDimList.peek().limSup, "int"))
    // generateQuadruple(getOpCode("verify"), indexingVar, "-", currDimList.peek().limSup)

    
    let scope
    if(funcName === programName) {
        // Current funcName === programName --> Scope of variables is GLOBAL
        scope = "global"
    } else {
        // Current funcName != programName --> Scope of variables is LOCAL
        scope = "local"
    }

    const type = dimensionsStack.peek().type === "char" ? "int" : dimensionsStack.peek().type

    if(currDimList.peek().next !== null) {
        // console.log("MATRIX")
        // s1 * m1 quadruple
        const resAddress = virtualMemory.reserveAddress(scope, type, "temp")
        generateQuadruple(getOpCode("*"), indexingVar, addToConstantsTable(currDimList.peek().m, "int"), resAddress)

        operandStack.pop()
        typeStack.pop()

        operandStack.push(resAddress)
        typeStack.push(type)
    }

    if(currDim.peek() > 1) {
        // console.log("MATRIX")
        // (s1 * m1) + s2 quadruple
        const right = operandStack.peek()
        operandStack.pop()
        typeStack.pop()
        const left = operandStack.peek()
        operandStack.pop()
        typeStack.pop()

        const resAddress = virtualMemory.reserveAddress(scope, type, "temp")

        generateQuadruple(getOpCode("+"), left, right, resAddress)
        // console.log(`ARRMATDIM Suma ${left} con ${right} y dejalo en ${resAddress}`)

        operandStack.push(resAddress)
        typeStack.push(type)
        dim2 = true
    }
}

addArrMatDimension = () => {
    let newVal = currDim.peek() + 1
    currDim.pop()
    currDim.push(newVal)

    dimensionsStack.peek().dimension = currDim.peek()
    
    newVal = currDimList.peek().next
    currDimList.pop()
    currDimList.push(newVal)
}

arrMatEnd = () => {
    // Verify it is a matrix (has a second node)
    const isMat = currDimList.peek().next !== null

    if(isMat && !dim2) {
        throw new Error(`Trying to access the index of a variable that does not have the specified dimensions`)
    }

    const auxOpd = operandStack.peek()
    operandStack.pop()
    typeStack.pop()

    const baseVAddress = dimensionsStack.peek().baseAddress
    const isGlobal = dimensionsStack.peek().foundGlobally

    const left = auxOpd
    const right = addToConstantsTable(baseVAddress, "int")
    // console.log("Guardé a", baseVAddress, "en la tabla de constantes y se guardó en la", right)

    const scope = isGlobal ? "global" : funcName == programName ? "global" : "local"
    const type = dimensionsStack.peek().type
    const resAddress = virtualMemory.reserveAddress(scope, type, "pointer")

    // Update funcSizes
    funcSizes.get("pointersSizes")[type]++

    generateQuadruple(getOpCode("+"), left, "(" + right, resAddress)

    // console.log(`ARRMATEND Suma ${auxOpd} con ${right} y dejalo en ${resAddress}`)
    // console.log("{ + ,", left, right, resAddress, "}")

    operandStack.push(resAddress)
    typeStack.push(type)

    removeFakeBottom()
    dimensionsStack.pop()

    // Clear values from dimension helpers
    currDim.pop()
    currDimList.pop()
    dim2 = false
}

// Adds a variable to the varTable of its respective function
addVarsToVarTable = () => {
    /*
        funcName --> Name of the function whose varTable will be accessed
        idList   --> Array with the names of the variables that will be added to the varTable
        currType --> Type of the variables
    */
    let scope
    if(funcName === programName) {
        // Current funcName === programName --> Scope of variables is GLOBAL
        scope = "global"
    } else {
        // Current funcName != programName --> Scope of variables is LOCAL
        scope = "local"
    }
    
    // Loop through idList and add each variable
    for(let i=0; i<idList.length; i++) {
        // If an entry already exists, it means multiple declaration
        if(funcTable.get(funcName).varTable.has(idList[i].name)) {
            throw new Error(`Multiple declaration. A variable with the name ${idList[i].name} already exists`)
        } else {
            // If not, add it to the varTable

            if(idList[i].x === 0 && idList[i].y === 0) {
                // ATOMIC VARIABLE
                // Add it to the varTable (reserve 1 spot in virtual memory)
                funcTable.get(funcName).varTable.set(idList[i].name, {
                    type: currType,
                    vAddress: virtualMemory.reserveAddress(scope, currType, "regular")
                })
            } else if(idList[i].x > 0 && idList[i].y === 0) {
                // ARRAY
                //console.log("ARRAY")

                // Dimension node
                let dimNode = {
                    limSup: idList[i].x - 1,
                    m: 1,
                    next: null,
                }

                // Add it to the varTable (reserve idList[i].x spots in virtual memory)
                funcTable.get(funcName).varTable.set(idList[i].name, {
                    type: currType,
                    vAddress: virtualMemory.reserveMultipleAddresses(scope, currType, "regular", idList[i].x),
                    dimension: dimNode,
                })

            } else {
                // MATRIX
                //console.log("MATRIX")

                // Dimension node for columns (2nd node)
                let dimNodeCols = {
                    limSup: idList[i].y - 1,
                    m: 1,
                    next: null,
                }

                // Dimension node for rows (1st node)
                let dimNodeRows = {
                    limSup: idList[i].x - 1,
                    m: idList[i].y,
                    next: dimNodeCols,
                }

                // Get total number of indices to reserve that size in virtual memory
                const totalSize = idList[i].x * idList[i].y

                // Add it to the varTable (reserve its respective spots in virtual memory)
                funcTable.get(funcName).varTable.set(idList[i].name, {
                    type: currType,
                    vAddress: virtualMemory.reserveMultipleAddresses(scope, currType, "regular", totalSize),
                    dimension: dimNodeRows,
                })
                
            }
        }
    }
    //console.log(funcTable.get(funcName))
    //console.log("")
    clearIdList()
}

// Clears the array idList because its contents have already been used
clearIdList = () => {
    //console.log(idList)
    idList = []
}

// Inserts a parameter into the function's varTable and adds it to the paramList
registerParam = () => {
    // Add name to paramNameList, so I can differentiate parameters from other local variables in the function's varTable
    // PARCHE GUADALUPANO
    paramNameList.push(idList[0].name)

    // Call function that will add it to varTable of the function
    addVarsToVarTable()

    // Add the type of the current parameter into paramList
    // Entire list will be added when the closing parenthesis of the function is read
    paramList.push(currType)
}

// Attach paramList to the current function (function signature). Clear paramList var when done for any other functions to come
attachParamList = () => {
    funcTable.get(funcName).paramTypeList = paramList

    // Clear paramList
    paramList = []
}

// Counts local vars by their type, by taking the varTable and counting the types that are NOT parameters
countLocalVars = () => {
    let localVars = {
        int: 0,
        float: 0,
        char: 0
    }

    // Iterate over varTable and count variables that are NOT parameters by their type
    for(let [key, value] of funcTable.get(funcName).varTable) {
        if(!paramNameList.includes(key)) {
            // Contabilize its type
            if(value.type === "int") {
                localVars.int++
            } else if(value.type === "float") {
                localVars.float++
            } else {
                localVars.char++
            }
        }
    }

    // Clear paramNameList of its contents so it can work with functions that follow
    paramNameList = []

    // Insert into funcTable the number of localVars
    //funcTable.get(funcName).localVars = localVars
    funcSizes = new Map()
    funcSizes.set("varsSizes", localVars)
    funcSizes.set("tempsSizes", {int: 0, float: 0, char: 0})
    funcSizes.set("pointersSizes", {int: 0, float: 0, char: 0})

    funcTable.get(funcName).funcSizeCount = funcSizes
}

// Save into funcTable the current quadruple, marks function start quadruple
funcQuadruplesStart = () => {
    funcTable.get(funcName).start = quadruples.length
}

// Function ends. Delete its varTable, generate ENDFUNC action, insert the number of temps used into funcTable. If not a void-function, check if something has been returned
funcEnd = () => {
    // If function is non-void, check if something has been returned
    if(funcTable.get(funcName).type !== "void") {
        if(!hasReturnStmt) {
            throw new Error(`Non-void functions must have at least one return statement.`)
        }
    }

    // Delete varTable
    funcTable.get(funcName).varTable = null

    // Generate ENDFUNC action
    generateQuadruple(getOpCode("endfunc"), "-", "-", "-")

    // Count temps and add the number to funcTable
    let tempVars = {
        int: virtualMemory.countTemps("int"),
        float: virtualMemory.countTemps("float"),
        char: virtualMemory.countTemps("char")
    }
    //funcTable.get(funcName).tempVars = tempVars

    funcSizes.get("tempsSizes").int = tempVars.int
    funcSizes.get("tempsSizes").float = tempVars.float
    funcSizes.get("tempsSizes").char = tempVars.char

    // Function is over, can clear the virtual memory of its variables
    virtualMemory.clearLocalAddresses()

    funcSizes = null
    hasReturnStmt = false
}

// Function that receives a name and checks if it is registered in funcTable
verifyFuncExists = (name) => {
    console.log("- - - - -", name, "- - - - - ")
    if(funcTable.has(name)) {
        // Function exists. Store its name in funcCalled to remember its name when generating ERA quadruple
        funcCalled.push(name)
        insertFakeBottom()
    } else {
        // Function does not exist --> ERROR
        throw new Error(`Function does not exist.`)
    }
}

// Function that uses the name stored in currId and checks if it is registered as a function in funcTable
funcStart = () => {
    funcCalled.push(currId)
    // console.log("-----", currId, "-----")
    currId = null
    if(!funcTable.has(funcCalled.peek())) {
        throw new Error(`Function does not exist.`)
    }
    insertFakeBottom()
}

// Generate ERA quadruple and prepare for parameter matching
generateEra = () => {
    generateQuadruple(getOpCode("era"), funcCalled.peek(), "-", "-")

    // Prepare for parameter matching
    paramCount.push(1)
    const currFuncSignature = funcTable.get(funcCalled.peek()).paramTypeList
    //console.log(currFuncSignature)
    paramTypes.push(currFuncSignature)
}

// Matches the current argument (top of operandStack) with the current param
matchParam = () => {
    if(paramCount.peek() - 1 >= paramTypes.peek().length) {
        throw new Error(`Parameter number mismatch`)
    }

    const currArg = operandStack.peek()
    operandStack.pop()

    const argType = typeStack.peek()
    typeStack.pop()

    if(argType === paramTypes.peek()[paramCount.peek() - 1]) {
        // Type matches
        const resParam = paramCount.peek()
        generateQuadruple(getOpCode("param"), currArg, "-", resParam)

        // Move param counter
        const currParamNum = paramCount.peek()
        paramCount.pop()
        paramCount.push(currParamNum + 1)
    } else {
        // Does not match
        //console.log("ARGUMENT TYPE:", argType)
        //console.log("EXPECTED:", paramTypes.peek()[paramCount.peek() - 1])
        throw new Error(`Argument does not match parameter.`)
    }
}

// Verify that there are no missing parameters (call has less than expected)
paramsEnd = () => {
    if(paramCount.peek() - 1 !== paramTypes.peek().length) {
        throw new Error(`Parameter number mismatch.`)
    }
}

// Function call has ended. Generate GOSUB quadruple
funcCallEnd = () => {
    // Get function's starting quadruple
    const funcStartQuadruple = funcTable.get(funcCalled.peek()).start

    // Generate quadruple
    generateQuadruple(getOpCode("gosub"), funcCalled.peek(), "-", funcStartQuadruple)

    removeFakeBottom()
}

// Pops the top of the stacks used for functions, as the top element is not needed anymore
popFuncStacks = () => {
    funcCalled.pop()
    paramCount.pop()
    paramTypes.pop()
}

// Handles the return of the value for non-void functions
funcReturn = () => {
    // Throws an error if the function called is void, as they do not return anything
    if(funcTable.get(funcCalled.peek()).type === "void") {
        throw new Error(`The function called is of type void and does not return any value`)
    }

    // Return type of current function
    const funcReturnType = funcTable.get(funcCalled.peek()).type

    // "Secret" global variable where the return value will be placed
    const returnAddress = funcTable.get(programName).varTable.get(funcCalled.peek()).vAddr
    
    //console.log("- - - - -", funcName, "- - - - - ")
    // Let's know where the function was called from: from main (global environment) or from another function (local environment)
    let scope
    if(funcName == programName) {
        // From main - Global environment
        scope = "global"
    } else {
        scope = "local"
    }

    // console.log(funcTable.get(programName).varTable.get(funcCalled.peek()))
    // console.log(`FUNCTION NAME --> ${funcCalled.peek()}.Func return type --> ${funcReturnType}. Func return address --> ${returnAddress}`)
    // Reserve an address to store value
    const virtAddress = virtualMemory.reserveAddress(scope, funcReturnType, "temp")

    // Generate quadruple
    generateQuadruple(getOpCode("="), returnAddress, "-", virtAddress)

    operandStack.push(virtAddress)
    typeStack.push(funcReturnType)
}

// Return statement
handleReturn = () => {
    // Checks if current function is the main or of type void
    if(funcName === programName) {
        throw new Error(`Return statements can only be placed inside non-void functions`)
    } else if(funcTable.get(funcName).type === "void") {
        throw new Error(`Return statements cannot be placed in void functions.`)
    }

    // Get return value and type from the top of the operand and type stack
    const res = operandStack.peek()
    operandStack.pop()
    const resType = typeStack.peek()
    typeStack.pop()
    // console.log(operandStack.size(), typeStack.size())

    // // If returned type is different than return type of function, throw error
    if(resType !== funcTable.get(funcName).type) {
        throw new Error(`Return type mismatch.`)
    }

    generateQuadruple(getOpCode("return"), "-", "-", res)

    hasReturnStmt = true
}

// Adds the virtual address of the operand to operandStack
// Adds the type of the operand to typeStack
// Operand can be of 2 types: variable (var) or constants (int/float/char)
// For variables, search them locally first and globally if needed
// For constants, add them to constantsTable and get their virtual address
addToTypeAndOperandStacks = (opd, type) => {
    let cte, virtAddr, opdType

    if(type === 'var') {
        // Dealing with a variable
        // Search for it first LOCALLY, and if it's not found there, then GLOBALLY
        const foundInLocalScope = funcTable.get(funcName).varTable.has(opd)

        if(foundInLocalScope) {
            // Found, get its virtual address from LOCAL section
            virtAddr = funcTable.get(funcName).varTable.get(opd).vAddress
            opdType = funcTable.get(funcName).varTable.get(opd).type
        } else {
            // Not found, search GLOBAL scope
            const foundInGlobalScope = funcTable.get(programName).varTable.has(opd)

            if(foundInGlobalScope) {
                // Found, get its virtual address from GLOBAL section
                virtAddr = funcTable.get(programName).varTable.get(opd).vAddress
                opdType = funcTable.get(programName).varTable.get(opd).type
            } else {
                // Not found --> Variable out of scope/undefined
                throw new Error(`Undefined variable. The variable ${opd} has not been declared`)
            }
        }

    } else {
        // Dealing with a constant
        if(type === "int") {
            // Parse to int
            cte = parseInt(opd)
        } else if(type === "float") {
            // Parse to float
            cte = parseFloat(opd)
        } else {
            // Remove quote-marks from char
            cte = opd.slice(1, -1)
        }

        // Get a virtual address for the constant
        virtAddr = addToConstantsTable(cte, type)
        opdType = type
    }

    // Push virtual address to operandStack
    operandStack.push(virtAddr)
    // Push type to typeStack
    typeStack.push(opdType)
}

// Adds operator to operatorStack
addToOperatorStack = (oper) => {
    operatorStack.push(oper)
}

// Generates print quadruple for an expression
handleWriteExpression = () => {
    // Retrieve expression's result from operandStack
    const res = operandStack.peek()
    operandStack.pop()
    typeStack.pop()

    generateQuadruple(getOpCode("print"), "-", "-", res)
}

// Receives a string, assigns it a virtual address, and generates its print quadruple
handleWriteString = (cte) => {
    const virtAddr = addToConstantsTable(cte, "string")

    // Generate print quadruple
    generateQuadruple(getOpCode("print"), "-", "-", virtAddr)
}

// Receives a constant and adds it to constantsTable
addToConstantsTable = (cte, type) => {
    // Since maps DO NOT allow duplicate keys and some constant messages may be repeated, check for duplicates first
    if(!constantsTable.has(cte)) {
        // Constant does NOT exist in map. Assign it an address and add it
        const virtAddr = virtualMemory.reserveAddress("constant", type, "-")
        constantsTable.set(cte, virtAddr)
        return virtAddr
    } else {
        // Constant ALREADY exists in map. Return its virtual address
        return constantsTable.get(cte)
    }
}

// Generates a quadruple for a read statement
generateReadQuadruple = (varName) => {
    //console.log(`Tratando de leer variable ${varName}`)
    // Check if variable exists in the current scope (global, function)
    if(funcTable.get(funcName).varTable.has(varName)) {
        // Found - Generate quadruple
        const res = operandStack.peek()
        operandStack.pop()
        typeStack.pop()
        generateQuadruple(getOpCode("read"), "", "", res)
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

        // Get current scope
        let scope
        if(funcName === programName) {
            // Current funcName === programName --> Scope of variables is GLOBAL
            scope = "global"
        } else {
            // Current funcName != programName --> Scope of variables is LOCAL
            scope = "local"
        }

        // Reserve a temp address, store result and its type in address, and generate quadruple
        let tempVirtAddr = virtualMemory.reserveAddress(scope, resultType, "temp")
        generateQuadruple(getOpCode(op), leftOpd, rightOpd, tempVirtAddr)
        operandStack.push(tempVirtAddr)
        typeStack.push(resultType)

        // Register temp type to funcSizes
        funcSizes.get("tempsSizes")[resultType]++
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

    generateQuadruple(getOpCode(op), exprRes, "-", varName)
}

// Gets condition result from the if-statement and generates its quadruple
ifStart = () => {
    // Get condition (expression) result and its type
    const cond = operandStack.peek()
    const condType = typeStack.peek()
    operandStack.pop()
    typeStack.pop()
   
    // Check condition type
    if(condType !== "int") {
        throw new Error(`Type mismatch. Expression result needs to be of type int`)
    }

    // Generate quadruple (GotoF)
    generateQuadruple(getOpCode("goToF"), cond, "-", "?")

    // Register goToF quadruple into jumpStack
    jumpStack.push(quadruples.length - 1)
}

// Completes gotoF quadruple of ifStart
ifEnd = () => {
    // Get quadruple index from jumpStack
    const out = jumpStack.peek()
    jumpStack.pop()

    // Complete quadruple
    quadruples[out].res = quadruples.length
}

// Generates gotTo quadruple and completes goToF quadruple of ifStart
elseStmt = () => {
    // Generate goTo quadruple
    generateQuadruple(getOpCode("goTo"), "-", "-", "?")

    // Get quadruple index from jumpStack
    const gotofQuad = jumpStack.peek()
    jumpStack.pop()

    // Complete quadruple
    quadruples[gotofQuad].res = quadruples.length

    // Register goTo quadruple into jumpStack
    jumpStack.push(quadruples.length - 1)
}

// Saves point BEFORE the while's condition is evaluated
whileBreadcrumb = () => {
    jumpStack.push(quadruples.length)
}

// Gets condition result from while-statement, generates its goToF quadruple, and saves point in jumpStack
whileStart = () => {
    // Get condition (expression) result and its type
    const cond = operandStack.peek()
    const condType = typeStack.peek()
    operandStack.pop()
    typeStack.pop()

    // Check condition type
    if(condType !== "int") {
        throw new Error(`Type mismatch. Expression result needs to be of type int`)
    }

    // Generate quadruple (GotoF)
    generateQuadruple(getOpCode("goToF"), cond, "-", "?")

    // Register goToF quadruple into jumpStack
    jumpStack.push(quadruples.length - 1)
}

// Generates goTo quadruple for cycling and fills out incomplete gotoF quadruple from whileStart
whileEnd = () => {
    // Get goToF quadruple index
    const gotofQuad = jumpStack.peek()
    jumpStack.pop()

    // Get quadruple index where expression evaluation begins
    const returnToCond = jumpStack.peek()
    jumpStack.pop()

    // Generate goTo quadruple
    generateQuadruple(getOpCode("goTo"), "-", "-", returnToCond)

    // Complete goToF quadruple
    quadruples[gotofQuad].res = quadruples.length
}

// Saves point before block of statements begin in do-while
doWhileBreadcrumb = () => {
    jumpStack.push(quadruples.length)
}

// Gets breadcrumb from jumpStack, gets condition result from operandStack, and generates goToV quadruple
doWhileEnd = () => {
    // Retrieve "breadcrumb" (where block of statements begins)
    const ret = jumpStack.peek()
    jumpStack.pop()

    // Get condition (expression) result and its type
    const cond = operandStack.peek()
    const condType = typeStack.peek()
    operandStack.pop()
    typeStack.pop()

    // Check condition type
    if(condType !== "int") {
        throw new Error(`Type mismatch. Expression result needs to be of type int`)
    }

    // Generate goToV quadruple
    generateQuadruple(getOpCode("goToV"), cond, "-", ret)
}

// Generates a goTo quadruple that will be filled out when MAIN begins
// I do not register anthing to jumpStack because I know this will ALWAYS be the first quadruple
generateGoToMainQuadruple = () => {
    generateQuadruple(getOpCode("goTo"), "-", "-", "?")
}

// Completes goTo main quadruple, which is the first quadruple.
// Also adds to funcSizes the count of global variables
// Sets funcName to programName, which helps to know we are inside main and not another function
mainStart = () => {
    // console.log(funcTable.get(programName).varTable.get("mat"))
    quadruples[0].res = quadruples.length
    funcName = programName

    let vars = {int: 0, float: 0, char: 0}

    // Iterate through varTable of function and count each variable. Turn it into an array for simpler iteration
    const varTableArr = Array.from(funcTable.get(programName).varTable)
    for(let v of varTableArr) {
        if(v[1].type === "int"){
            vars.int++
        } else if(v[1].type == "float") {
            vars.float++
        } else {
            vars.char++
        }
    }

    // funcSizes will hold the number of variables of the function
    funcSizes = new Map()
    // At this point, the number of global vars can be added
    funcSizes.set("varsSizes", vars)
    // Create an entry for the temps, even though none have been counted (so initialize with 0s)
    funcSizes.set("tempsSizes", {int: 0, float: 0, char: 0})
    // Create an entry for the pointers (initialize with 0s)
    funcSizes.set("pointersSizes", {int: 0, float: 0, char: 0})
}

// Attaches funcSizes to the main function's entry in the funcTable. This contains the number of all variables used in it
mainEnd = () => {
    //console.log(funcSizes)
    funcTable.get(programName).funcSizeCount = funcSizes

    // Clears contents of funcSizes
    funcSizes = null
}

// Erases the contents of funcTable, as program has ended and there is no need for it anymore
// Before deleting it, stores all the relevant data structures for the virtual machine to use
deleteFuncTable = () => {
    // Store relevant data structures (quadruples, funcTable, and constantsTable) for virtual machine
    relevantDSVM = {quadruples, funcTable, constantsTable}

    // Delete funcTable
    funcTable = null
}

// Erases the contents of constantsTable, as program has ended and there is no need for it anymore
deleteConstantsTable = ()  => {
    constantsTable = null
}

// Erase the contents of every other DS used, as program has ended
deleteUsedDS = () => {
    // Quadruples
    quadruples = null

    // Stacks
    operandStack = null
    operatorStack = null
    typeStack = null
    jumpStack = null
}



// Gives one final look at the contents of the different DS used, before their deletion
endStuff = () => {
    // console.log("- - - QUADRUPLES - - -")
    // console.log(quadruples)

    // console.log("- - - OPERAND STACK SIZE - - -")
    // console.log(operandStack.size())

    // console.log("- - - OPERATOR STACK SIZE - - -")
    // console.log(operatorStack.size())

    // console.log("- - - FUNC DIR - - -")
    // for(const [key, value] of funcTable.entries()) {
    //     console.log(key, value)
    // }

    // console.log("- - - CONSTANTS TABLE - - -")
    // for(const [key, value] of constantsTable.entries()) {
    //    console.log(key, value)
    // }
}
