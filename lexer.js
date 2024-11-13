import { EOF, EQUAL, I32, I32_IDENTIFIER, IDENTIFIER, LET, SEMICOLON, TYPE_SPECIFIER, PLUS, PRINT, STRING, STRING_IDENTIFIER, LEFT_BRACE, RIGHT_BRACE, LEFT_PARENTHESIS, RIGHT_PARENTHESIS, IF, ELSE, EQUAL_EQUAL, OR, AND, WHILE, MINUS, LESS_THAN, GREATER_THAN, MODULO, FOR, LESS_THAN_EQUAL, GREATER_THAN_EQUAL, SLASH, ASTERISK } from "./symbols.js";
import { Token } from "./token.js";
import { generateError } from "./error.js";

const keywords = {
    "let": LET,
    "if": IF,
    "while": WHILE,
    "for": FOR,
    "else": ELSE,
    "i32": I32_IDENTIFIER,
    "string": STRING_IDENTIFIER,
    "print": PRINT,
};

export function lex(source) {
    const lexer = {
        tokens: [],
        source,
        current: 0,
        start: 0,
        line: 1,
    };

    while(!isAtEnd(lexer)) {
        lexer.start = lexer.current;
        scanToken(lexer);
    }

    lexer.tokens.push(new Token(EOF, "", null, lexer.line))

    return lexer.tokens;
}

function scanToken(lexer) {
    const character = advance(lexer);

    switch (character) {
        case "*":
            addToken(lexer, ASTERISK);
            break;
        case "%":
            addToken(lexer, MODULO);
            break;
        case "+":
            addToken(lexer, PLUS);
            break;
        case "-":
            addToken(lexer, MINUS);
            break;
        case ":":
            addToken(lexer, TYPE_SPECIFIER);
            break;
        case "=":
            if(match(lexer, "=")) {
                addToken(lexer, EQUAL_EQUAL);
            } else {
                addToken(lexer, EQUAL);
            }
            break;
        case "<":
            if (match(lexer, "=")) {
                addToken(lexer, LESS_THAN_EQUAL);
            } else {
                addToken(lexer, LESS_THAN);
            }
            break;
        case ">":
            if (match(lexer, "=")) {
                addToken(lexer, GREATER_THAN_EQUAL);
            } else {
                addToken(lexer, GREATER_THAN);
            }
            break;
        case "|":
            if(match(lexer, "|")) {
                addToken(lexer, OR);
                break;
            }
            generateError(lexer.line, `Bitwise OR not yet supported.`);
        case "&":
            if(match(lexer, "&")) {
                addToken(lexer, AND);
                break;
            }
            generateError(lexer.line, `Bitwise AND not yet supported.`);
        case ";":
            addToken(lexer, SEMICOLON);
            break;
        case "/":
            if(match(lexer, "/")) {
                while(peek(lexer) != "\n" && !isAtEnd(lexer)) {
                    advance(lexer);
                }
            } else {
                addToken(lexer, SLASH);
            }
            break;
        case "(":
            addToken(lexer, LEFT_PARENTHESIS);
            break;
        case ")":
            addToken(lexer, RIGHT_PARENTHESIS);
            break;
        case "{":
            addToken(lexer, LEFT_BRACE);
            break;
        case "}":
            addToken(lexer, RIGHT_BRACE);
            break;
        case "\"":
            while(peek(lexer) != "\"" && peek(lexer) != "\n" && !isAtEnd(lexer)) {
                advance(lexer);
            }
            if(!match(lexer, "\"")) {
                generateError(lexer.line, `Unclosed string`);
            }

            addTokenLiteral(lexer, STRING, String(lexer.source.slice(lexer.start + 1, lexer.current - 1)))
            break;
        case "\n":
            ++lexer.line;
            break;
        case " ":
        case "\r":
            break;
        default:
            if(isDigit(character)) number(lexer);
            else if(isAlpha(character)) identifier(lexer);
            else generateError(lexer.line, `Unexpected character "${character}".`);

            break;
    }
}

function isAtEnd(lexer) {
    return lexer.current >= lexer.source.length;
}

function isDigit(character) {
    return character >= "0" && character <= "9";
}

function isAlpha(character) {
    return (character >= "a" && character <= "z") || (character >= "A" && character <= "Z") || character == "_";
}

function isAlphaNumeric(character) {
    return isAlpha(character) || isDigit(character);
}

function match(lexer, expected) {
    if(isAtEnd(lexer)) return false;
    if(peek(lexer) != expected) return false;
    advance(lexer);

    return true;
}

function advance(lexer) {
    const character = lexer.source[lexer.current];
    ++lexer.current;
    return character;
}

function peek(lexer) {
    if(isAtEnd(lexer)) return "\0";

    return lexer.source[lexer.current];
}

function number(lexer) {
    while(isDigit(peek(lexer))) {
        advance(lexer);
    }

    addTokenLiteral(lexer, I32, Number(lexer.source.slice(lexer.start, lexer.current)));
}

function identifier(lexer) {
    while(isAlphaNumeric(peek(lexer))) advance(lexer);

    const lexeme = lexer.source.slice(lexer.start, lexer.current);
    let type = keywords[lexeme];

    if(type === undefined) type = IDENTIFIER;

    addToken(lexer, type);
}

function addToken(lexer, type) {
    const lexeme = lexer.source.slice(lexer.start, lexer.current);
    lexer.tokens.push(new Token(type, lexeme, null, lexer.line));
}

function addTokenLiteral(lexer, type, literal) {
    const lexeme = lexer.source.slice(lexer.start, lexer.current);
    lexer.tokens.push(new Token(type, lexeme, literal, lexer.line));
}