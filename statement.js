export class Expression {
    constructor(expression) {
        this.expression = expression;
    }
}
export class Block {
    constructor(statements) {
        this.statements = statements;
    }
}

export class If {
    constructor(condition, thenBranch, elseBranch) {
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

export class While {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }
}

export class Print {
    constructor(expression) {
        this.expression = expression;
    }
}

export class Let {
    constructor(name, type, expression) {
        this.name = name;
        this.type = type;
        this.expression = expression;
    }
}

export class FunctionDeclaration {
    constructor(name, parameters, body) {
        this.name = name;
        this.parameters = parameters;
        this.body = body;
    }
}

export class Return {
    constructor(token, value) {
        this.token = token;
        this.value = value;
    }
}