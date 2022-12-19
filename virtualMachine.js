// virtualMachine.js
// Virtual machine that simulates a computer and executes the quadruples received (intermediate code representation)

let Stack = require("stack-lifo")
const Memory = require("./Memory")
// For read statement
const readline = require("readline")
const { exec } = require("child_process")

// Declare main structures globally so they can be accessed by the different functions
let codeSegment, funcTable, constantsTable, dataSegment
let executionStackSize, executionStackMax
let executionStack = new Stack()
let funcCalls = new Stack()

// Offsets for GLOBAL variables and temps (starting virtual addresses)
const globalOffsets = {
    intVarsOff: 1000,
    floatVarsOff: 3000,
    charVarsOff: 5000,
    intTempsOff: 2000,
    floatTempsOff: 4000,
    charTempsOff: 6000,
    intPointersOff: 17000,
    floatPointersOff: 18000,
    charPointersOff: 19000,
}

const localOffsets = {
    intVarsOff: 7000,
    floatVarsOff: 9000,
    charVarsOff: 11000,
    intTempsOff: 8000,
    floatTempsOff: 10000,
    charTempsOff: 12000,
    intPointersOff: 20000,
    floatPointersOff: 21000,
    charPointersOff: 22000,
}

// Returns a type (int/float/char) given an address
function getType(address) {
    if(isGlobal(address)) {
        // GLOBAL
        if((address >= 1000 && address < 3000) || (address >= 17000 && address < 18000)) {
            return "int"
        } else if((address >= 3000 && address < 5000) || (address >= 18000 && address < 19000)) {
            return "float"
        } else {
            return "char"
        }
    } else {
        // LOCAL
        if((address >= 7000 && address < 9000) || (address >= 20000 && address < 21000)) {
            return "int"
        } else if((address >= 9000 && address < 11000) || (address >= 21000 && address < 22000)) {
            return "float"
        } else {
            return "char"
        }
    }
}

// Returns an addrType (vars/temps) given an address and a type
function getAddrType(address, type) {
    // console.log("GET ADDR TYPE", address, type)
    if(isGlobal(address)) {
        // GLOBAL
        if(type === "int") {
            if(address >= 1000 && address < 2000) {
                return "vars"
            } else if(address >= 2000 && address < 3000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 1000 && address < 2000) ? "vars" : "temps")
        } else if(type === "float") {
            if(address >= 3000 && address < 4000) {
                return "vars"
            } else if(address >= 4000 && address < 5000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 3000 && address < 4000) ? "vars" : "temps")
        } else {
            if(address >= 5000 && address < 6000) {
                return "vars"
            } else if(address >= 6000 && address <7000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 5000 && address < 6000) ? "vars" : "temps")
        }
    } else {
        // LOCAL
        if(type === "int") {
            if(address >= 7000 && address < 8000) {
                return "vars"
            } else if(address >= 8000 && address < 9000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 7000 && address < 8000) ? "vars" : "temps")
        } else if(type === "float") {
            if(address >= 9000 && address < 10000) {
                return "vars"
            } else if(address >= 10000 && address < 11000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 9000 && address < 10000) ? "vars" : "temps")
        } else {
            if(address >= 11000 && address < 12000) {
                return "vars"
            } else if(address >= 12000 && address < 13000) {
                return "temps"
            } else {
                return "pointers"
            }
            // return ((address >= 11000 && address < 12000) ? "vars" : "temps")
        }
    }
}

// Given an address, return true if it belongs to a global variable
function isGlobal(address) {
    if((address >= 1000 && address < 7000) || (address >= 17000 && address < 20000)) {
        return true
    }
    return false
}

// Given an address, return true if it belongs to a temp variable
function isTemp(address) {
    if((address >= 2000 && address < 3000) || (address >= 4000 && address < 5000) || (address >= 8000 && address < 9000) || (address >= 10000 && address < 11000)) {
        return true
    }
    return false
}

// Given an address, return true if it belongs to a pointer variable
function isPointer(address) {
    if(address >= 17000 && address < 23000) {
        return true
    }
    return false
}

