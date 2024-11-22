import { I32, EOF, PLUS, SEMICOLON, PRINT, LET, IDENTIFIER, EQUAL, TYPE_SPECIFIER, I32_IDENTIFIER, STRING, STRING_IDENTIFIER, LEFT_BRACE, RIGHT_BRACE, IF, ELSE, LEFT_PARENTHESIS, RIGHT_PARENTHESIS, EQUAL_EQUAL, OR, AND, WHILE, MINUS, LESS_THAN, GREATER_THAN, MODULO, FOR, LESS_THAN_EQUAL, GREATER_THAN_EQUAL, ASTERISK, SLASH, COMMA, FN, RETURN } from "./symbols.js";
import { Unary, Binary, Literal, Grouping, Variable, Assign, Logical, Call } from "./expression.js";
import { Block, Expression, FunctionDeclaration, If, Let, Print, Return, While } from "./statement.js";
import { reportError } from "./error.js";

export function parse(tokens) {
    const parser = {
        current: 0,
        errors: [],
    };

    const statements = [];

    while(!isAtEnd(tokens, parser)) {
        try {
            statements.push(declaration(tokens, parser));
        } catch (error) {
            parser.errors.push(error);
            synchronize(tokens, parser);
        }
    }

    if(parser.errors.length > 0) {
        throw parser.errors;
    }

    return statements;
}

function declaration(tokens, parser) {
    if(match(tokens, parser, LET)) return letDeclaration(tokens, parser);
    if(match(tokens, parser, FN)) return functionDeclaration(tokens, parser);

    return statement(tokens, parser);
}

function functionDeclaration(tokens, parser) {
    let name = primary(tokens, parser);

    if(!(name instanceof Variable)) {
        reportParserError(name, "Incorrect function declaration");
    }

    consume(tokens, parser, LEFT_PARENTHESIS, "Expected parenthesis.");

    let arg_identifiers = parameters(tokens, parser);

    consume(tokens, parser, RIGHT_PARENTHESIS, "Unclosed parenthesis.");

    consume(tokens, parser, LEFT_BRACE, "Expected block for unparethisized if.");
    let body = new Block(block(tokens, parser));

    return new FunctionDeclaration(name, arg_identifiers, body);
}

function parameters(tokens, parser) {
    let args = [];

    if(!check(tokens, parser, RIGHT_PARENTHESIS)) {
        do {
            args.push(new Variable(variableDeclaration(tokens, parser).name));
        } while(match(tokens, parser, COMMA));
    }

    return args;
}

function letDeclaration(tokens, parser) {
    let {name, type} = variableDeclaration(tokens, parser);

    let expr = null;
    if (match(tokens, parser, EQUAL)) {
        expr = expression(tokens, parser);
    }

    consume(tokens, parser, SEMICOLON, "Expected ';' after expression.");
    return new Let(name, type, expr);
}

function variableDeclaration(tokens, parser) {
    const name = consume(tokens, parser, IDENTIFIER, "Expected variable name.");

    consume(tokens, parser, TYPE_SPECIFIER, "Expected type.");
    const type = typeIdentifier(tokens, parser);

    return {
        name,
        type,
    };
}

function typeIdentifier(tokens, parser) {
    if (check(tokens, parser, I32_IDENTIFIER) || check(tokens, parser, STRING_IDENTIFIER)) {
        let type = advance(tokens, parser);
        return type;
    } else if (check(tokens, parser, IDENTIFIER)) {
        reportParserError(previous(tokens, parser), `Invalid type ${peek(tokens, parser).lexeme}.`);
    }

    reportParserError(previous(tokens, parser), "Expected type.");
}

function statement(tokens, parser) {
    if(match(tokens, parser, PRINT)) {
        if(match(tokens, parser, SEMICOLON)) {
            return new Print(new Literal("", STRING));
        }

        const expr = expression(tokens, parser);

        consume(tokens, parser, SEMICOLON, "Expected ';' after expression.");

        return new Print(expr);
    }

    if(match(tokens, parser, IF)) {
        return ifStatement(tokens, parser);
    }

    if(match(tokens, parser, WHILE)) {
        return whileStatement(tokens, parser);
    }

    if(match(tokens, parser, FOR)) {
        return forStatement(tokens, parser);
    }

    if(match(tokens, parser, LEFT_BRACE)) {
       return new Block(block(tokens, parser));
    }

    if(match(tokens, parser, RETURN)) {
        return returnStatement(tokens, parser);
     }

    const expr = expression(tokens, parser);
    consume(tokens, parser, SEMICOLON, "Expected ';' after expression.");

    return new Expression(expr);
}

