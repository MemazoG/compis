// Memory.js
// Class that contains the definition of the memory used by the virtual machine

// The structure of the memory is an array of arrays.
// The first array is to divide by vars and temps, and each of these has 3 arrays, one for each type (int, float, char)

class Memory {
    // Constructor receives one object with the number of vars and temps by type, and another object with the offset (starting vAddress) of each one
    constructor(
        {intVars, floatVars, charVars, intTemps, floatTemps, charTemps, intPointers, floatPointers, charPointers},
        {intVarsOff, floatVarsOff, charVarsOff, intTempsOff, floatTempsOff, charTempsOff, intPointersOff, floatPointersOff, charPointersOff}
    ) {
        // Create memory DS
        this.memory = [
            // Vars
            [
                // Values received in constructor allow for the creation of arrays of the desired length
                new Array(intVars),
                new Array(floatVars),
                new Array(charVars)
            ],
            // Temps
            [
                // Values received in constructor allow for the creation of arrays of the desired length
                new Array(intTemps),
                new Array(floatTemps),
                new Array(charTemps)
            ],
            // Pointers
            [
                new Array(intPointers),
                new Array(floatPointers),
                new Array(charPointers)
            ]
        ]

        // Keep track of the offsets
        this.intVarsOff = intVarsOff
        this.floatVarsOff = floatVarsOff
        this.charVarsOff = charVarsOff
        this.intTempsOff = intTempsOff
        this.floatTempsOff = floatTempsOff
        this.charTempsOff = charTempsOff
        this.intPointersOff = intPointersOff
        this.floatPointersOff = floatPointersOff
        this.charPointersOff = charPointersOff

        // Counters to help with parameter value assignation
        this.intVarsCount = 0
        this.floatVarsCount = 0
        this.charVarsCount = 0
        this.intTempsCount = 0
        this.floatTempsCount = 0
        this.charTempsCount = 0
        this.intPointersCount = 0
        this.floatPointersCount = 0
        this.charPointersCount = 0
    }

    // Sets a value to a given address
    setValue(address, value, addrType) {
        let addrTypeIndex, type, typeIndex, index

        // console.log("Valor", value, "a la dirección", address)
        // Get address type index (vars = 0, temps = 1, pointers = 2)
        if(addrType === "vars") {
            addrTypeIndex = 0
        } else if(addrType === "temps") {
            addrTypeIndex = 1
        } else {
            addrTypeIndex = 2
            // console.log(addrTypeIndex)
        }

        // Get type based on address and addrType (var/temp/pointer)
        type = this.getType(address, addrType)

        // Use type to get its index (int = 0, float = 1, char = 2)
        if(type === "int") {
            typeIndex = 0
        } else if (type === "float") {
            typeIndex = 1
        } else {
            typeIndex = 2
        }

        // Get index by substracting its offset
        // index = address - this.getOffset(addrType, type)
        index = address - this.getOffset(addrType, type)
        // console.log("INDEX:", index)

        // Set the value in the given index
        this.memory[addrTypeIndex][typeIndex][index] = value
        // console.log(this.memory[addrTypeIndex][typeIndex])


        // Update respective counter
        if(addrType === "vars") {
            if(type === "int") {
                this.intVarsCount++
            } else if(type === "float") {
                this.floatVarsCount++
            } else {
                this.charVarsCount++
            }
        } else if(addrType === "temps") {
            if(type === "int") {
                this.intTempsCount++
            } else if(type === "float") {
                this.floatTempsCount++
            } else {
                this.charTempsCount++
            }
        } else {
            if(type === "int") {
                // console.log("Dirección recibida:", address)
                this.intPointersCount++
            } else if(type === "float") {
                this.floatPointersCount++
            } else {
                this.charPointersCount++
            }
        }
    }

    // Gets a value given an address, type, and addrType
    getValue(address, type, addrType) {
        let addrTypeIndex, typeIndex, index

        // Get indices
        if(addrType === "vars") {
            addrTypeIndex = 0
        } else if(addrType === "temps") {
            addrTypeIndex = 1
        } else {
            addrTypeIndex = 2
        }

        // console.log(address, type, addrType)

        if(type === "int") {
            typeIndex = 0
        } else if(type === "float") {
            typeIndex = 1
        } else {
            typeIndex = 2
        }

        // if(addrTypeIndex === 2) {
        //     console.log(addrType, "Te doy el valor de", address, ", que sin offset es la", address - this.getOffset(addrType, type))
        //     console.log(this.memory[addrTypeIndex][typeIndex])
        // }

        // console.log(addrType, "Te doy el valor de", address, ", que sin offset es la", address - this.getOffset(addrType, type))
        // console.log(this.memory[addrTypeIndex][typeIndex])

        index = address - this.getOffset(addrType, type)

        // Return value
        return this.memory[addrTypeIndex][typeIndex][index]
    }

    // Given an address and addrType (var/temp), returns its type (int/float/char)
    getType(address, addrType) {
        if(addrType === "vars") {
            // Between 1000 and 2000 (not including 2000)
            if(address >= this.intVarsOff && address < this.intTempsOff ) {
                return "int"
            }
            // Between 3000 and 4000 (not including 4000)
            else if(address >= this.floatVarsOff && address < this.floatTempsOff) {
                return "float"
            }
            // Between 5000 and 5999
            else {
                return "char"
            }
        } else if(addrType === "temps") {
            // Between 2000 and 3000 (not including 3000)
            if(address >= this.intTempsOff && address < this.floatVarsOff) {
                return "int"
            }
            // Between 4000 and 5000 (not including 5000)
            else if(address >= this.floatTempsOff && address < this.charVarsOff) {
                return "float"
            }
            // Between 6000 and 6999
            else {
                return "char"
            }
        } else { // POINTERS
            // Between 17000 and 18000 (not including 18000)
            if(address >= this.intPointersOff && address < this.floatPointersOff) {
                return "int"
            }
            // Between 18000 and 19000 (not including 19000)
            else if(address >= this.floatPointersOff && address < this.charPointersOff) {
                return "float"
            }
            // Between 19000 and 20000 (not including 20000) 
            else {
                return "char"
            }
        }
    }

    // Returns the offset of a var/temp given its addrType and type
    getOffset(addrType, type) {
        // Vars
        if(addrType === "vars") {
            if(type === "int") {
                return this.intVarsOff
            } else if(type === "float") {
                return this.floatVarsOff
            } else {
                return this.charVarsOff
            }
        }
        // Temps
        else if(addrType === "temps") {
            if(type === "int") {
                return this.intTempsOff
            } else if(type === "float") {
                return this.floatTempsOff
            } else {
                return this.charTempsOff
            }
        }
        // Pointers
        else {
            if(type === "int") {
                return this.intPointersOff
            } else if(type === "float") {
                return this.floatPointersOff
            } else {
                return this.charPointersOff
            }
        }
    }

    // Assigns the value of a parameter to its respective address
    addParam(opd, opdType) {
        // console.log("Recibi", opd, opdType)
        let type, index
        // Get the indices of the type and its place in the array
        if(opdType === "int") {
            type = 0
            index = this.intVarsCount
            this.intVarsCount++
        } else if(opdType === "float") {
            type = 1
            index = this.floatVarsCount
            this.floatVarsCount++
        } else {
            type = 2
            index = this.charVarsCount
            this.charVarsCount++
        }

        // console.log(opd, type, index)
        // Assign the value to its respective place
        // Parameters will always be vars, not temps, so first cell is 0 (vars)
        this.memory[0][type][index] = opd
        // console.log(this.memory[0])
    }
}

module.exports = Memory