// parser.js
// Definition of the tokens and grammar
// Exported to be used by other modules

const Parser = require("jison").Parser

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
        "start": [["program",   "console.log('todo bien')"]],
 
        "program": [["PROGRAM ID ; vars_sec funcs_sec MAIN ( ) { statements } EOF", ""]],

        "type": [
             ["INT", ""],
             ["FLOAT", ""],
             ["CHAR", ""]
        ],
 
        "vars_sec": [
             ["vars", ""],
             ["", ""]
        ],
 
        "vars": [["VARS { ID var_arr vars_same_type : type ; mult_dec }", ""]],
 
        "var_arr": [
             ["[ CTE_INT ] var_mat", ""],
             ["", ""]
        ],
 
        "var_mat": [
             ["[ CTE_INT ]", ""],
             ["", ""]
        ],
 
        "vars_same_type": [
             [", ID var_arr vars_same_type", ""],
             ["", ""]
        ],
 
        "mult_dec": [
             ["ID vars_same_type : type ; mult_dec", ""],
             ["", ""]
        ],
 
        "funcs_sec": [
             ["func funcs_sec", ""],
             ["", ""]
        ],
 
        "func": [["FUNCTION func_type ID ( params ) { vars_sec statements }", ""]],
 
        "func_type": [
             ["type", ""],
             ["VOID", ""]
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
 
        "write": [["PRINT ( write_ops mult_write ) ;", ""]],
 
        "write_ops": [
             ["var", ""],
             ["CTE_STRING", ""]
        ],
 
        "mult_write": [
             [", write_ops mult_write", ""],
             ["", ""]
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