// virtualMemory.js
// Class that contains the definition of the virtual memory and its address organization by scope and type
// Class comes with a method to reserve a memory address given a scope and a type

/* Address division:
    +-----------+-----------+-----------+---------------+---------------+
    |           | GLOBAL    | LOCAL     | TEMP          | CONSTANT      |
    +-----------+-----------+-----------+---------------+---------------+
    | int       | 1000-1999 | 4000-4999 | 7000-7999     | 11,000-11,999 |
    +-----------+-----------+-----------+---------------+---------------+
    | float     | 2000-2999 | 5000-5999 | 8000-8999     | 12,000-12,999 |
    +-----------+-----------+-----------+---------------+---------------+
    | char      | 3000-3999 | 6000-6999 | 9000-9999     | 13,000-13,999 |
    +-----------+-----------+-----------+---------------+---------------+
    | bool      |     -     |     -     | 10,000-10,999 |       -       |
    +-----------+-----------+-----------+---------------+---------------+
    | string    |     -     |     -     |       -       | 14,000-14,999 |
    | (letrero) |           |           |               |               |
    +-----------+-----------+-----------+---------------+---------------+
 */

class VirtualMemory {
    constructor() {
        this.virtualAddresses = {
            global: {
                int: {
                    start: 1000,
                    end: 1999,
                    curr: 1000,
                },
                float: {
                    start: 2000,
                    end: 2999,
                    curr: 2000,
                },
                char: {
                    start: 3000,
                    end: 3999,
                    curr: 3000,
                }
            },
            local: {
                int: {
                    start: 4000,
                    end: 4999,
                    curr: 4000,
                },
                float: {
                    start: 5000,
                    end: 5999,
                    curr: 5000,
                },
                char: {
                    start: 6000,
                    end: 6999,
                    curr: 6000,
                }
            },
            temp: {
                int: {
                    start: 7000,
                    end: 7999,
                    curr: 7000,
                },
                float: {
                    start: 8000,
                    end: 8999,
                    curr: 8000,
                },
                char: {
                    start: 9000,
                    end: 9999,
                    curr: 9000,
                },
                bool: {
                    start: 10000,
                    end: 10999,
                    curr: 10000,
                }
            },
            constant: {
                int: {
                    start: 11000,
                    end: 11999,
                    curr: 11000,
                },
                float: {
                    start: 12000,
                    end: 12999,
                    curr: 12000,
                },
                char: {
                    start: 13000,
                    end: 13999,
                    curr: 13000,
                },
                string: {
                    start: 14000,
                    end: 14999,
                    curr: 14000,
                }
            }
        }
    }

    // Assigns a spot in the virtual memory given a scope (global/local/temporal/constant) and a type (int/float/char/bool/string)
    // Returns a number which corresponds to the address given, and updates curr to point to next available address
    reserveAddress(scope, type) {
        // Address received/assigned
        const address = this.virtualAddresses[scope][type].curr

        // Point to next available one
        this.virtualAddresses[scope][type].curr++

        // Check if address is inside the range
        if(address <= this.virtualAddresses[scope][type].end) {
            //OK
            return address
        } else {
            // Outside range - Too many variables
            throw new Error(`Too many variables`)
        }
    }

    greet() {
        console.log("Hello")
    }
}

module.exports = VirtualMemory
