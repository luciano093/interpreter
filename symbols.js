// single-character tokens
export const TYPE_SPECIFIER = Symbol.for("TYPE SPECIFIER");
export const SEMICOLON = Symbol.for("SEMICOLON");
export const DOUBLE_QUOTES = Symbol.for("DOUBLE QUOTES");
export const LEFT_BRACE = Symbol.for("LEFT BRACE");
export const RIGHT_BRACE = Symbol.for("RIGHT BRACE");
export const LEFT_PARENTHESIS = Symbol.for("LEFT PARENTHESIS");
export const RIGHT_PARENTHESIS = Symbol.for("RIGHT PARENTHESIS");
export const PLUS = Symbol.for("PLUS");
export const MINUS = Symbol.for("MINUS");
export const MODULO = Symbol.for("MODULO");
export const ASTERISK = Symbol.for("ASTERISK");
export const SLASH = Symbol.for("SLASH");

export const EQUAL = Symbol.for("EQUAL");
export const LESS_THAN = Symbol.for("LESS_THAN");
export const GREATER_THAN = Symbol.for("GREATER_THAN");

// two-character tokens
export const EQUAL_EQUAL = Symbol.for("EQUAL_EQUAL");
export const LESS_THAN_EQUAL = Symbol.for("LESS_THAN_EQUAL");
export const GREATER_THAN_EQUAL = Symbol.for("GREATER_THAN_EQUAL");
export const OR = Symbol.for("OR");
export const AND = Symbol.for("AND");

// type identifiers
export const I32_IDENTIFIER = Symbol.for("I32 IDENTIFIER");
export const STRING_IDENTIFIER = Symbol.for("STRING IDENTIFIER");

// literals
export const IDENTIFIER = Symbol.for("IDENTIFIER");
export const I32 = Symbol.for("I32");
export const STRING = Symbol.for("STRING");

// keywords
export const IF = Symbol.for("IF");
export const WHILE = Symbol.for("WHILE");
export const FOR = Symbol.for("FOR");
export const ELSE = Symbol.for("ELSE");
export const LET = Symbol.for("LET");
export const EOF = Symbol.for("EOF");

// temporary
export const PRINT = Symbol.for("PRINT");