// Given the virtual address of an operand, return its value
function getOperandValue(address) {
    // Operand can be either a variable or a constant, so check this first
    if(address >= 13000 && address < 17000) {
        // It is a constant, get its value from constantsTable
        for(let [key, value] of constantsTable) {
            // KEY --> constant itself, VALUE --> virtual address
            if(address === value) {
                return key
            }
        }
    } else {
        // It is a variable
        // To access a variable's value, an ADDRESS, ADDRTYPE, and TYPE are needed
        // Get TYPE (int/float/char)
        const varType = getType(address)

        // Get ADDRTYPE (vars/temps)
        const varAddrType = getAddrType(address, varType)
        // console.log(`Dirección ${address}, Tipo ${varType}, AddrType ${varAddrType}`)
        if(isGlobal(address)) {
            // Work with data segment
            // Get value from memory (dataSegment)
            // return dataSegment.getValue(address, varType, varAddrType)
            if(isTemp(address)) {
                // console.log("GLOBAL TEMPORAL")
                return dataSegment.getValue(address, varType, varAddrType)
            } else if(isPointer(address)) {
                // console.log("GLOBAL POINTER. Tipo:", varType, "Dirección:", address)
                const actualAddress = getPointingAddress(address, varType, "global")
                // console.log("Ve a ver que hay en la", actualAddress)
                return dataSegment.getValue(address, varType, varAddrType)
            } else {
                // console.log("GLOBAL VAR")
                return dataSegment.getValue(address, varType, varAddrType)
            }
        } else {
            // Work with execution stack
            // Get value from local memory (executionStack)
            // return executionStack.peek().memory.getValue(address, varType, varAddrType)
            if(isTemp(address)) {
                return executionStack.peek().memory.getValue(address, varType, varAddrType)
            } else if(isPointer(address)) {
                // const actualAddress = getPointingAddress(address, varType, "local")
                return executionStack.peek().memory.getValue(address, varType, varAddrType)
            } else {
                return executionStack.peek().memory.getValue(address, varType, varAddrType)
            }
        }
    }
}

// Sets a value to a memory address
function setValue(address, value, addrType) {
    // if(addrType === "pointers"){console.log(isGlobal(address))}
    if(isGlobal(address)) {
        // Work with data segment
        dataSegment.setValue(address, value, addrType)
    } else {
        // Work with execution stack
        executionStack.peek().memory.setValue(address, value, addrType)
    }
}

// Handles read statement by using readline module
function readInput() {
    // Create interface for input and output
    const rl = readline.createInterface(process.stdin, process.stdout)

    // Question receives a response, and interface is closed when it is received
    return new Promise((resolve) => 
        rl.question("", (res) => {
            rl.close()
            resolve(res)
        })
    )
}

// Gets total size needed for a function
function getFuncSize(funcSizeCount) {
    let total = 0
    // Add up each value for vars and temps
    total += funcSizeCount.get("varsSizes").int
    total += funcSizeCount.get("varsSizes").float
    total += funcSizeCount.get("varsSizes").char
    total += funcSizeCount.get("tempsSizes").int
    total += funcSizeCount.get("tempsSizes").float
    total += funcSizeCount.get("tempsSizes").char
    total += funcSizeCount.get("pointersSizes").int
    total += funcSizeCount.get("pointersSizes").float
    total += funcSizeCount.get("pointersSizes").char

    return total
}

function getPointingAddress(address, ptrType, scope) {
    if(scope === "global") {
        // Global environment, use data segment
        return dataSegment.getValue(address, ptrType, "pointers")
    } else {
        // Local environment, use execution stack
        return executionStack.peek().memory.getValue(address, ptrType, "pointers")
    }
}

function getPointerType(address) {
    if((address >= 17000 && address < 18000) || (address >= 20000 && address < 21000)) {
        return "int"
    } else if((address >= 18000 && address < 19000) || (address >= 21000 && address < 22000)) {
        return "float"
    } else {
        return "char"
    }
}

