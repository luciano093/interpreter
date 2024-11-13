export function generateError(line, message) {
    reportError(line, "", message);
}

export function reportError(line, where, message) {
    throw new String(`[line ${line}] Error${where}: ${message}`);
}