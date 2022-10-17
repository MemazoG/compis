// semantics.js
// Language's semantic rules

let Queue = require("queue-fifo")
let Stack = require("stack-lifo")
const semanticCube = require("./semanticCube")

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                               Variable Declarations
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Stacks used for intermediate code generation
let operandStack = new Stack()
let operatorStack = new Stack()
let typeStack = new Stack()
let jumpStack = new Stack()

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

// Sets