// Executes the virtual machine
// Receives relevantDSVM, which is an object containing the quadruples, the funcTable, and the constantsTable
// *** Function is async because of READ statement
async function virtualMachine(relevantDSVM) {
    // constantsTable
    constantsTable = relevantDSVM.constantsTable

    // funcTable
    funcTable = relevantDSVM.funcTable

    // Code segment [CS] (quadruples)
    codeSegment = relevantDSVM.quadruples

    // Get main function's name in funcTable (it will always be the first entry)
    const mainFuncName = relevantDSVM.funcTable.entries().next().value[0]
    // Get main's funcSizeCount, which has its variable counts by type and var/temp
    const mainFuncSizeCount = relevantDSVM.funcTable.get(mainFuncName).funcSizeCount

    const mainFuncSizes = {
        intVars: mainFuncSizeCount.get("varsSizes").int,
        floatVars: mainFuncSizeCount.get("varsSizes").float,
        charVars: mainFuncSizeCount.get("varsSizes").char,
        intTemps: mainFuncSizeCount.get("tempsSizes").int,
        floatTemps: mainFuncSizeCount.get("tempsSizes").float,
        charTemps: mainFuncSizeCount.get("tempsSizes").char,
    }

    // Data segment [DS] (global memory)
    dataSegment = new Memory(mainFuncSizes, globalOffsets)

    // Execution stack for functions
    executionStack = new Stack()

    executionStackSize = 0
    executionStackMax = 150000
    funcCalls = new Stack()

    // Initialize instruction pointer (ip)
    let ip = 0

    // Variables to access each part of quadruple
    let op, opd1, opd2, resAddress, opRes
    // Used in goToF/goToV/goTo quadruples
    let condRes, targetQuadruple

    // Execute code from quadruples
    while(ip < codeSegment.length) {
        const quadruple = codeSegment[ip]
        op = quadruple.op
        // console.log(quadruple)
        
        // List each possible case
        switch(op) {
            // +
            case 1:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = quadruple.opd2

                // Pointer address, see where it's pointing
                if(quadruple.opd2[0] === "(") {
                    opd2 = parseInt(quadruple.opd2.slice(1))
                    // console.log("Antes del cambio:", opd2)
                    // opd2 = getOperandValue(opd2)
                    // // const ptrType = getPointerType(opd2)
                    // // const scope = isGlobal(opd2) ? "global" : "local"
                    // // opd2 = getPointingAddress(opd2, ptrType, scope)

                    // console.log("Despues del cambio", opd2)
                    // console.log("Ahi hay", getOperandValue(opd2))
                }

                opd2 = getOperandValue(opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Perform addition
                opRes = opd1 + opd2

                // See if address type is pointer or temp
                let addressType = isPointer(resAddress) ? "pointers" : "temps"
                
                // console.log("Pon el valor", opRes, "en la dirección", resAddress)

                // Save result in memory
                setValue(resAddress, opRes, addressType)
                // console.log("+ Asigno el valor", opRes, "a la dirección", resAddress)

                //console.log("****************SUMA****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // -
            case 2:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Perform substraction
                opRes = opd1 - opd2

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************RESTA****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // *
            case 3:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Perform multiplication
                opRes = opd1 * opd2

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************MULTIPLICACION****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break
            
            // /
            case 4:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Perform division
                opRes = opd1 / opd2

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************DIVISION****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // >
            case 5:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                // console.log("OPD1 -->", opd1, "OPD2 -->", opd2)
                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }
                // console.log("OPD1 -->", opd1, "OPD2 -->", opd2)

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 > opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************MAYOR****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // >=
            case 6:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 >= opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************MAYOR O IGUAL****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // <
            case 7:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 < opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************MENOR****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // <=
            case 8:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 <= opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************MENOR O IGUAL****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // ==
            case 9:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 == opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************IGUAL A****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // !=
            case 10:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply relational operator and save result
                opRes = (opd1 != opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************DIFERENTE A****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // &
            case 11:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply logical operator and save result
                opRes = (opd1 && opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************AND****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // |
            case 12:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)

                if(isPointer(quadruple.opd1)) {
                    opd1 = getOperandValue(opd1)
                }
                if(isPointer(quadruple.opd2)) {
                    opd2 = getOperandValue(opd2)
                }

                // Get result address
                resAddress = quadruple.res
                // Apply logical operator and save result
                opRes = (opd1 || opd2) ? 1 : 0

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

                //console.log("****************OR****************")
                //console.log(opd1, opd2)
                
                // Move instruction pointer to next quadruple
                ip++
                break

            // =
            case 13:
                // Get value of result
                opd1 = getOperandValue(quadruple.opd1)

                if(isPointer(quadruple.opd1)) {
                    // console.log(opd1)
                    opd1 = getOperandValue(opd1)
                }

                // Get result address
                resAddress = quadruple.res

                let addrType
                if(isTemp(resAddress)) {
                    addrType = "temps"
                } else if(isPointer(resAddress)) {
                    addrType = "pointers"
                    // console.log("Dirección:", resAddress, "Valor:", opd1)
                } else {
                    addrType = "vars"
                }

                if(addrType === "pointers") {
                    // console.log("Dirección:", resAddress)
                    // Get ACTUAL address (the one it's pointing to)
                    const ptrType = getPointerType(resAddress)
                    const scope = isGlobal(resAddress) ? "global" : "local"
                    // console.log("ORIGINAL ADDRESS", resAddress)
                    resAddress = getPointingAddress(resAddress, ptrType, scope)
                    // console.log("Dirección traducida:", resAddress)
                    addrType = "vars"
                    // console.log("= Asigno el valor", opd1, "a la dirección", resAddress)
                }

                // Assign opd1 to resAddress
                setValue(resAddress, opd1, addrType)

                // console.log("VALOR:", getOperandValue(resAddress))
                // console.log("****************ASIGNACION****************")
                // console.log(opd1, resAddress)

                // Move instruction pointer to next quadruple
                ip++
                break

            // goToF
            case 14:
                // Get condition result
                condRes = getOperandValue(quadruple.opd1)
                // Get goTo target
                targetQuadruple = quadruple.res

                // Evaluate condition and change instruction pointer accordingly
                if(condRes == 1) {
                    // True, go to next quadruple
                    ip++
                } else {
                    // False, go to specified quadruple
                    ip = targetQuadruple
                }

                //console.log("****************GOTO F****************")
                break

            // goToV
            case 15:
                // Get condition result
                condRes = getOperandValue(quadruple.opd1)
                // Get goTo target
                targetQuadruple = quadruple.res

                // Evaluate condition and change instruction pointer accordingly
                if(condRes == 1) {
                    // True, go to specified quadruple
                    ip = targetQuadruple
                } else {
                    // False, go to next quadruple
                    ip++
                }

                //console.log("****************GOTO V****************")
                break

            // goTo
            case 16:
                // Unconditional jump, go to specified quadruple
                targetQuadruple = quadruple.res
                ip = targetQuadruple

                //console.log("****************GOTO****************")
                break

            // read
            case 17:
                // Get input from user
                opRes = await readInput()

                // Result address
                resAddress = quadruple.res

                // Get type of expected result, will be used for checking
                const type = getType(resAddress)
                
                let resInt, resFloat
                if(type === "int") {
                    // Parse opRes to int
                    resInt = parseInt(opRes)
                    // If resInt is NaN, opRes is NOT an int. Throw error
                    if(isNaN(resInt) || opRes != resInt) {
                        throw new Error(`Type mismatch. Expected int`)
                    }
                } else if(type === "float") {
                    // Parse opRes to float
                    resFloat = parseFloat(opRes)
                    // If resFloat is NaN, opRes is NOT a float. Throw error
                    if(isNaN(resFloat) || opRes != resFloat) {
                        throw new Error(`Type mismatch. Expected float`)
                    }
                } else {
                    // char
                    // If received input is NOT 1 in length, throw error
                    if(opRes.length != 1) {
                        throw new Error(`Type mismatch. Expected char`)
                    }
                }

                let addrT
                if(isTemp(resAddress)) {
                    addrT = "temps"
                } else if(isPointer(resAddress)) {
                    addrT = "pointers"
                } else {
                    addrT = "vars"
                }

                if(addrT === "pointers") {
                    const scope = isGlobal(resAddress) ? "global" : "local"
                    resAddress = getPointingAddress(resAddress, type, scope)
                    addrT = "vars"
                }

                if(type === "int") {
                    // console.log(resInt, resAddress)
                    setValue(resAddress, resInt, "vars")
                } else if(type === "float") {
                    setValue(resAddress, resFloat, "vars")
                } else {
                    setValue(resAddress, opRes, "vars")
                }

                // Move instruction pointer to the next quadruple
                ip++
                //console.log("****************READ****************")
                break

            // print
            case 18:
                // Get element to be printed
                opRes = getOperandValue(quadruple.res)
                // console.log("Dirección recibida -->", quadruple.res, "Valor real -->", opRes)

                // if(isPointer(quadruple.res)) {
                //     opRes = getOperandValue(getOperandValue(quadruple.res))
                // } else {
                //     opRes = getOperandValue(quadruple.res)
                // }

                // If constant is string, remove the quotes that surround it
                // Check if it is a string constant by looking at its address
                if(quadruple.res >= 16000 && quadruple.res < 17000) {
                    // It is a string constant, remove quotes
                    opRes = opRes.slice(1, -1)
                }
                if(isPointer(quadruple.res)) {
                    opRes = getOperandValue(opRes)
                }
                // console.log("Dirección recibida:", quadruple.res, "Dirección traducida:", opRes)
                // Print to console
                console.log(opRes)

                // Move instruction pointer to the next quadruple
                ip++
                //console.log("****************PRINT****************")
                break

            // gosub
            case 19:
                let func = funcCalls.peek()
                funcCalls.pop()

                // Telling it where to return when finished
                func.retAddress = ip + 1

                // Push function into execution stack
                executionStack.push(func)

                // Change instruction pointer to the function's start point
                const funcStartQuadruple = quadruple.res
                ip = funcStartQuadruple
                break

            // era
            case 20:
                // Get function's name
                let funcName = quadruple.opd1

                // Get the function's size description
                let funcSizes = funcTable.get(funcName).funcSizeCount

                // Calculate the total amount of space the function needs, to check if if will cause a stack overflow
                let totalFuncSpace = getFuncSize(funcSizes)
                if(executionStackSize + totalFuncSpace > executionStackMax) {
                    throw new Error(`Stack overflow exception.`)
                }

                // Function does not cause stack overflow, add its size to executionStackSize
                executionStackSize += totalFuncSpace

                // Get function's number of variables by type (var/temp)
                const calledFuncSizes = {
                    intVars: funcSizes.get("varsSizes").int,
                    floatVars: funcSizes.get("varsSizes").float,
                    charVars: funcSizes.get("varsSizes").char,
                    intTemps: funcSizes.get("tempsSizes").int,
                    floatTemps: funcSizes.get("tempsSizes").float,
                    charTemps: funcSizes.get("tempsSizes").char,
                }
                // Create function's memory
                let funcMemory = new Memory(calledFuncSizes, localOffsets)

                // Push current function into funcCalls
                funcCalls.push({name: funcName, memory: funcMemory, retAddress: null})

                ip++
                break

            // param
            case 21:
                // Get operand's value
                const operand = getOperandValue(quadruple.opd1)

                // Get param number
                const paramNum = parseInt(quadruple.res)

                // Get operand's type
                const operandType = funcTable.get(funcCalls.peek().name).paramTypeList[paramNum - 1]
                // console.log(operand, operandType, paramNum)

                // Place operand's value into its respective address
                funcCalls.peek().memory.addParam(operand, operandType)
                // console.log(funcCalls.peek().memory.memory[0])

                ip++
                break

            // endfunc
            case 22:
                // Return instruction pointer to its previous place
                ip = executionStack.peek().retAddress
                executionStack.pop()
                break
            // return
            case 23:
                // Get value to be returned
                opRes = getOperandValue(quadruple.res)
                // console.log(opRes)

                // Get the address where the value will be placed
                const address = funcTable.get(executionStack.peek().name).retAddress
                // console.log("-----", address, "-----")

                // Set opRes value to its respective address
                setValue(address, opRes, "vars")

                // Return instruction pointer to its previous place
                ip = executionStack.peek().retAddress
                executionStack.pop()
                break

            // verify
            case 24:
                let index = getOperandValue(quadruple.opd1)
                let limSup = getOperandValue(quadruple.res)
                // console.log("Verifica que", index, "sea menor que", limSup)

                // Check if index is inside limits
                if(index > limSup || index < 0) {
                    throw new Error(`Index out of bounds`)
                }

                ip++
                break
        }
    }
}

module.exports = virtualMachine