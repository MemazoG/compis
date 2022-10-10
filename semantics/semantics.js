// semantics.js
// Gathers the language's semantic rules

// Functions table
let funcTable = new Map()

// Id list (for variable declarations)
let idList = []

// Type for functions
let funcType = ''

// Type for ids
let idType = ''


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Sets funcType to "-"
setProgramFuncType = () => {
    funcType = "-"
}

// Registers a function to funcTable
addToFuncTable = (funcId) => {
    // Checks if function already exists
    if(funcTable.has(funcId)) {
        throw new Error(`A function with the name "${funcId}" already exists`)
    }
    else {
        // Adds a new function with its name (key), type, and respective varTable
        funcTable.set(funcId, {
            name: funcId,
            type: funcType,
            varTable: new Map()
        })
    }
}