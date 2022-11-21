// virtualMemory.js
// Class that contains the definition of the virtual memory and its address organization by scope and type
// Class comes with a method to reserve a memory address given a scope and a type

/* Address division:
+-----------+---------+-----------+---------------+---------------+
|           |         |   Global  |     Local     |    Constant   |
+-----------+---------+-----------+---------------+---------------+
|    int    | regular | 1000-1999 |   7000-7999   | 13,000-13,999 |
|           +---------+-----------+---------------+---------------+
|           |   temp  | 2000-2999 |   8000-8999   |       -       |
+-----------+---------+-----------+---------------+---------------+
|   float   | regular | 3000-3999 |   9000-9999   | 14,000-14,999 |
|           +---------+-----------+---------------+---------------+
|           |   temp  | 4000-4999 | 10,000-10,999 |       -       |
+-----------+---------+-----------+---------------+---------------+
|    char   | regular | 5000-5999 | 11,000-11,999 | 15,000-15,999 |
|           +---------+-----------+---------------+---------------+
|           |   temp  | 6000-6999 | 12,000-12,999 |       -       |
+-----------+---------+-----------+---------------+---------------+
|   string  | regular |     -     |       -       | 16,000-16,999 |
| (letrero) +---------+-----------+---------------+---------------+
|           |   temp  |     -     |       -       |       -       |
+-----------+---------+-----------+---------------+---------------+
 */

class VirtualMemory {
    constructor() {
        this.virtualAddresses = {
            global: {
                int: {
                    regular: {
                        start: 1000,
                        end: 1999,
                        curr: 1000,
                    },
                    temp: {
                        start: 2000,
                        end: 2999,
                        curr: 2000,
                    },
                },
                float: {
                    regular: {
                        start: 3000,
                        end: 3999,
                        curr: 3000,
                    },
                    temp: {
                        start: 4000,
                        end: 4999,
                        curr: 4000,
                    },
                },
                char: {
                    regular: {
                        start: 5000,
                        end: 5999,
                        curr: 5000,
                    },
                    temp: {
                        start: 6000,
                        end: 6999,
                        curr: 6000,
                    },
                }
            },
            local: {
                int: {
                    regular: {
                        start: 7000,
                        end: 7999,
                        curr: 7000,
                    },
                    temp: {
                        start: 8000,
                        end: 8999,
                        curr: 8000,
                    },
                },
                float: {
                    regular: {
                        start: 9000,
                        end: 9999,
                        curr: 9000,
                    },
                    temp: {
                        start: 10000,
                        end: 10999,
                        curr: 10000,
                    },
                },
                char: {
                    regular: {
                        start: 11000,
                        end: 11999,
                        curr: 11000,
                    },
                    temp: {
                        start: 12000,
                        end: 12999,
                        curr: 12000,
                    },
                }
            },
            constant: {
                int: {
                    start: 13000,
                    end: 13999,
                    curr: 13000,
                },
                float: {
                    start: 14000,
                    end: 14999,
                    curr: 14000,
                },
                char: {
                    start: 15000,
                    end: 15999,
                    curr: 15000,
                },
                string: {
                    start: 16000,
                    end: 16999,
                    curr: 16000,
                }
            }
        }
    }

    // Assigns a spot in the virtual memory given a scope (global/local/constant), a type (int/float/char/string), and addrType (regular/temp)
    // Returns a number which corresponds to the address given, and updates curr to point to next available address
    reserveAddress(scope, type, addrType) {
        let address
        if(scope === "constant") {
            // Constants do NOT have addrType
            address = this.virtualAddresses[scope][type].curr
            // Point to next available one
            this.virtualAddresses[scope][type].curr++
            // Check if address is inside the range
            if(address <= this.virtualAddresses[scope][type].end) {
                // OK
                return address
            } else {
                // Outside range - Too many variables
                throw new Error(`Too many variables`)
            }
        } 
        else {
            // Not a constant. Take a look at addrType parameter (and the other 2)
            address = this.virtualAddresses[scope][type][addrType].curr

            // Point to next available one
            this.virtualAddresses[scope][type][addrType].curr++

            // Check if address is inside the range
            if(address <= this.virtualAddresses[scope][type][addrType].end) {
                // OK
                return address
            } else {
                // Outside range - Too many variables
                throw new Error(`Too many variables`)
            }
        }
    }

    greet() {
        console.log("Hello")
    }
}

module.exports = VirtualMemory
