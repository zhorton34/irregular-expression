/**
 * IrregularExpression: A fluent wrapper for building and using regular expressions.
 * 
 * This class provides an intuitive and human-readable way to construct and use
 * regular expressions in TypeScript/Deno. It offers a chainable API that makes
 * creating complex regex patterns more accessible and less error-prone.
 * 
 * @example
 * ```typescript
 * const regex = IrregularExpression.match()
 *   .startOfLine()
 *   .exactly(3).digit()
 *   .then('-')
 *   .exactly(3).digit()
 *   .then('-')
 *   .exactly(4).digit()
 *   .endOfLine()
 *   .build();
 * 
 * console.log(regex.toString()); // Outputs: /^\\d{3}-\\d{3}-\\d{4}$/g
 * console.log(regex.test("123-456-7890")); // true
 * console.log(regex.test("12-34-5678")); // false
 * ```
 */
export class IrregularExpression extends EventTarget {
    /** The current regex pattern being built */
    private pattern: string;

    /** The set of flags to be applied to the regex */
    private flags: Set<string>;

    /** The maximum number of times the regex should run, if set */
    private maxRun: number | null;

    /**
     * Private constructor to initialize a new IrregularExpression instance.
     * Use {@link IrregularExpression.match} to create a new instance.
     */
    private constructor() {
        super();
        this.pattern = '';
        this.flags = new Set(['g']); // Global flag enabled by default
        this.maxRun = null;
    }

    /**
     * Initializes a new regex builder.
     * 
     * @returns A new instance of IrregularExpression
     * 
     * @example
     * ```typescript
     * const regexBuilder = IrregularExpression.match();
     * ```
     */
    static match(): IrregularExpression {
        return new IrregularExpression();
    }

    /**
     * Adds the 'i' flag for case-insensitive matching.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("hello")
     *   .ignoreCase()
     *   .build();
     * 
     * console.log(regex.test("Hello")); // true
     * console.log(regex.test("HELLO")); // true
     * ```
     */
    ignoreCase(): this {
        if (!this.flags.has('i')) this.flags.add('i');
        return this;
    }

    /**
     * Adds the 'm' flag for multi-line matching.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .startOfLine()
     *   .literal("hello")
     *   .endOfLine()
     *   .multiline()
     *   .build();
     * 
     * const text = "hello\nworld\nhello";
     * console.log(regex.test(text)); // true
     * console.log(text.match(regex)?.length); // 2
     * ```
     */
    multiline(): this {
        if (!this.flags.has('m')) this.flags.add('m');
        return this;
    }

    /**
     * Adds the 's' flag for dotAll matching (dot matches newlines).
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .anything()
     *   .dotAll()
     *   .build();
     * 
     * const text = "hello\nworld";
     * console.log(regex.test(text)); // true
     * ```
     */
    dotAll(): this {
        if (!this.flags.has('s')) this.flags.add('s');
        return this;
    }

    /**
     * Adds the 'u' flag for unicode matching.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .unicode()
     *   .literal("🌍")
     *   .build();
     * 
     * console.log(regex.test("Hello 🌍")); // true
     * ```
     */
    unicode(): this {
        if (!this.flags.has('u')) this.flags.add('u');
        return this;
    }

    /**
     * Sets the maximum number of matches to collect.
     * 
     * @param count The maximum number of matches to collect.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .oneOrMore()
     *   .runTimes(3)
     *   .build();
     * 
     * const text = "1 2 3 4 5";
     * console.log(text.match(regex)?.length); // 3
     * ```
     */
    runTimes(count: number): this {
        if (count <= 0 || !Number.isInteger(count)) {
            this.emitError('runTimes expects a positive integer.');
            return this;
        }
        this.maxRun = count;
        return this;
    }

    /**
     * Matches the start of a line.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .startOfLine()
     *   .literal("Hello")
     *   .build();
     * 
     * console.log(regex.test("Hello world")); // true
     * console.log(regex.test(" Hello world")); // false
     * ```
     */
    startOfLine(): this {
        this.pattern += '^';
        return this;
    }

    /**
     * Matches the end of a line.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("world")
     *   .endOfLine()
     *   .build();
     * 
     * console.log(regex.test("Hello world")); // true
     * console.log(regex.test("world of wonders")); // false
     * ```
     */
    endOfLine(): this {
        this.pattern += '$';
        return this;
    }

    /**
     * Matches any single character.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("c")
     *   .anySingleCharacter()
     *   .literal("t")
     *   .build();
     * 
     * console.log(regex.test("cat")); // true
     * console.log(regex.test("cut")); // true
     * console.log(regex.test("c t")); // true
     * console.log(regex.test("ct")); // false
     * ```
     */
    anySingleCharacter(): this {
        this.pattern += '.';
        return this;
    }

