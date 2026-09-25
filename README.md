# Tree Stack

A lightweight, stateful, data-structure agnostic prefix manager for rendering
tree-view hierarchies.

## Installation

To install the package, run:

```bash
npm install tree-stack # or deno add @lcweden/tree-stack
```

## Quick Start

A simple example rendering a directory with metadata annotations:

```plaintext
.
├── src/
│   ├── index.js
│   │   Size: 1.2 KB
│   └── utils.js
├── package.json
└── README.md
```

`TreeStack` uses an imperative, stack-based approach to generate tree prefixes.
Call `enter()` to go deeper into a subtree, `next()` to move to sibling nodes,
and `leave()` to return to the parent level:

```javascript
import TreeStack from "tree-stack";

const stack = new TreeStack();

console.log(".");
stack.enter();
console.log(stack.node + "src/");
stack.enter();
console.log(stack.node + "index.js");
console.log(stack.lead + "Size: 1.2 KB");
stack.next({ last: true });
console.log(stack.node + "utils.js");
stack.leave();
stack.next();
console.log(stack.node + "package.json");
stack.next({ last: true });
console.log(stack.node + "README.md");
stack.leave();
```

## Core API

Tree Stack acts as a finite state machine managing ancestor lines.

### Methods

Manage the hierarchy level and sibling state using stack navigation methods:

| Method | Parameters           | Description                                                                                       |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| enter  |                      | Enters a new nesting level.                                                                       |
| leave  |                      | Exits the current nesting level.                                                                  |
| next   | `{ last?: boolean }` | Updates the current level's completion status. Set `last: true` for the final child of the group. |

### Getters

Access formatting prefixes and state for the current node:

| Getter | Type     | Description                                                             |
| ------ | -------- | ----------------------------------------------------------------------- |
| node   | `string` | Returns the branch prefix for the current item.                         |
| lead   | `string` | Returns the continuation guide line for multi-line content or metadata. |
| depth  | `number` | Returns the current nesting depth of the stack.                         |

Distinguishing between `stack.node` and `stack.lead` makes it simple to render
entries alongside multi-line properties, notes, or metadata without breaking
hierarchy lines:

```plaintext
Order
├── 🍵 Mocha          <-- stack.node: intermediate item
│   💰 Discount: 10%  <-- stack.lead: continuation guide
│   🗒️ Notes:         <-- stack.lead: continuation guide
│   ├── 🍬 30% Sugar  <-- stack.node: intermediate item
│   └── 🧊 Less Ice   <-- stack.node: last child
├── 🧋 Milk Tea       <-- stack.node: intermediate item
└── ☕️ Americano      <-- stack.node: last child
```

## Examples

### Recursive Tree Traversal

The most common use case is recursively printing a tree-like data structure:

```javascript
import TreeStack from "tree-stack";

const tree = {
  name: "my-project",
  children: [
    { name: "src", children: [{ name: "index.js" }, { name: "utils.js" }] },
    { name: "package.json" },
    { name: "README.md" },
  ],
};

function print(node, stack = new TreeStack()) {
  const prefix = stack.depth === 0 ? "" : stack.node;

  console.log(prefix + node.name);

  if (!node.children || node.children.length === 0) {
    return;
  }

  stack.enter();

  node.children.forEach((child, index) => {
    const last = index === node.children.length - 1;

    stack.next({ last });
    print(child, stack);
  });

  stack.leave();
}

print(tree);
```

Output:

```plaintext
my-project
├── src
│   ├── index.js
│   └── utils.js
├── package.json
└── README.md
```

> [!TIP]
> `TreeStack` is data-structure agnostic, not limited to tree structure.

### Multi-line Metadata

Rendering hierarchical CLI output where items contain multi-line details or
notes, using `stack.lead` to keep vertical guidelines unbroken:

```javascript
import TreeStack from "tree-stack";

const suite = {
  name: "AuthService",
  tests: [
    {
      name: "should hash password securely",
      status: "pass",
      duration: "12ms",
    },
    {
      name: "should reject invalid email format",
      status: "fail",
      details: ["Expected: false", "Received: true", "at auth.test.ts:42"],
    },
    {
      name: "should issue JWT on valid credentials",
      status: "pass",
      duration: "45ms",
    },
  ],
};

const stack = new TreeStack();

console.log(suite.name);
stack.enter();

suite.tests.forEach((test, index) => {
  const last = index === suite.tests.length - 1;
  stack.next({ last });

  const icon = test.status === "pass" ? "✔" : "✖";
  console.log(`${stack.node}${icon} ${test.name}`);

  if (test.duration) {
    console.log(`${stack.lead}Duration: ${test.duration}`);
  }

  if (test.details) {
    test.details.forEach((line) => {
      console.log(`${stack.lead}${line}`);
    });
  }
});

stack.leave();
```

Output:

```plaintext
AuthService
├── ✔ should hash password securely
│   Duration: 12ms
├── ✖ should reject invalid email format
│   Expected: false
│   Received: true
│   at auth.test.ts:42
└── ✔ should issue JWT on valid credentials
    Duration: 45ms
```

## Options

You can initialize a new Tree Stack with custom characters:

| Property | Default  | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| tee      | `"├── "` | Branch prefix for intermediate items             |
| corner   | `"└── "` | Branch prefix for the last sibling item          |
| vertical | `"│   "` | Vertical guideline for unclosed branches         |
| blank    | `"    "` | Blank padding when an ancestor branch has closed |

Override the default branch glyphs by passing an options object to the
constructor:

```javascript
new TreeStack({ tee: "├── ", corner: "└── ", vertical: "│   ", blank: "    " });
```

### Common Styles

Pre-configure characters to suit different environments:

#### ASCII

For environments without Unicode box-drawing support:

```plaintext
root
+-- child 1
|   \-- grandchild
\-- child 2
```

#### Rounded

Uses curved corners:

```plaintext
root
├── child 1
│   ╰── grandchild
╰── child 2
```

## License

This project is licensed under the MIT License.
