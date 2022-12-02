// parse.js
// Input  --> File to be parsed
// Output --> Parses the file and prints the result (true if accepted, false if not)
const parser = require("./parser")
const virtualMachine = require("./virtualMachine")
const { readFileSync } = require("fs")

// Reads a file and returns its contents
const read = (filename) => {
    const content = readFileSync(filename, 'utf-8')
    return content
}



if(process.argv.length != 3) {
    console.log("Error      - Proporcione un archivo a escanear")
    console.log("Expected   - node parse <archivo>")
} else {
    // Reads file provided in input
    const input = read(process.argv[2])
    
    // Parser input file
    const parseResult = parser.parse(input)
    
    // No errors while parsing, begin VM execution
    if(parseResult) {
        virtualMachine(relevantDSVM)
    }
}