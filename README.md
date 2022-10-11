# Proyecto Final Compiladores

Proyecto final para clase de Diseño de Compiladores.

Compilador hecho para lenguaje YAPL (**Y**et **A**nother **P**rogramming **L**anguage)

## ¿Cómo correr esta versión?
1. Clonar repositorio con `git clone` o descargando el ZIP del proyecto
2. Instalar las dependencias con `npm i`
3. Probar el parser con un archivo (Existen 2 archivos en /tests) ejecutando el siguiente comando
```
node parse <archivo>
```

## Tabla de Avances

| Fecha  | # Avance | Descripción | Archivos nuevos | Archivos modificados |
| :------: | :--------: | ----------- | :---------------: | :--------------------: |
| 2/10/2022| 0 | Propuesta de proyecto. Entrega de tokens, diagramas de sintaxis, gramática y ejemplo de programa. | `A01283254_PropuestaProyecto.pdf` | - |
| 3/10/2022 | 1 | Léxico y Sintaxis. Se reconocen los tokens y las estructuras gramaticales definidas en la propuesta | `parser.js` `parse.js` `testBasico.txt` `testError.txt` | - |
| 10/10/2022 | 2 | Directorio de procedimientos, tabla de variables y cubo semántico. Cubo semántico declarado. Funciones se agregan al directorio de funciones y variables se agregan al directorio de variables de su respectiva función. | `semantics.js` `semanticCube.js` `testFuncsVars.txt` | `parser.js` `parse.js` |

## Autor: Guillermo Andrés García Vázquez
- [@MemazoG](https://github.com/MemazoG)