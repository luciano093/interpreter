# Interpreter
**Interpreter** is a lightweight, C-like programming language designed with modern, Rust-inspired syntax. It offers traditional programming concepts seen in imperative languages such as C, C++, Java, C# while offering superior clarity and expressiveness. While this language is still work in progress, it shows the expressiveness of what a language like C can look like with modern features such as more concrete types.

## Features

- **Rust-like Syntax**: Combines the familiarity of C with Rust’s modern syntax.
- **Functions with Type Annotations**: Clear and explicit function signatures for better readability and type safety.
- **Modern Control Flow**: `if`, `for`, and `let` statements with clean and minimalistic syntax.
- **TODO Enhancements**: Placeholder functionality for future expansions, such as stricter type checks and additional syntax rules.

- 
## Code Example

Here's an example of the language in action:

```rust

fn is_prime(num: i32) {
    if (num < 2) return 0;

    for(let i: i32 = 2;; i * i <= num; i = i + 1) {
        if (num % i == 0) {
            return 0;
        }
    }
    
    return 1;
}

fn print_primes(start: i32, end: i32) {
    for(let num: i32 = start; num < end; num = num + 1) {
        if (is_prime(num)) print num;
    }
}

print_primes(1, 10);        // Prints: 2, 3, 5, 7
