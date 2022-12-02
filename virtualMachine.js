// virtualMachine.js
// Virtual machine that simulates a computer and executes the quadruples received (intermediate code representation)

const Memory = require("./Memory")
// For read statement
const readline = require("readline")

// Declare main structures globally so they can be accessed by the different functions
let codeSegment, constantsTable, dataSegment

// Offsets for GLOBAL variables and temps (starting virtual addresses)
const globalOffsets = {
    intVarsOff: 1000,
    floatVarsOff: 3000,
    charVarsOff: 5000,
    intTempsOff: 2000,
    floatTempsOff: 4000,
    charTempsOff: 6000,
}

// Returns a type (int/float/char) given an address
function getType(address) {
    if(address >= 1000 && address < 3000) {
        return "int"
    } else if(address >= 3000 && address < 5000) {
        return "float"
    } else {
        return "char"
    }
}

// Returns an addrType (vars/temps) given an address and a type
function getAddrType(address, type) {
    if(type === "int") {
        return ((address >= 1000 && address < 2000) ? "vars" : "temps")
    } else if(type === "float") {
        return ((address >= 3000 && address < 4000) ? "vars" : "temps")
    } else {
        return ((address >= 5000 && address < 6000) ? "vars" : "temps")
    }
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

        // Get value from memory (dataSegment)
        return dataSegment.getValue(address, varType, varAddrType)
    }
}

// Sets a value to a memory address
function setValue(address, value, addrType) {
    dataSegment.setValue(address, value, addrType)
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

// Executes the virtual machine
// Receives relevantDSVM, which is an object containing the quadruples, the funcTable, and the constantsTable
// *** Function is async because of READ statement
async function virtualMachine(relevantDSVM) {
    // constantsTable
    constantsTable = relevantDSVM.constantsTable

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
        
        // List each possible case
        switch(op) {
            // +
            case 1:
                // Get values of operands
                opd1 = getOperandValue(quadruple.opd1)
                opd2 = getOperandValue(quadruple.opd2)
                // Get result address
                resAddress = quadruple.res
                // Perform addition
                opRes = opd1 + opd2

                // Save result (which is a temp) in memory
                setValue(resAddress, opRes, "temps")

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

                // Get result address
                resAddress = quadruple.res

                // Assign opd1 to resAddress
                setValue(resAddress, opd1, "vars")

                //console.log("****************ASIGNACION****************")
                //console.log(opd1, resAddress)

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
                
                if(type === "int") {
                    // Parse opRes to int
                    const resInt = parseInt(opRes)
                    // If resInt is NaN, opRes is NOT an int. Throw error
                    if(isNaN(resInt) || opRes != resInt) {
                        throw new Error(`Type mismatch. Expected int`)
                    } else {
                        // Save result
                        setValue(resAddress, resInt, "vars")
                    }
                } else if(type === "float") {
                    // Parse opRes to float
                    const resFloat = parseFloat(opRes)
                    // If resFloat is NaN, opRes is NOT a float. Throw error
                    if(isNaN(resFloat) || opRes != resFloat) {
                        throw new Error(`Type mismatch. Expected float`)
                    } else {
                        // Save result
                        setValue(resAddress, resFloat, "vars")
                    }
                } else {
                    // char
                    // If received input is NOT 1 in length, throw error
                    if(opRes.length != 1) {
                        throw new Error(`Type mismatch. Expected char`)
                    } else {
                        // Save result
                        setValue(resAddress, opRes, "vars")
                    }
                }

                // Move instruction pointer to the next quadruple
                ip++
                //console.log("****************READ****************")
                break

            // print
            case 18:
                // Get element to be printed
                opRes = getOperandValue(quadruple.res)

                // If constant is string, remove the quotes that surround it
                // Check if it is a string constant by looking at its address
                if(quadruple.res >= 16000 && quadruple.res < 17000) {
                    // It is a string constant, remove quotes
                    opRes = opRes.slice(1, -1)
                }

                // Print to console
                console.log(opRes)

                // Move instruction pointer to the next quadruple
                ip++
                //console.log("****************PRINT****************")
                break

            // gosub
            case 19:
                //code
                ip++
                break

            // era
            case 20:
                //code
                ip++
                break

            // param
            case 21:
                //code
                ip++
                break

            // endfunc
            case 22:
                //code
                ip++
                break
        }
    }
}

module.exports = virtualMachine