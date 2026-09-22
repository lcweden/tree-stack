/**
 * Options for configuring tree drawing characters.
 */
type TreeStackOptions = {
  /** Prefix for intermediate branch items. */
  tee?: string;
  /** Prefix for the last branch item at a level. */
  corner?: string;
  /** Vertical guide prefix for open branches. */
  vertical?: string;
  /** Whitespace prefix when a parent branch has ended. */
  blank?: string;
};

/**
 * Manages stack state for formatting hierarchical tree-view prefixes.
 *
 * @example
 * ```ts
 * const stack = new TreeStack();
 * ```
 */
class TreeStack {
  #stack: boolean[];
  #tee: string;
  #corner: string;
  #vertical: string;
  #blank: string;

  /**
   * Creates a new `TreeStack` instance.
   *
   * @param options Configuration options for tree drawing characters.
   * @example
   * ```ts
   * const symbols = { tee: "├── ", corner: "└── ", vertical: "│   ", blank: "    " };
   * const stack = new TreeStack(symbols);
   * ```
   */
  constructor(options: TreeStackOptions = {}) {
    this.#stack = [];
    this.#tee = options.tee ?? "├── ";
    this.#corner = options.corner ?? "└── ";
    this.#vertical = options.vertical ?? "│   ";
    this.#blank = options.blank ?? "    ";
  }

  /** Current nesting depth. */
  get depth(): number {
    return this.#stack.length;
  }

  /** Continuation guide line for multi-line content or child metadata. */
  get lead(): string {
    return this.prefix(true);
  }

  /** Branch prefix for the current node. */
  get node(): string {
    return this.prefix(false);
  }

  /**
   * Pushes a new node or nesting level onto the stack.
   *
   * @param last Whether this node is the last item among its siblings.
   * @returns The {@link TreeStack} instance for chaining.
   */
  enter(last: boolean = false): this {
    return (this.#stack.push(last), this);
  }

  /**
   * Pops the current level from the stack.
   *
   * @returns The {@link TreeStack} instance for chaining.
   */
  leave(): this {
    return (this.#stack.pop(), this);
  }

  /**
   * Computes the line prefix for the current depth.
   *
   * @param through When `true`, returns guide lines for continued text; otherwise returns node branch characters.
   * @returns The formatted prefix string.
   */
  prefix(through: boolean = false): string {
    if (this.#stack.length === 0) {
      return "";
    }

    let indent = "";

    for (let i = 0; i < this.#stack.length - 1; i++) {
      indent += this.#stack[i] ? this.#blank : this.#vertical;
    }

    const last = this.#stack[this.#stack.length - 1];

    if (through) {
      return `${indent}${last ? this.#blank : this.#vertical}`;
    }

    return `${indent}${last ? this.#corner : this.#tee}`;
  }
}

export default TreeStack;
export type { TreeStackOptions };