    /**
     * Matches zero or more occurrences of the previous pattern.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("a")
     *   .zeroOrMore()
     *   .literal("b")
     *   .build();
     * 
     * console.log(regex.test("b")); // true
     * console.log(regex.test("ab")); // true
     * console.log(regex.test("aab")); // true
     * console.log(regex.test("c")); // false
     * ```
     */
    zeroOrMore(): this {
        this.pattern += '*';
        return this;
    }

    /**
     * Matches one or more occurrences of the previous pattern.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("a")
     *   .oneOrMore()
     *   .literal("b")
     *   .build();
     * 
     * console.log(regex.test("ab")); // true
     * console.log(regex.test("aab")); // true
     * console.log(regex.test("b")); // false
     * ```
     */
    oneOrMore(): this {
        this.pattern += '+';
        return this;
    }

    /**
     * Matches zero or one occurrence of the previous pattern.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("colou")
     *   .literal("r").zeroOrOne()
     *   .build();
     * 
     * console.log(regex.test("color")); // true
     * console.log(regex.test("colour")); // true
     * console.log(regex.test("colouur")); // false
     * ```
     */
    zeroOrOne(): this {
        this.pattern += '?';
        return this;
    }

    /**
     * Matches a literal string, escaping special regex characters.
     * 
     * @param text The literal text to match.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("hello world")
     *   .build();
     * 
     * console.log(regex.test("hello world")); // true
     * console.log(regex.test("hello_world")); // false
     * ```
     */
    literal(text: string): this {
        this.pattern += this.escapeRegExp(text);
        return this;
    }

    /**
     * Matches any digit (0-9).
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .build();
     * 
     * console.log(regex.test("5")); // true
     * console.log(regex.test("a")); // false
     * ```
     */
    digit(): this {
        this.pattern += '\\d';
        return this;
    }

    /**
     * Matches any non-digit character.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .nonDigit()
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test(" ")); // true
     * console.log(regex.test("5")); // false
     * ```
     */
    nonDigit(): this {
        this.pattern += '\\D';
        return this;
    }

    /**
     * Matches any word character (alphanumeric + underscore).
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .wordCharacter()
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test("5")); // true
     * console.log(regex.test("_")); // true
     * console.log(regex.test(" ")); // false
     * ```
     */
    wordCharacter(): this {
        this.pattern += '\\w';
        return this;
    }

    /**
     * Matches any non-word character.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .nonWordCharacter()
     *   .build();
     * 
     * console.log(regex.test("a")); // false
     * console.log(regex.test("!")); // true
     * console.log(regex.test("_")); // false
     * ```
     */
    nonWordCharacter(): this {
        this.pattern += '\\W';
        return this;
    }

    /**
     * Matches a whitespace character.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .whitespace()
     *   .build();
     * 
     * console.log(regex.test(" ")); // true
     * console.log(regex.test("\t")); // true
     * console.log(regex.test("a")); // false
     * ```
     */
    whitespace(): this {
        this.pattern += '\\s';
        return this;
    }

    /**
     * Matches a non-whitespace character.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .nonWhitespace()
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test("5")); // true
     * console.log(regex.test(" ")); // false
     * ```
     */
    nonWhitespace(): this {
        this.pattern += '\\S';
        return this;
    }

    /**
     * Matches a word boundary.
     * 
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .wordBoundary()
     *   .literal("cat")
     *   .wordBoundary()
     *   .build();
     * 
     * console.log(regex.test("cat")); // true
     * console.log(regex.test("the cat")); // true
     * console.log(regex.test("category")); // false
     * ```
     */
    wordBoundary(): this {
        this.pattern += '\\b';
        return this;
    }

    /**
     * Matches characters in a specific range.
     * 
     * @param start The start of the range.
     * @param end The end of the range.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .range('a', 'z')
     *   .build();
     * 
     * console.log(regex.test("m")); // true
     * console.log(regex.test("A")); // false
     * console.log(regex.test("5")); // false
     * ```
     */
    range(start: string, end: string): this {
        this.pattern += `[${start}-${end}]`;
        return this;
    }

    /**
     * Matches any character not in a specific range.
     * 
     * @param start The start of the range to exclude.
     * @param end The end of the range to exclude.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .notInRange('0', '9')
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test("!")); // true
     * console.log(regex.test("5")); // false
     * ```
     */
    notInRange(start: string, end: string): this {
        this.pattern += `[^${start}-${end}]`;
        return this;
    }

