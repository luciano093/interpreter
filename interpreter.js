import { Environment } from "./environment.js";
import { Assign, Binary, Literal, Logical, Variable } from "./expression.js";
import { Block, Expression, If, Let, Print, While } from "./statement.js";
import { EQUAL_EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, LESS_THAN, LESS_THAN_EQUAL, MINUS, MODULO, OR, PLUS } from "./symbols.js";

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
    }

    console.log(statement);

    console.log(`Error evaluating statement.`);
}