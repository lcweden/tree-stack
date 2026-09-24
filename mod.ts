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
  #blank: string;
  #corner: string;
  #tee: string;
  #vertical: string;

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
    this.#blank = options.blank ?? "    ";
    this.#corner = options.corner ?? "└── ";
    this.#tee = options.tee ?? "├── ";
    this.#vertical = options.vertical ?? "│   ";
  }

  /** Current nesting depth. */
  get depth(): number {
    return this.#stack.length;
  }

  /** Continuation guide line for multi-line content or child metadata. */
  get lead(): string {
    if (this.#stack.length === 0) {
      return "";
    }

    let indent = "";

    for (let i = 0; i < this.#stack.length - 1; i++) {
      indent += this.#stack[i] ? this.#blank : this.#vertical;
    }

    const last = this.#stack[this.#stack.length - 1];
    const prefix = `${indent}${last ? this.#blank : this.#vertical}`;

    return prefix;
  }

  /** Branch prefix for the current node. */
  get node(): string {
    if (this.#stack.length === 0) {
      return "";
    }

    let indent = "";

    for (let i = 0; i < this.#stack.length - 1; i++) {
      indent += this.#stack[i] ? this.#blank : this.#vertical;
    }

    const last = this.#stack[this.#stack.length - 1];
    const prefix = `${indent}${last ? this.#corner : this.#tee}`;

    return prefix;
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
   * Updates the last-sibling status of the current node.
   *
   * @param options Configuration options for the next node.
   * @returns The {@link TreeStack} instance for chaining.
   */
  next(options: { last?: boolean } = {}): this {
    const { last = false } = options;

    if (this.#stack.length > 0) {
      this.#stack[this.#stack.length - 1] = last;
    }

    return this;
  }
}

export default TreeStack;
export type { TreeStackOptions };
