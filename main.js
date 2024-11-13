import fs from "node:fs";
import { lex } from "./lexer.js";
import { parse } from "./parser.js";
import { interpret } from "./interpreter.js";
import { semanticAnalysis } from "./semanticAnalysis.js";
import { Environment } from "./environment.js";

const filePath = process.argv[2]; // skips node and .js file

const fileData = fs.readFileSync(filePath, "utf8");

try {
    let tokens = lex(fileData);
    
    let statements = parse(tokens);
    
    const environment = new Environment();
    
    semanticAnalysis(statements, environment);
    
    interpret(statements);
} catch(error) {
    if (error instanceof Array) {
        const errors = error;

        for (const error of errors) {
            console.log(error.toString());
        }
    } else {
        console.log(error.toString());
    }
}