import { Environment } from "./environment.js";
import { reportError } from "./error.js";
import { Assign, Binary, Call, Literal, Unary, Variable } from "./expression.js";
import { Block, Expression, FunctionDeclaration, Let, Print } from "./statement.js";
import { I32_IDENTIFIER, PLUS, STRING_IDENTIFIER } from "./symbols.js";

export function semanticAnalysis(statements, environment) {
    for (const statement of statements) {
        analyze(statement, environment);
    }
}

// todo check for function arity

function analyze(statement, environment) {
    if (statement instanceof Let) {
        if (statement.expression === null) {
            
        }
        else if (statement.type.type === I32_IDENTIFIER) {
            if (statement.expression.type === STRING_IDENTIFIER) {
                reportError(statement.type.line, "", "Tried to assign a string to an i32.");
            }
        }
        else if (statement.type.type === STRING_IDENTIFIER) {
            if (statement.expression.type === I32_IDENTIFIER) {
                reportError(statement.type.line, "", "Tried to assign an i32 to a string.");
            }
        } else if (statement.type.type !== statement.expression.type) {
            reportError(statement.type.line, "", `Invalid assignment. Tried to assign ${statement.expression.type} to ${statement.type.type}`);
        }

        environment.define(statement.name.lexeme, statement.expression, statement.type);
    } else if (statement instanceof Expression || statement instanceof Print) {
        analyzeExpression(statement, environment, statement.expression)
    } else if (statement instanceof Block) {
        const previous = environment;
        environment = new Environment(previous);

        for (const stmt of statement.statements) {
            analyze(stmt, environment);
        }
        environment = previous;
    } else if (statement instanceof FunctionDeclaration) {
        environment.define(statement.name.name.lexeme, statement);
    }
}

function analyzeExpression(statement, environment, expression) {
    if (expression instanceof Binary) {
        let left = analyzeExpression(statement, environment, expression.left);
        let right = analyzeExpression(statement, environment, expression.right);

        if(expression.operator.type == PLUS) {
            if ((left == I32_IDENTIFIER && right == STRING_IDENTIFIER)
                || (left == STRING_IDENTIFIER && right == I32_IDENTIFIER)) {
                    reportError(expression.operator.line, " invalid addition", "Tried add a string to an i32.");
            }
        }

        return left;
    } else if (expression instanceof Literal) {
        return expression.type;
    } else if (expression instanceof Variable) {
        if(environment.get(expression.name) === null) {
            reportError(expression.name.line, ` at ${expression.name.lexeme}`, "Tried to use an uninitialized variable.");
        }
        return environment.getType(expression.name).type;
    } else if (expression instanceof Assign) {
        let left = environment.getType(expression.name).type;
        let right = expression.value.type;

        if(left != right) {
            reportError(expression.name.line, ` at ${expression.name.lexeme}`, "Invalid assigment.");
        }
    } else if (expression instanceof Call) {
        console.log(expression);
        let fn = environment.get(expression.callee.name);

        if (expression.args.length != fn.parameters.length) {
            reportError(expression.callee.name.line, ` at ${expression.args[0].value}`, "Incorrect number of arguments");
        }

        // Todo: verify types
        for (let i = 0; i < expression.args.length; ++i) {
            // console.log(expression.args[i]);
            // console.log(fn.parameters[i]);
        }
    }
}