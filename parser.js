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
        "start": [["program",   "endStuff();"]],
 
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
        "vars": [["vars_keyword { var_id_keyword var_arr vars_same_type : type semicolon_vars mult_dec }", ""]],

        // << NEURALGIC POINT >> - After reading the type of the variables, proceed to add them to the variables directory
        //                         of their respective function. Function name in this point is stored in funcName var
        "semicolon_vars": [
             [";",
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
             ["var_id_keyword var_arr vars_same_type : type semicolon_vars mult_dec", ""],
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
 
        // General structure for assignment statement. Assigns the result of an expression to a variable
        "assignment": [["var_name_assignment eq_operator expression ;", "assignToVar()"]],

        // << NEURALGIC POINT >> - After reading the name of the variable, adds it to operandStack
        //                         to keep track of it
        "var_name_assignment": [
            ["var", "addToOperandStack($1); addToTypeStack($1)"]
        ],

        // << NEURALGIC POINT >> - Add equal sign to operatorStack
        "eq_operator": [
             ["=", "addToOperatorStack($1)"]
        ],
 
        // General structure for read statement
        "read": [["READ ( read_var ) ;", ""]],

        "read_var": [["var", "generateReadQuadruple($1)"]],
 
        // General structure for print statement
        "write": [["PRINT ( write_ops mult_write ) ;", ""]],
 
        // << NEURALGIC POINT >> - Adds element to be printed to the operandStack
        //                         Generates a quadruple with the form [PRINT, , , res], with res being the element to be printed
        "write_ops": [
             ["var", "addToOperandStack($1); generateWriteQuadruple();"],
             ["CTE_STRING", "addToOperandStack($1); generateWriteQuadruple();"]
        ],
 
        // For print statement with multiple elements to be printed
        "mult_write": [
             [", write_ops mult_write", ""],
             ["", ""]
        ],
 
        // General structure for the if statement
        "conditional": [["IF ( expression par_close_if { statements } cond_else", ""]],

        // << NEURALGIC POINT >> - Right after the expression/condition is evaluated, calls a function that checks its type and
        //                         generates the goToF quadruple
        "par_close_if": [[")", "ifStart()"]],
 
        // General structure for the else statement
        // If empty (an if with no else) calls a function that completes the goToF quadruple with where it needs to go
        "cond_else": [
             ["else_keyword { statements }", "ifEnd()"],
             ["", "ifEnd()"]
        ],

        // << NEURALGIC POINT >> - When reading else keyword, calls a function that completes the goToF quadruple and generates a goTo quadruple
        "else_keyword": [
             ["ELSE", "elseStmt()"]
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
 
         // General structure for an expression. Starts with operators of least priority and works towards
         // those with the most priority
         "expression": [["and_expression_check exp_comp", ""]],
         
         // Compound expression with | operator
         "exp_comp": [
             ["or_sign expression", ""],
             ["", ""]
         ],

         // << NEURALGIC POINT >> - Checks operatorStack for | symbol to see if it solves or continues
         "and_expression_check": [
             ["and_expression", "checkOperatorStack(['|'])"]
         ],

         // << NEURALGIC POINT >> - Add | to operatorStack
         "or_sign": [
             ["|", "addToOperatorStack($1)"]
         ],
 
         // General structure for expression with &
         "and_expression": [["relop_expression_check and_exp_comp", ""]],
 
         // Compound expression with & operator
         "and_exp_comp": [
             ["and_sign and_expression", ""],
             ["", ""]
         ],

         // << NEURALGIC POINT >> - Checks operatorStack for & to see if it solves or continues
         "relop_expression_check": [
             ["relop_expression", "checkOperatorStack(['&'])"]
         ],

         // << NEURALGIC POINT >> - Add & to operatorStack
         "and_sign": [
             ["&", "addToOperatorStack($1)"]
         ],
 
         // General structure for expressions with relational operators
         "relop_expression": [["arit_expression_check relop_exp_comp", ""]],
 
         // Compound expression involving relational operators
         "relop_exp_comp": [
             ["gte_sign relop_expression", ""],
             ["lte_sign relop_expression", ""],
             ["gt_sign relop_expression", ""],
             ["lt_sign relop_expression", ""],
             ["eq_sign relop_expression", ""],
             ["diff_sign relop_expression", ""],
             ["", ""]
         ],

         // << NEURALGIC POINT >> - Checks operatorStack for a relational operator to see if it solves or continues
         "arit_expression_check": [
             ["arit_expression", "checkOperatorStack(['>=', '<=', '>', '<', '==', '!='])"]
         ],

         // << NEURALGIC POINT >> - Add >= to operatorStack
         "gte_sign": [
            [">=", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add <= to operatorStack
         "lte_sign": [
            ["<=", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add > to operatorStack
         "gt_sign": [
            [">", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add < to operatorStack
         "lt_sign": [
            ["<", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add == to operatorStack
         "eq_sign": [
            ["==", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add != to operatorStack
         "diff_sign": [
            ["!=", "addToOperatorStack($1)"]
         ],
       
         // General structure for arithmetic expression with + or -
         "arit_expression": [["term_check arit_exp_comp", ""]],
 
         // Compound expression with + or -
         "arit_exp_comp": [
             ["plus_sign arit_expression", ""],
             ["minus_sign arit_expression", ""],
             ["", ""]
         ],

         // << NEURALGIC POINT >> - Checks operatorStack for + or - to see if it solves or continues
         "term_check": [
             ["term", "checkOperatorStack(['+','-'])"]
         ],

         // << NEURALGIC POINT >> - Add + to operatorStack
         "plus_sign": [
             ["+", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add - to operatorStack
         "minus_sign": [
          ["-", "addToOperatorStack($1)"]
         ],
 
         // General structure for arithmetic expression with * or /
         "term": [["factor_check term_comp", ""]],
 
         // Compound expression with * or /
         "term_comp": [
             ["mult_sign term", ""],
             ["div_sign term", ""],
             ["", ""]
         ],

         // << NEURALGIC POINT >> - Checks operatorStack for * or / to see if it solves or continues
         "factor_check": [
             ["factor", "checkOperatorStack(['*','/'])"]
         ],

         // << NEURALGIC POINT >> - Add * to operatorStack
         "mult_sign": [
             ["*", "addToOperatorStack($1)"]
         ],

         // << NEURALGIC POINT >> - Add / to operatorStack
         "div_sign": [
             ["/", "addToOperatorStack($1)"]
         ],
 
         // Innermost part of an expression. Can be a constant, a variable, a function call, or a new expression between parentheses
         "factor": [
             ["open_par expression close_par", ""],
             ["CTE_INT", ""],
             ["CTE_FLOAT", ""],
             ["CTE_CHAR", ""],
             ["var", "addToOperandStack($1); addToTypeStack($1);"],
             ["func_call", "console.log('Llamada a funcion')"]
         ],

         // << NEURALGIC POINT >> - Adds a special symbol into operatorStack to simulate a "fake bottom". Helps when dealing with parentheses
         "open_par": [
             ["(", "insertFakeBottom()"]
         ],

         // << NEURALGIC POINT >> - Removes the special symbol from operatorStack. The expression between parentheses has ended
          "close_par": [
             [")", "removeFakeBottom()"]
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