// parser.js
// Definition of the tokens and grammar
// Exported to be used by other modules

const Parser = require("jison").Parser
require("./semantics/semantics")

const grammar = {
    "lex": {
        "macros": {
            "digit": "[0-9]",
            "digits": "{digit}+",
            "letter": "[a-zA-Z]",
            "letters": "{letter}+",
            "space": " "
         },
        "rules": [
            ["\\s+",                                  "/* skips whisespace */"],
 
            ["program",                               "return 'PROGRAM'"],
            ["vars",                                  "return 'VARS'"],
            ["main",                                  "return 'MAIN'"],

            ["int",                                   "return 'INT'"],
            ["float",                                 "return 'FLOAT'"],
            ["char",                                  "return 'CHAR'"],

            ["function",                              "return 'FUNCTION'"],
            ["void",                                  "return 'VOID'"],
            ["return",                                "return 'RETURN'"],

            ["mean",                                  "return 'MEAN'"],
            ["median",                                "return 'MEDIAN'"],
            ["mode",                                  "return 'MODE'"],
            ["variance",                              "return 'VARIANCE'"],
            ["stdev",                                 "return 'STDEV'"],
            ["min",                                   "return 'MIN'"],
            ["max",                                   "return 'MAX'"],
            ["plot2d",                                "return 'PLOT2D'"],

            ["read",                                  "return 'READ'"],
            ["print",                                 "return 'PRINT'"],

            ["if",                                    "return 'IF'"],
            ["else",                                  "return 'ELSE'"],

            ["while",                                 "return 'WHILE'"],
            ["do",                                    "return 'DO'"],
            ["for",                                   "return 'FOR'"],
            ["to",                                    "return 'TO'"],
 
            ["{letter}({letter}|{digit})*",           "return 'ID'"],
            ["{digits}\\.{digits}",                   "return 'CTE_FLOAT'"],
            ["{digits}",                              "return 'CTE_INT'"],
            ['\\"({letter}|{digit})\\"',              "return 'CTE_CHAR'"],
            ['\\"({letters}|{digits}|{space})*\\"',   "return 'CTE_STRING'"],
 
            ["\\;",                                   "return ';'"],
            ["\\:",                                   "return ':'"],
            ["\\,",                                   "return ','"],
 
            ["\\{",                                   "return '{'"],
            ["\\}",                                   "return '}'"],
            ["\\(",                                   "return '('"],
            ["\\)",                                   "return ')'"],
            ["\\[",                                   "return '['"],
            ["\\]",                                   "return ']'"],
 
            ["\\>=",                                  "return '>='"],
            ["\\<=",                                  "return '<='"],
            ["\\>",                                   "return '>'"],
            ["\\<",                                   "return '<'"],
            ["\\==",                                  "return '=='"],
            ["\\=",                                   "return '='"],
            ["\\!=",                                  "return '!='"],

            ["\\&",                                   "return '&'"],
            ["\\|",                                   "return '|'"],
 
            ["\\+",                                   "return '+'"],
            ["-",                                     "return '-'"],
            ["\\*",                                   "return '*'"],
            ["\\/",                                   "return '/'"],
 
            ["$",                                     "return 'EOF'"],
            [".",                                     "return 'ERROR'"]
        ]
    },

    "bnf": {
        "start": [["program",   "console.log('todo bien');"]],
 
        // General program structure
        "program": [["program_keyword program_id ; vars_sec funcs_sec MAIN ( ) { statements } EOF", ""]],

        // << NEURALGIC POINT >> - Creates functions directory after reading PROGRAM keyword
        "program_keyword": [
             ["PROGRAM",
              "createFuncTable();"]
        ],

        // << NEURALGIC POINT >> - After reading the program's name, adds it to the functions directory
        "program_id": [
             ["ID",
              "setCurrType('-'); setCurrFuncName($1); addFuncToFuncTable($1);"]
         ],

        // << NEURALGIC POINT >> - After reading a type, assigns it to the currType variable
        //                   currType is used when registering functions and variables
        "type": [
             ["INT", "setCurrType($1);"],
             ["FLOAT", "setCurrType($1);"],
             ["CHAR", "setCurrType($1);"]
        ],
 
        // The variables section may or may not be empty
        "vars_sec": [
             ["vars", ""],
             ["", ""]
        ],
 
        // General structure for declaring variables
        "vars": [["vars_keyword { var_id_keyword var_arr vars_same_type : type add_vars ; mult_dec }", ""]],

        // << NEURALGIC POINT >> - After reading the type of the variables, proceed to add them to the variables directory
        //                         of their respective function. Function name in this point is stored in funcName var
        "add_vars": [
             ["",
              "addVarsToVarTable(); clearIdList();"]
        ],

        "vars_keyword": [
             ["VARS",
              ""]
        ],

        // << NEURALGIC POINT >> - After reading the name of a variable in the declaration section, adds it to the idList array.
        //                         They are stored in an array because their type is not known yet.
        "var_id_keyword": [
             ["ID",
              "addIdToIdList($1);"]
        ],
 
        // If var is an array or a matrix, follows first production. If not, follows empty production
        "var_arr": [
             ["[ CTE_INT ] var_mat", ""],
             ["", ""]
        ],
 
        // If var is a matrix, follows first production. If not (it is an array), follows empty production
        "var_mat": [
             ["[ CTE_INT ]", ""],
             ["", ""]
        ],
 
        // Multiple variables of the same type are declared (Example: a, b, c : int;)
        "vars_same_type": [
             [", var_id_keyword var_arr vars_same_type", ""],
             ["", ""]
        ],
 
        // When a new line of variables is declared, preferably/ideally of a different type than the previous
        "mult_dec": [
             ["var_id_keyword var_arr vars_same_type : type add_vars ; mult_dec", ""],
             ["", ""]
        ],
 
        // The functions section may or may not be empty
        "funcs_sec": [
             ["func funcs_sec", ""],
             ["", ""]
        ],
 
        "func": [["FUNCTION func_type func_id ( params ) { vars_sec statements }", ""]],

        "func_id": [
             ["ID",
              "setCurrFuncName($1); addFuncToFuncTable($1);"]
        ],
 
        "func_type": [
             ["type", ""],
             ["VOID", "setCurrType($1);"]
        ],
 
        "params": [
             ["type ID mult_params", ""],
             ["", ""]
         ],
 
        "mult_params": [
             [", params", ""],
             ["", ""]
        ],
 
        "var": [["ID id_arr", ""]],
 
        "id_arr": [
             ["[ expression ] id_mat", ""],
             ["", ""]
        ],
 
        "id_mat": [
             ["[ expression ]", ""],
             ["", ""]
        ],
 
        "statements": [
             ["statement statements", ""],
             ["", ""]
        ],
 
        "statement": [
             ["assignment", ""],
             ["read", ""],
             ["write", ""],
             ["conditional", ""],
             ["loop", ""],
             ["void_func_call", ""],
             ["return", ""],
             ["sp_func", ""]
        ],
 
        "assignment": [["var = expression ;", ""]],
 
        "read": [["READ ( var ) ;", ""]],
 
        // General structure for print statement
        "write": [["PRINT ( write_ops gen_write_quad mult_write ) ;", ""]],
 
        // << NEURALGIC POINT >> - Adds element to be printed to the operandStack
        "write_ops": [
             ["var", "addToOperandStack($1)"],
             ["CTE_STRING", "addToOperandStack($1)"]
        ],
 
        // For print statement with multiple elements to be printed
        "mult_write": [
             [", write_ops gen_write_quad mult_write", ""],
             ["", ""]
        ],

        // << NEURALGIC POINT >> - Generates a quadruple with the form [PRINT, , , res], with res being the element to be printed
        "gen_write_quad": [
             ["",
              "generateWriteQuadruple()"]
          ],
 
        "conditional": [["IF ( expression ) { statements } cond_else", ""]],
 
        "cond_else": [
             ["ELSE else_type", ""],
             ["", ""]
        ],
 
        "else_type": [
             ["{ statements }", ""],
             ["conditional", ""]
        ],
 
        "loop": [
             ["while_loop", ""],
             ["do_while_loop", ""],
             ["for_loop", ""]
        ],
 
        "while_loop": [["WHILE ( expression ) { statements }", ""]],
 
        "do_while_loop": [["DO { statements } WHILE ( expression ) ;", ""]],
 
        "for_loop": [["FOR ( for_type TO for_type ) { statements }", ""]],
 
        "for_type": [
             ["var", ""],
             ["CTE_INT", ""]
        ],
 
        "void_func_call": [["ID ( args ) ;", ""]],
 
        "args": [["expression mult_arg", ""]],
 
        "mult_arg": [
             [", args", ""],
             ["", ""]
         ],
 
         "return": [["RETURN ( expression ) ;", ""]],
 
         "expression": [["and_expression exp_comp", ""]],
 
         "exp_comp": [
             ["| expression", ""],
             ["", ""]
         ],
 
         "and_expression": [["relop_expression and_exp_comp", ""]],
 
         "and_exp_comp": [
             ["& and_expression", ""],
             ["", ""]
         ],
 
         "relop_expression": [["arit_expression relop_exp_comp", ""]],
 
         "relop_exp_comp": [
             [">= arit_expression", ""],
             ["<= arit_expression", ""],
             ["> arit_expression", ""],
             ["< arit_expression", ""],
             ["== arit_expression", ""],
             ["!= arit_expression", ""],
             ["", ""]
         ],
 
         "arit_expression": [["term arit_exp_comp", ""]],
 
         "arit_exp_comp": [
             ["+ arit_expression", ""],
             ["- arit_expression", ""],
             ["", ""]
         ],
 
         "term": [["factor term_comp", ""]],
 
         "term_comp": [
             ["* term", ""],
             ["/ term", ""],
             ["", ""]
         ],
 
         "factor": [
             ["( expression )", ""],
             ["CTE_INT", ""],
             ["CTE_FLOAT", ""],
             ["CTE_CHAR", ""],
             ["var", ""],
             ["func_call", "console.log('Llamada a funcion')"]
         ],
 
         "func_call": [["ID ( args ) ;", ""]],
 
         "sp_func": [
             ["MEAN ( var ) ;", ""],
             ["MEDIAN ( var ) ;", ""],
             ["MODE ( var ) ;", ""],
             ["VARIANCE ( var ) ;", ""],
             ["STDEV ( var ) ;", ""],
             ["MIN ( var ) ;", ""],
             ["MAX ( var ) ;", ""],
             ["PLOT2D ( var ) ;", ""]
         ]
    }
}

const parser = new Parser(grammar)

module.exports = parser