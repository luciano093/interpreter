export class Binary {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class Logical {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class Grouping {
    constructor(expression) {
        this.expression = expression;
    }
}

export class Literal {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}

export class Unary {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }
}

export class Variable {
    constructor(name) {
        this.name = name;
    }
}

export class Assign {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}