function returnStatement(tokens, parser) {
    let value = expression(tokens, parser);
    consume(tokens, parser, SEMICOLON, "Expected ';' after return statement.");

    return new Return(previous(tokens, parser), value);
}

function ifStatement(tokens, parser) {
    if(match(tokens, parser, LEFT_PARENTHESIS)) {
        const condition = expression(tokens, parser);
        consume(tokens, parser, RIGHT_PARENTHESIS, "Unclosed parenthesis.");
        const thenBranch = statement(tokens, parser);

        let elseBranch = null;

        if(match(tokens, parser, ELSE)) {
            elseBranch = statement(tokens, parser);
        }

        return new If(condition, thenBranch, elseBranch);
    }

    const condition = expression(tokens, parser);

    consume(tokens, parser, LEFT_BRACE, "Expected block for unparethisized if.");

    const thenBranch = new Block(block(tokens, parser));
    let elseBranch = null;

    if(match(tokens, parser, ELSE)) {
        elseBranch = statement(tokens, parser);
    }

    return new If(condition, thenBranch, elseBranch);
}

function forStatement(tokens, parser) {
    consume(tokens, parser, LEFT_PARENTHESIS, "Missing parenthesis.")

    let variable = null;
    if (match(tokens, parser, SEMICOLON)) {
        variable = null;
    } else if (match(tokens, parser, LET)) {
        variable = letDeclaration(tokens, parser);
    } else {
        variable = expression(tokens, parser);

        consume(tokens, parser, SEMICOLON, "Missing semicolon.");
    }

    let condition = null;
    console.log(check(tokens, parser, SEMICOLON));
    if (!check(tokens, parser, SEMICOLON)) {
        condition = expression(tokens, parser);
    }

    consume(tokens, parser, SEMICOLON, "Missing semicolon.");

    let expr = null;

    if (!check(tokens, parser, RIGHT_PARENTHESIS)) {
        expr = expression(tokens, parser);
    }

    consume(tokens, parser, RIGHT_PARENTHESIS, "Unclosed parenthesis.");
    
    let body = statement(tokens, parser);

    if (expr !== null) {
        body = new Block([body, expr]);
    }

    if (condition === null) condition = true;
    body = new While(condition, body);

    if (variable != null) {
        body = new Block([variable, body]);
    }
    
    return body;
}

function whileStatement(tokens, parser) {
    if(match(tokens, parser, LEFT_PARENTHESIS)) {
        const condition = expression(tokens, parser);
        consume(tokens, parser, RIGHT_PARENTHESIS, "Unclosed parenthesis.");

        const body = statement(tokens, parser);

        return new While(condition, body);
    }

    const condition = expression(tokens, parser);

    consume(tokens, parser, LEFT_BRACE, "Expected block for unparethisized if.");
    
    const body = new Block(block(tokens, parser));

    return new While(condition, body);
}

function block(tokens, parser) {
    const statements = [];

    while(!check(tokens, parser, RIGHT_BRACE) && !isAtEnd(tokens, parser)) {
        statements.push(declaration(tokens, parser));
    }
    
    consume(tokens, parser, RIGHT_BRACE, "Unclosed block.");

    return statements;
}

function expression(tokens, parser) {
    return assigment(tokens, parser);
}

function assigment(tokens, parser) {
    const previousToken = peek(tokens, parser); // used only for display in case of error

    const identifier = or(tokens, parser);

    if (match(tokens, parser, EQUAL)) {
        previous(tokens, parser, EQUAL);
        const value = expression(tokens, parser);

        if(!(identifier instanceof Variable)) {
            reportParserError(previousToken, "Invalid left hand assignment target.");
        }

        return new Assign(identifier.name, value);
    }

    return identifier;
}

function or(tokens, parser) {
    const left = and(tokens, parser);

    while(match(tokens, parser, OR)) {
        const operator = previous(tokens, parser);
        const right = and(tokens, parser);

        return new Logical(left, operator, right);
    }

    return left;
}

function and(tokens, parser) {
    const left = equality(tokens, parser);

    while(match(tokens, parser, AND)) {
        const operator = previous(tokens, parser);
        const right = equality(tokens, parser);

        return new Logical(left, operator, right);
    }

    return left;
}

