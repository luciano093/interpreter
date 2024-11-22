import { Environment } from "./environment.js";
import { Assign, Binary, Call, Literal, Logical, Variable } from "./expression.js";
import { Block, Expression, FunctionDeclaration, If, Let, Print, Return, While } from "./statement.js";
import { ASTERISK, EQUAL_EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, LESS_THAN, LESS_THAN_EQUAL, MINUS, MODULO, OR, PLUS, SLASH } from "./symbols.js";

export function interpret(statements) {
    const environment = new Environment();

    for (const statement of statements) {
        evaluate(statement, environment);
    }
    
}

function evaluate(statement, environment) {
    if(statement instanceof Binary) {
        const left = evaluate(statement.left, environment);
        const right = evaluate(statement.right, environment);
        
        switch (statement.operator.type) {
            case ASTERISK:
                return left * right;
            case SLASH:
                return left / right;
            case MODULO:
                return left % right;
            case PLUS:
                return left + right;
            case MINUS:
                    return left - right;
            case EQUAL_EQUAL:
                return left == right;
            case LESS_THAN:
                return left < right;
            case GREATER_THAN:
                return left > right;
            case LESS_THAN_EQUAL:
                return left <= right;
            case GREATER_THAN_EQUAL:
                return left >= right;
        }
    } else if (statement instanceof Logical) {
        const left = evaluate(statement.left, environment);

        if (statement.operator.type === OR) {
            if (left) return left;
        } else {
            if (!left) return left;
        }

        return evaluate(statement.right, environment);
    } else if(statement instanceof Literal) {
        return statement.value;
    } else if(statement instanceof Let) {
        let value = null;

        if(statement.expression !== null) {
            value = evaluate(statement.expression, environment);
        }

        environment.define(statement.name.lexeme, value, statement.type);
        return;
    } else if(statement instanceof Variable) {
        return environment.get(statement.name);
    } else if(statement instanceof Assign) {
        const value = evaluate(statement.value, environment);
        environment.assign(statement.name, value);
        return value;
    } else if(statement instanceof Expression) {
        return evaluate(statement.expression, environment);
    } else if(statement instanceof Block) {
        const previous = environment;
        environment = new Environment(previous);
        for (const stmt of statement.statements) {
            evaluate(stmt, environment);
        }
        environment = previous;
        return;
    } else if (statement instanceof If) {
        if (evaluate(statement.condition, environment)) {
            evaluate(statement.thenBranch, environment)
        } else if(statement.elseBranch !== null) {
            evaluate(statement.elseBranch, environment);
        }

        return;
    } else if (statement instanceof While) {
        while(evaluate(statement.condition, environment)) {
            evaluate(statement.body, environment)
        }
        return;
    } else if(statement instanceof Print) {
        console.log(evaluate(statement.expression, environment));
        return;
    } else if (statement instanceof Call) {
        let previous = null;
        let args = [];

        try {
            for (const arg of statement.args) {
                args.push(evaluate(arg, environment));
            }

            let fn = environment.get(statement.callee.name);

            previous = environment;
            environment = new Environment(environment);
            
            for (let i = 0; i < fn.parameters.length; ++i) {
                environment.define(fn.parameters[i].name.lexeme, args[i]);
            }
            
            evaluate(fn.body, environment);

            environment = previous;

            return;
        } catch (error) {
            if (error instanceof Return) {
                environment = previous;
                return error.value.value;
            }
        }
    } else if (statement instanceof FunctionDeclaration) {
        environment.define(statement.name.name.lexeme, statement);
        return;
    } else if (statement instanceof Return) {
        throw statement;
    }

    console.log(statement);

    console.log(`Error evaluating statement.`);
}