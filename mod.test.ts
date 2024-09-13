// IrregularExpression.test.ts
import { assertEquals, assertFalse, assert } from "@std/assert";
import { IrregularExpression } from './mod.ts';

Deno.test("IrregularExpression - Basic Matching", () => {
  const regex = IrregularExpression.match()
    .startOfLine()
    .digit()
    .oneOrMore()
    .endOfLine()
    .build();

  assert(regex.test("12345"));
  assertFalse(regex.test("abc"));
  assertFalse(regex.test("123abc"));
});

Deno.test("IrregularExpression - Flags", () => {
  const regex = IrregularExpression.match()
    .literal("test")
    .ignoreCase()
    .multiline()
    .build();
  assertEquals(regex.flags, "gim");
});

Deno.test("IrregularExpression - Character Classes", () => {
  const regex = IrregularExpression.match()
    .digit()
    .nonDigit()
    .wordCharacter()
    .nonWordCharacter()
    .whitespace()
    .nonWhitespace()
    .build();

  assert(regex.test("1a_! x"));
});

Deno.test("IrregularExpression - Quantifiers", () => {
  const irregularRegex = IrregularExpression.match()
    .startOfLine()
    .digit()
    .exactly(3)
    .literal("-")
    .digit()
    .exactly(2)
    .literal("-")
    .digit()
    .between(1, 3)
    .endOfLine()
    .build();

  console.log("Quantifiers regex pattern:", irregularRegex.toString());

  // Create a standard JavaScript RegExp from our pattern
  const jsRegex = new RegExp(irregularRegex.toString().slice(1, -2)); // Remove leading / and trailing /g

  assert(jsRegex.test("123-45-6"));
  assert(jsRegex.test("123-45-678"));
  assert(!jsRegex.test("12-3-4"));
});

Deno.test("IrregularExpression - Groups", () => {
  const regex = IrregularExpression.match()
    .capture(group => group.digit().exactly(3))
    .literal("-")
    .namedCapture("number", (group: any) => group.digit().exactly(4));

  const match = regex.execute("123-4567")[0];
  assertEquals(match[1], "123");
  assertEquals(match.groups?.number, "4567");
});

Deno.test("IrregularExpression - Lookarounds", () => {
  const regex = IrregularExpression.match()
    .positiveLookahead(group => group.literal("foo"))
    .wordCharacter()
    .oneOrMore()
    .build();

  assert(regex.test("foobar"));
  assert(!regex.test("barfoo"));
});

Deno.test("IrregularExpression - Alternation", () => {
  const irregularRegex = IrregularExpression.match()
    .wordBoundary()
    .group(g => g
        .literal("cat")
        .or()
        .literal("dog")
    )
    .wordBoundary()
    .build();

    console.log("Alternation regex pattern:", irregularRegex.toString());

    // Create a standard JavaScript RegExp from our pattern
    const jsRegex = new RegExp(irregularRegex.toString().slice(1, -2)); // Remove leading / and trailing /g
  
  assert(jsRegex.test("cat"));
  assert(jsRegex.test("dog"));
  assert(!jsRegex.test("bird"));
  assert(!jsRegex.test("category"));
});

Deno.test("IrregularExpression - Complex Pattern", () => {
  const regex = IrregularExpression.match()
    .startOfLine()
    .capture(group => group
      .anyOf("A-Za-z")
      .wordCharacter()
      .oneOrMore()
    )
    .literal("@")
    .capture(group => group
      .anyOf("A-Za-z")
      .wordCharacter()
      .oneOrMore()
    )
    .literal(".")
    .capture(group => group
      .anyOf("A-Za-z")
      .exactly(3)
    )
    .endOfLine()
    .build();

  assert(regex.test("test@example.com"));
  assert(!regex.test("invalid-email@.com"));
});

Deno.test("IrregularExpression - Error Handling", () => {
  const regex = IrregularExpression.match();
  let errorMessage = "";
  regex.addEventListener("error", (event: Event) => {
    if (event instanceof CustomEvent) {
      errorMessage = event.detail;
    }
  });
  regex.runTimes(-1);
  assertEquals(errorMessage, "runTimes expects a positive integer.");
});

Deno.test("IrregularExpression - Execute Method", () => {
  const regex = IrregularExpression.match()
    .digit()
    .oneOrMore()
    .runTimes(2);

  const input = "123 abc 456 def 789";
  const matches = regex.execute(input);
  assertEquals(matches.length, 2);
  assertEquals(matches[0][0], "123");
  assertEquals(matches[1][0], "456");
});

Deno.test("IrregularExpression - Get Pattern", () => {
  const regex = IrregularExpression.match()
    .startOfLine()
    .digit()
    .oneOrMore()
    .endOfLine();

  assertEquals(regex.getPattern(), "^\\d+$");
});

// Example 1: Simple Phone Number Validator
Deno.test("README Example 1: Simple Phone Number Validator", () => {
  const regex = IrregularExpression.match()
    .startOfLine()
    .digit().exactly(3)
    .literal('-')
    .digit().exactly(3)
    .literal('-')
    .digit().exactly(4)
    .endOfLine()
    .build();

  assertEquals(regex.toString(), "/^\\d{3}-\\d{3}-\\d{4}$/g");
  assert(regex.test("123-456-7890"));
  assertFalse(regex.test("12-34-5678"));
});

// Example 2: Extract Data from Serialized JSON
Deno.test("README Example 2: Extract Data from Serialized JSON", () => {
  const jsonRegex = IrregularExpression.match()
    .literal('"name"')
    .whitespace().zeroOrMore()
    .literal(':')
    .whitespace().zeroOrMore()
    .literal('"')
    .capture(group => group
      .anyCharacterExcept('"').oneOrMore()
    )
    .literal('"')
    .build();

  const jsonString = '{"name": "John Doe", "age": 30, "city": "Las Vegas"}';
  const matches = jsonRegex.exec(jsonString);
  assertEquals(matches?.map((match: string) => match), ['"name": "John Doe"', "John Doe"]);
});

// Example 3: Scrape Specific Log Information from a Large Text File
Deno.test("README Example 3: Scrape Specific Log Information", () => {
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

  const errors = Array.from(logContent.matchAll(logRegex));
  assertEquals(errors.map((error: RegExpMatchArray) => error[1]), ["Failed to connect to database", "User authentication failed"]);
});

// Example 4: Work with Property Addresses and Names
Deno.test("README Example 4: Work with Property Addresses and Names", () => {
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
  const addressParts = addressRegex.exec(addressString);
  assertEquals(addressParts?.slice(1), ["123", "Main", "St"]);

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
  const nameParts = nameRegex.exec(nameString);
  assertEquals(nameParts?.slice(1), ["John", "Michael", "Doe"]);
});

// Example 5: Replace Words in a Sentence
Deno.test("README Example 5: Replace Words in a Sentence", () => {
  const regex = IrregularExpression.match()
    .literal("cat")
    .build();

  const input = "The cat sat on the mat.";
  const result = input.replace(regex, "dog");
  assertEquals(result, "The dog sat on the mat.");
});
