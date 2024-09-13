# IrregularExpression 📐

A fluent, human-readable wrapper for building and using regular expressions in TypeScript/Deno! Simplify regex creation with an intuitive, chainable API, making complex patterns more accessible and less error-prone.

## 🚀 Quick Start

- 🔧 **Install:** Easily add `IrregularExpression` to your Deno project.
- 📚 **Documentation:** Comprehensive API details for full control over regex.
- 🧪 **Examples:** Practical, real-world examples to get you started immediately.
- 💬 **Contribute:** Join the community to improve and extend the module.

## 🔧 Installation

To use `IrregularExpression` in your Deno project, import it directly from the URL:

```typescript
import { IrregularExpression } from "@findhow/irregular-expression";
```

## 📚 API Overview

### `IrregularExpression.match()`
Initialize a new regex builder.

```typescript
const pattern = IrregularExpression.match()
  .startOfLine()
  .exactly(3).digit()
  .then('-')
  .exactly(3).digit()
  .then('-')
  .exactly(4).digit()
  .endOfLine()
  .build();

"Some string".test(pattern)
```

### Features
- **Flags**: `ignoreCase()`, `multiline()`, `dotAll()`, `unicode()`
- **Quantifiers**: `exactly(n)`, `atLeast(n)`, `between(n, m)`, `zeroOrMore()`, `oneOrMore()`, `zeroOrOne()`
- **Character Classes**: `digit()`, `nonDigit()`, `wordCharacter()`, `nonWordCharacter()`, `whitespace()`, `nonWhitespace()`, `anyCharacterExcept(chars)`
- **Position Matching**: `startOfLine()`, `endOfLine()`, `wordBoundary()`
- **Groups and Lookarounds**: `capture()`, `namedCapture()`, `nonCapturingGroup()`, `positiveLookahead()`, `negativeLookahead()`, `positiveLookbehind()`, `negativeLookbehind()`
- **Others**: `literal()`, `anySingleCharacter()`, `range()`, `notInRange()`, `anyOf()`, `noneOf()`, `or()`, `combine()`, `backreference()`, `namedBackreference()`

### Methods
- **`build()`** - Builds and returns the RegExp object.
- **`test(input)`** - Tests if the regex matches the input string.
- **`execute(input)`** - Executes the regex on the input string and returns the match results.
- **`replace(input, replacement)`** - Replaces matches in the input string with the provided replacement.

## 🧪 Usage Examples

### Example 1: Simple Phone Number Validator

```typescript
const regex = IrregularExpression.match()
  .startOfLine()
  .exactly(3).digit()
  .then('-')
  .exactly(3).digit()
  .then('-')
  .exactly(4).digit()
  .endOfLine()
  .build();

console.log(regex.toString()); // Outputs: /^\d{3}-\d{3}-\d{4}$/
console.log(regex.test("123-456-7890")); // true
console.log(regex.test("12-34-5678")); // false
```

### Example 2: Extract Data from Serialized JSON

Use `IrregularExpression` to find and extract specific values from serialized JSON.

```typescript
const jsonRegex = IrregularExpression.match()
  .literal('"name"')
  .whitespace().zeroOrMore()
  .literal(':')
  .whitespace().zeroOrMore()
  .literal('"')
  .
```

### Example 3: Scrape Specific Log Information from a Large Text File

Extract all error messages from a log file where each error message is prefixed by `[ERROR]`.

```typescript
const logRegex = IrregularExpression.match()
  .literal("[ERROR]")
  .whitespace()
  .capture(group => group
    .anySingleCharacter()
    .zeroOrMore()
  )
  .build();

const logContent = `
[INFO] Application started
[ERROR] Failed to connect to database
[WARNING] Low disk space
[ERROR] User authentication failed
`;

const errors = logRegex.execute(logContent);
console.log(errors.map(error => error[1])); 
// Outputs: ["Failed to connect to database", "User authentication failed"]
```

### Example 4: Work with Property Addresses and Names

Extract property addresses and full names (first, middle, last) from inconsistent data formats.

```typescript
const addressRegex = IrregularExpression.match()
  .capture(group => group
    .digit()
    .oneOrMore()
  )
  .whitespace()
  .capture(group => group
    .anyOf('a-zA-Z')
    .oneOrMore()
  )
  .whitespace()
  .capture(group => group
    .anyOf('a-zA-Z')
    .oneOrMore()
  )
  .build();

const addressString = "123 Main St, Apt 4B";
const addressParts = addressRegex.execute(addressString);
console.log(addressParts.map(part => part[0])); 
// Outputs: ["123", "Main", "St"]

const nameRegex = IrregularExpression.match()
  .capture(group => group
    .wordCharacter()
    .oneOrMore()
  )
  .whitespace()
  .capture(group => group
    .wordCharacter()
    .oneOrMore()
    .zeroOrOne()
  )
  .whitespace()
  .capture(group => group
    .wordCharacter()
    .oneOrMore()
  )
  .build();

const nameString = "John Michael Doe";
const nameParts = nameRegex.execute(nameString);
console.log(nameParts.map(part => part[0])); 
// Outputs: ["John", "Michael", "Doe"]
```

### Example 5: Replace Words in a Sentence

```typescript
const regex = IrregularExpression.match()
  .literal("cat");

const input = "The cat sat on the mat.";
const result = regex.replace(input, "dog");
console.log(result); // "The dog sat on the mat."
```