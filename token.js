export class Token {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return `${Symbol.keyFor(this.type)} ${this.lexeme} ${this.literal}`;
    }
}