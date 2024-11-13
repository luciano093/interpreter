import { reportError } from "./error.js";

export class Environment {
    constructor(parent = null) {
        this.values = {};
        this.types = {};
        this.parent = parent;
    }

    define(name, value, type) {
        this.values[name] = value;
        this.types[name] = type;
    }

    assign(token, value) {
        if(this.values.hasOwnProperty(token.lexeme)) {
            this.values[token.lexeme] = value;
            return;
        } else if(this.parent) {
            this.parent.assign(token, value);
            return;
        }

        reportError(token.line, ` at ${token.lexeme}`, "Undefined variable.");
    }

    get(token) {
        if(this.values.hasOwnProperty(token.lexeme)) {
            return this.values[token.lexeme];
        } else if(this.parent) {
            return this.parent.get(token);
        }

        reportError(token.line, ` at ${token.lexeme}`, "Undefined variable.");
    }

    getType(token) {
        if(this.values.hasOwnProperty(token.lexeme)) {
            return this.types[token.lexeme];
        } else if(this.parent) {
            return this.parent.getType(token);
        }

        reportError(token.line, ` at ${token.lexeme}`, "Undefined variable.");
    }
}