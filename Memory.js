// Memory.js
// Class that contains the definition of the memory used by the virtual machine

// The structure of the memory is an array of arrays.
// The first array is to divide by vars and temps, and each of these has 3 arrays, one for each type (int, float, char)

class Memory {
    // Constructor receives one object with the number of vars and temps by type, and another object with the offset (starting vAddress) of each one
    constructor(
        {intVars, floatVars, charVars, intTemps, floatTemps, charTemps},
        {intVarsOff, floatVarsOff, charVarsOff, intTempsOff, floatTempsOff, charTempsOff}
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
            ]
        ]

        // Keep track of the offsets
        this.intVarsOff = intVarsOff
        this.floatVarsOff = floatVarsOff
        this.charVarsOff = charVarsOff
        this.intTempsOff = intTempsOff
        this.floatTempsOff = floatTempsOff
        this.charTempsOff = charTempsOff
    }

    // Sets a value to a given address
    setValue(address, value, addrType) {
        let addrTypeIndex, type, typeIndex, index

        // Get address type index (vars = 0, temps = 1)
        if(addrType === "vars") {
            addrTypeIndex = 0
        } else {
            addrTypeIndex = 1
        }

        // Get type based on address and addrType (var/temp)
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
        index = address - this.getOffset(addrType, type)

        // Set the value in the given index
        this.memory[addrTypeIndex][typeIndex][index] = value

    }

    // Gets a value given an address, type, and addrType
    getValue(address, type, addrType) {
        let addrTypeIndex, typeIndex, index

        // Get indices
        if(addrType === "vars") {
            addrTypeIndex = 0
        } else {
            addrTypeIndex = 1
        }

        if(type === "int") {
            typeIndex = 0
        } else if(type === "float") {
            typeIndex = 1
        } else {
            typeIndex = 2
        }

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
        else {
            if(type === "int") {
                return this.intTempsOff
            } else if(type === "float") {
                return this.floatTempsOff
            } else {
                return this.charTempsOff
            }
        }
    }
}

module.exports = Memory