    /**
     * Matches any of the specified characters.
     * 
     * @param chars The characters to match.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .anyOf("aeiou")
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test("e")); // true
     * console.log(regex.test("b")); // false
     * console.log(regex.test("1")); // false
     * ```
     */
    anyOf(chars: string): this {
        this.pattern += `[${this.escapeRegExp(chars)}]`;
        return this;
    }

    /**
     * Matches any character not in the specified set.
     * 
     * @param chars The characters to exclude.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .noneOf("0123456789")
     *   .build();
     * 
     * console.log(regex.test("a")); // true
     * console.log(regex.test("!")); // true
     * console.log(regex.test("5")); // false
     * ```
     */
    noneOf(chars: string): this {
        this.pattern += `[^${this.escapeRegExp(chars)}]`;
        return this;
    }

    /**
     * Matches any character except those specified.
     * @param chars - The characters to exclude from matching.
     * @returns The current IrregularExpression instance for method chaining.
     */
    anyCharacterExcept(chars: string): this {
        this.pattern += `[^${this.escapeSpecialChars(chars)}]`;
        return this;
    }

    /**
     * Escapes special characters in a string for use in a regular expression.
     * @param str - The string containing characters to escape.
     * @returns The input string with special characters escaped.
     * @private
     */
    private escapeSpecialChars(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Matches the given pattern exactly n times.
     * 
     * @param n The number of times to match.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .exactly(3)
     *   .build();
     * 
     * console.log(regex.test("123")); // true
     * console.log(regex.test("12")); // false
     * console.log(regex.test("1234")); // false
     * ```
     */
    exactly(n: number): this {
        if (!Number.isInteger(n) || n < 0) {
            this.emitError('exactly expects a non-negative integer.');
            return this;
        }
        this.pattern += `{${n}}`;
        return this;
    }

    /**
     * Matches the given pattern at least n times.
     * 
     * @param n The minimum number of times to match.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .atLeast(2)
     *   .build();
     * 
     * console.log(regex.test("12")); // true
     * console.log(regex.test("123")); // true
     * console.log(regex.test("1")); // false
     * ```
     */
    atLeast(n: number): this {
        if (!Number.isInteger(n) || n < 0) {
            this.emitError('atLeast expects a non-negative integer.');
            return this;
        }
        this.pattern += `{${n},}`;
        return this;
    }

    /**
     * Matches the given pattern between n and m times (inclusive).
     * 
     * @param n The minimum number of times to match.
     * @param m The maximum number of times to match.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .between(2, 4)
     *   .build();
     * 
     * console.log(regex.test("12")); // true
     * console.log(regex.test("123")); // true
     * console.log(regex.test("1234")); // true
     * console.log(regex.test("1")); // false
     * console.log(regex.test("12345")); // false
     * ```
     */
    between(n: number, m: number): this {
        if (!Number.isInteger(n) || !Number.isInteger(m) || n < 0 || m < n) {
            this.emitError('between expects two non-negative integers where m >= n.');
            return this;
        }
        this.pattern += `{${n},${m}}`;
        return this;
    }

    /**
     * Creates a capturing group.
     * 
     * @param callback A function that defines the pattern within the group.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .capture(group => group
     *     .digit()
     *     .exactly(3)
     *   )
     *   .literal("-")
     *   .capture(group => group
     *     .digit()
     *     .exactly(4)
     *   )
     *   .build();
     * 
     * const match = regex.exec("123-4567");
     * console.log(match[1]); // "123"
     * console.log(match[2]); // "4567"
     * ```
     */
    capture(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a named capturing group.
     * 
     * @param name The name of the capturing group.
     * @param callback A function that defines the pattern within the group.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .namedCapture("area", group => group
     *     .digit()
     *     .exactly(3)
     *   )
     *   .literal("-")
     *   .namedCapture("number", group => group
     *     .digit()
     *     .exactly(4)
     *   )
     *   .build();
     * 
     * const match = regex.exec("123-4567");
     * console.log(match.groups.area); // "123"
     * console.log(match.groups.number); // "4567"
     * ```
     */
    namedCapture(name: string, callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?<${name}>${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a non-capturing group.
     * 
     * @param callback A function that defines the pattern within the group.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .nonCapturingGroup(group => group
     *     .literal("Mr")
     *     .or()
     *     .literal("Mrs")
     *   )
     *   .literal(" ")
     *   .oneOrMore()
     *   .wordCharacter()
     *   .build();
     * 
     * console.log(regex.test("Mr Smith")); // true
     * console.log(regex.test("Mrs Johnson")); // true
     * console.log(regex.test("Ms Davis")); // false
     * ```
     */
    nonCapturingGroup(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?:${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a positive lookahead assertion.
     * 
     * @param callback A function that defines the pattern to look ahead for.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .wordCharacter()
     *   .oneOrMore()
     *   .positiveLookahead(group => group
     *     .literal("@")
     *   )
     *   .build();
     * 
     * console.log(regex.test("user@domain.com")); // true
     * console.log(regex.test("userdomain.com")); // false
     * ```
     */
    positiveLookahead(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?=${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a negative lookahead assertion.
     * 
     * @param callback A function that defines the pattern to not look ahead for.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .wordCharacter()
     *   .oneOrMore()
     *   .negativeLookahead(group => group
     *     .literal("@")
     *   )
     *   .build();
     * 
     * console.log(regex.test("username")); // true
     * console.log(regex.test("user@domain.com")); // false
     * ```
     */
    negativeLookahead(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?!${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a positive lookbehind assertion.
     * 
     * @param callback A function that defines the pattern to look behind for.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .positiveLookbehind(group => group
     *     .literal("$")
     *   )
     *   .digit()
     *   .oneOrMore()
     *   .build();
     * 
     * console.log(regex.test("$100")); // true
     * console.log(regex.test("100")); // false
     * ```
     */
    positiveLookbehind(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?<=${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Creates a negative lookbehind assertion.
     * 
     * @param callback A function that defines the pattern to not look behind for.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .negativeLookbehind(group => group
     *     .literal("$")
     *   )
     *   .digit()
     *   .oneOrMore()
     *   .build();
     * 
     * console.log(regex.test("100")); // true
     * console.log(regex.test("$100")); // false
     * ```
     */
    negativeLookbehind(callback: (group: IrregularExpression) => IrregularExpression): this {
        const groupBuilder = IrregularExpression.match();
        callback(groupBuilder);
        this.pattern += `(?<!${groupBuilder.getPattern()})`;
        return this;
    }

    /**
     * Matches either the previous pattern or the pattern defined in the callback.
     * 
     * @param callback A function that defines the alternative pattern. If undefined, an empty alternative is created.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("cat")
     *   .or(alt => alt
     *     .literal("dog")
     *   )
     *   .build();
     * 
     * console.log(regex.test("cat")); // true
     * console.log(regex.test("dog")); // true
     * console.log(regex.test("bird")); // false
     * ```
     */
    or(callback?: (alt: IrregularExpression) => IrregularExpression): this {
        this.pattern += '|';
        if (callback) {
            const altBuilder = IrregularExpression.match();
            callback(altBuilder);
            this.pattern += altBuilder.getPattern();
        }
        return this;
    }

    /**
     * Creates a capturing group.
     * 
     * @param callback A function that defines the pattern within the group.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .capture(group => group
     *     .digit()
     *     .exactly(3)
     *   )
     *   .literal("-")
     *   .capture(group => group
     *     .digit()
     *     .exactly(4)
     *   )
     *   .build();
     * 
     * const match = regex.exec("123-4567");
     * console.log(match[1]); // "123"
     * console.log(match[2]); // "4567"
     * ```
     */
    group(callback: (group: IrregularExpression) => void): this {
        this.pattern += '(';
        callback(this);
        this.pattern += ')';
        return this;
    }

    /**
     * Builds the final regular expression.
     * @returns {RegExp} The built regular expression.
     *
     * @example
     * ## Builds the final regular expression.
     * 
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .startOfLine()
     *   .digit()
     *   .oneOrMore()
     *   .endOfLine()
     *   .build();
     * 
     * console.log(regex.test("12345")); // true
     * console.log(regex.test("abc")); // false
     * ```
     */
    build(): RegExp {
        try {
            return new RegExp(this.pattern, Array.from(this.flags).join(''));
        } catch (error) {
            this.emitError(`Invalid regex pattern: ${error.message}`);
            // Return a regex that matches nothing to prevent further errors
            return new RegExp('(?!x)x');
        }
    }

    /**
     * Tests if the regex matches the input string.
     * 
     * @param input The string to test against the regex.
     * @returns True if a match is found, otherwise false.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .oneOrMore()
     *   .build();
     * 
     * console.log(regex.test("12345")); // true
     * console.log(regex.test("abc")); // false
     * ```
     */
    test(input: string): boolean {
        try {
            const regex = this.build();
            return regex.test(input);
        } catch (error) {
            this.emitError(`Test failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Executes the regex on the input string and returns the match results.
     * 
     * @param input The string to match against the regex.
     * @returns An array of RegExpExecArray results up to maxRun, or all matches if maxRun is null.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .digit()
     *   .oneOrMore()
     *   .build();
     * 
     * const input = "123 abc 456 def 789";
     * const matches = regex.execute(input);
     * console.log(matches.map(m => m[0])); // ["123", "456", "789"]
     * ```
     */
    execute(input: string): RegExpExecArray[] {
        const regex = this.build();
        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray | null;
        let count = 0;

        while ((match = regex.exec(input)) !== null) {
            matches.push(match);
            count += 1;
            if (this.maxRun !== null && count >= this.maxRun) {
                break;
            }
        }

        return matches;
    }

    /**
     * Gets the regex pattern as a string.
     * 
     * @returns The current regex pattern.
     * 
     * @example
     * ```typescript
     * const regexBuilder = IrregularExpression.match()
     *   .startOfLine()
     *   .digit()
     *   .oneOrMore()
     *   .endOfLine();
     * 
     * console.log(regexBuilder.getPattern()); // "^\\d+$"
     * ```
     */
    getPattern(): string {
        return this.pattern;
    }

    /**
     * Combines multiple IrregularExpression instances into one.
     * 
     * @param expressions The IrregularExpression instances to combine.
     * @returns A new IrregularExpression instance with combined patterns and flags.
     * 
     * @example
     * ```typescript
     * const regex1 = IrregularExpression.match()
     *   .literal("cat")
     *   .build();
     * 
     * const regex2 = IrregularExpression.match()
     *   .literal("dog")
     *   .build();
     * 
     * const combinedRegex = IrregularExpression.combine(regex1, regex2)
     *   .build();
     * 
     * console.log(combinedRegex.source); // "cat|dog"
     * console.log(combinedRegex.test("cat")); // true
     * console.log(combinedRegex.test("dog")); // true
     * console.log(combinedRegex.test("bird")); // false
     * ```
     */
    static combine(...expressions: IrregularExpression[]): IrregularExpression {
        const combined = new IrregularExpression();
        expressions.forEach(expr => {
            combined.pattern += expr.getPattern();
            expr.flags.forEach(flag => combined.flags.add(flag));
        });
        return combined;
    }

    /**
     * Replaces matches in the input string with the provided replacement.
     * 
     * @param input The input string.
     * @param replacement The replacement string or function.
     * @returns The resulting string after replacement.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .literal("cat")
     *   .build();
     * 
     * const input = "The cat sat on the mat.";
     * const result = regex.replace(input, "dog");
     * console.log(result); // "The dog sat on the mat."
     * ```
     */
    replace(input: string, replacement: string | ((match: string, ...args: any[]) => string)): string {
        const regex = this.build();
        return input.replace(regex, replacement as any);
    }

    /**
     * Adds support for backreferences in the fluent API.
     * 
     * @param groupNumber The number of the capturing group to reference.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .capture(group => group
     *     .literal("a")
     *     .oneOrMore()
     *   )
     *   .backreference(1)
     *   .build();
     * 
     * console.log(regex.test("aa")); // true
     * console.log(regex.test("aaa")); // true
     * console.log(regex.test("a")); // false
     * ```
     */
    backreference(groupNumber: number): this {
        if (!Number.isInteger(groupNumber) || groupNumber < 1) {
            this.emitError('backreference expects a positive integer representing the group number.');
            return this;
        }
        this.pattern += `\\${groupNumber}`;
        return this;
    }

    /**
     * Adds support for named backreferences in the fluent API.
     * 
     * @param groupName The name of the capturing group to reference.
     * @returns The current instance for chaining.
     * 
     * @example
     * ```typescript
     * const regex = IrregularExpression.match()
     *   .namedCapture("word", group => group
     *     .wordCharacter()
     *     .oneOrMore()
     *   )
     *   .namedBackreference("word")
     *   .build();
     * 
     * console.log(regex.test("hellohello")); // true
     * console.log(regex.test("helloworld")); // false
     * ```
     */
    namedBackreference(groupName: string): this {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(groupName)) {
            this.emitError('namedBackreference expects a valid group name consisting of letters, numbers, and underscores, not starting with a number.');
            return this;
        }
        this.pattern += `\\k<${groupName}>`;
        return this;
    }

    /**
     * Emits an error event with the provided message.
     * 
     * @param message The error message to dispatch.
     */
    private emitError(message: string): void {
        const event = new CustomEvent('error', { detail: message });
        this.dispatchEvent(event);
    }

    /**
     * Helper method to escape regex special characters in literals.
     * 
     * @param text The text to escape.
     * @returns The escaped text.
     */
    private escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
