// semantics.js
// Language's semantic rules

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                               Variable Declarations
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Functions table
let funcTable = null

// Function name to know where to add its variables
let funcName = ''

// Type for ids and funcs
let currType = ''

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
currFuncName = (name) => {
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
}

// Adds a variable to the varTable of its respective function
addVarsToVarTable = () => {
    // When this function is called, these variables hold the following values
    /*
        funcName --> Name of the function whose varTable I'll be accessing
        idList   --> Array with the names of the variables that will be added to the varTable
        currType --> Type of the variables
    */
    
    //console.log("FUNCNAME: ", funcName, "IDLIST: ", idList, "CURRTYPE: ", currType)
    
    // Loop through idList and add each variable
    for(let i=0; i<idList.length; i++) {
        if(funcTable.get(funcName).varTable.has(idList[i])) {
            throw new Error(`Multiple declaration. A variable with the name ${idList[i]} already exists`)
        } else {
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