function equality(tokens, parser) {
    let expression = comparison(tokens, parser);

    while (match(tokens, parser, EQUAL_EQUAL)) {
        let operator = previous(tokens, parser);
        let right = comparison(tokens, parser);
        expression = new Binary(expression, operator, right);
    }

    return expression;
}

function comparison(tokens, parser) {
    let expression = term(tokens, parser);

    while(match(tokens, parser, LESS_THAN, GREATER_THAN, LESS_THAN_EQUAL, GREATER_THAN_EQUAL)) {
        let operator = previous(tokens, parser);
        let right = term(tokens, parser);
        expression = new Binary(expression, operator, right);
    }

    return expression;
}

// + -
function term(tokens, parser) {
    let expression = factor(tokens, parser);

    while(match(tokens, parser, PLUS, MINUS)) {
        let operator = previous(tokens, parser);
        let right = factor(tokens, parser);
        expression = new Binary(expression, operator, right);
    }

    return expression;
}

// * / %
function factor(tokens, parser) {
    let expression = unary(tokens, parser);

    while(match(tokens, parser, MODULO, ASTERISK, SLASH)) {
        let operator = previous(tokens, parser);
        let right = unary(tokens, parser);
        expression = new Binary(expression, operator, right);
    }

    return expression;
}

function unary(tokens, parser) {
    if(match(tokens, parser)) {
        const operator = previous(tokens, parser);
        const right = unary(tokens, parser);
        return new Unary(operator, right);
    }
    
    return call(tokens, parser);
}

function call(tokens, parser) {
    let identifier = primary(tokens, parser);

    if (match(tokens, parser, LEFT_PARENTHESIS)) {
        let arg_identifiers = args(tokens, parser);
        consume(tokens, parser, RIGHT_PARENTHESIS);

        return new Call(identifier, null, arg_identifiers);
    }

    return identifier;
}

function args(tokens, parser) {
    let args = [];

    if(!check(tokens, parser, RIGHT_PARENTHESIS)) {
        args.push(expression(tokens, parser));
    }

    while(match(tokens, parser, COMMA)) {
        args.push(expression(tokens, parser));
    }

    return args;
}

function primary(tokens, parser) {
    if(match(tokens, parser, I32)) {
        const value = previous(tokens, parser);
        return new Literal(value.literal, I32_IDENTIFIER);
    }

    if(match(tokens, parser, STRING)) {
        const value = previous(tokens, parser);
        return new Literal(value.literal, STRING_IDENTIFIER);
    }

    if(match(tokens, parser, IDENTIFIER)) {
        const name = previous(tokens, parser);
        return new Variable(name);
    }

    reportParserError(peek(tokens, parser), `Unknown token.`);
}

function match(tokens, parser, ...types) {
    for(const type of types) {
        if(check(tokens, parser, type)) {
            advance(tokens, parser);
            return true;
        }
    }

    return false;
}

function consume(tokens, parser, type, error) {
    if(check(tokens, parser, type)) return advance(tokens, parser);

    reportParserError(previous(tokens, parser), error);
}

function check(tokens, parser, type) {
    if(isAtEnd(tokens, parser)) return false;
    return peek(tokens, parser).type === type;
}

function advance(tokens, parser) {
    if (!isAtEnd(tokens, parser)) {
        ++parser.current;
    }

    return previous(tokens, parser);
}

function isAtEnd(tokens, parser) {
    return peek(tokens, parser).type === EOF;
}

function peek(tokens, parser) {
    return tokens[parser.current];
}

function previous(tokens, parser) {
    if(parser.current == 0) return tokens[parser.current];
    return tokens[parser.current - 1];
}

function reportParserError(token, message) {
    if(token.type === EOF) {
        reportError(token.line, ` at end of line`, message);
    } else {
        reportError(token.line, ` at "${token.lexeme}"`, message);
    }
}

function synchronize(tokens, parser) {
    advance(tokens, parser);

    while(!isAtEnd(tokens, parser)) {
        // skips blocks on error to solve dangling right brace
        if(previous(tokens, parser).type === LEFT_BRACE) {
            while(previous(tokens, parser).type !== RIGHT_BRACE && !isAtEnd(tokens, parser)) {
                advance(tokens, parser);
            }
        }

        if(previous(tokens, parser).type === SEMICOLON) return;

        switch (peek(tokens, parser).type) {
            case LET:
            case PRINT:
            case IF:
                return;
        }
    
        advance(tokens, parser);
    }
}