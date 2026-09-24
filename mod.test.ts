import { assertEquals, assertStrictEquals } from "@std/assert";
import TreeStack from "./mod.ts";

Deno.test("basic functionality", async (test) => {
  await test.step("initial state", () => {
    const stack = new TreeStack();

    assertEquals(stack.depth, 0);
    assertEquals(stack.node, "");
    assertEquals(stack.lead, "");
  });

  await test.step("enter default argument", () => {
    const stack = new TreeStack();

    stack.enter();

    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");
  });

  await test.step("custom options", () => {
    const stack = new TreeStack({
      tee: "1",
      corner: "2",
      vertical: "3",
      blank: "4",
    });

    stack.enter(false);

    assertEquals(stack.node, "1");
    assertEquals(stack.lead, "3");

    stack.leave();
    stack.enter(true);

    assertEquals(stack.node, "2");
    assertEquals(stack.lead, "4");
  });

  await test.step("partial custom options fallback to defaults", () => {
    const stack = new TreeStack({
      tee: "+-- ",
    });

    stack.enter(false);

    assertEquals(stack.node, "+-- ");
    assertEquals(stack.lead, "│   ");

    stack.leave();
    stack.enter(true);

    assertEquals(stack.node, "└── ");
    assertEquals(stack.lead, "    ");
  });

  await test.step("empty options object uses defaults", () => {
    const stack = new TreeStack({});

    stack.enter(false);

    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");
  });
});

Deno.test("single-level operations", async (test) => {
  await test.step("intermediate node", () => {
    const stack = new TreeStack();

    stack.enter(false);

    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");
  });

  await test.step("last node", () => {
    const stack = new TreeStack();

    stack.enter(true);

    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "└── ");
    assertEquals(stack.lead, "    ");
  });

  await test.step("next updates current node status", () => {
    const stack = new TreeStack();

    stack.enter();
    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");

    stack.next({ last: true });
    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "└── ");
    assertEquals(stack.lead, "    ");

    stack.next({ last: false });
    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");

    stack.next();
    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "├── ");
    assertEquals(stack.lead, "│   ");
  });

  await test.step("leave restores parent state", () => {
    const stack = new TreeStack();

    stack.enter(false);

    assertEquals(stack.depth, 1);

    stack.leave();

    assertEquals(stack.depth, 0);
    assertEquals(stack.node, "");
    assertEquals(stack.lead, "");
  });
});

Deno.test("multi-level hierarchy", async (test) => {
  await test.step("parent false -> child false", () => {
    const stack = new TreeStack();

    stack.enter(false).enter(false);

    assertEquals(stack.depth, 2);
    assertEquals(stack.node, "│   ├── ");
    assertEquals(stack.lead, "│   │   ");
  });

  await test.step("parent false -> child true", () => {
    const stack = new TreeStack();

    stack.enter(false).enter(true);

    assertEquals(stack.depth, 2);
    assertEquals(stack.node, "│   └── ");
    assertEquals(stack.lead, "│       ");
  });

  await test.step("parent true -> child false", () => {
    const stack = new TreeStack();

    stack.enter(true).enter(false);

    assertEquals(stack.depth, 2);
    assertEquals(stack.node, "    ├── ");
    assertEquals(stack.lead, "    │   ");
  });

  await test.step("parent true -> child true", () => {
    const stack = new TreeStack();

    stack.enter(true).enter(true);

    assertEquals(stack.depth, 2);
    assertEquals(stack.node, "    └── ");
    assertEquals(stack.lead, "        ");
  });

  await test.step("deep nesting", () => {
    const stack = new TreeStack();

    stack.enter(false).enter(true).enter(false);

    assertEquals(stack.depth, 3);
    assertEquals(stack.node, "│       ├── ");
    assertEquals(stack.lead, "│       │   ");

    stack.leave();

    assertEquals(stack.depth, 2);
    assertEquals(stack.node, "│   └── ");
  });
});

Deno.test("edge cases & chaining", async (test) => {
  await test.step("leave on empty stack does not underflow", () => {
    const stack = new TreeStack();

    stack.leave().leave().leave();

    assertEquals(stack.depth, 0);
    assertEquals(stack.node, "");
    assertEquals(stack.lead, "");
  });

  await test.step("next on empty stack does not error", () => {
    const stack = new TreeStack();

    stack.next({ last: true });

    assertEquals(stack.depth, 0);
    assertEquals(stack.node, "");
    assertEquals(stack.lead, "");
  });

  await test.step("methods return instance for chaining", () => {
    const stack = new TreeStack();

    assertStrictEquals(stack.enter(false), stack);
    assertStrictEquals(stack.next({ last: true }), stack);
    assertStrictEquals(stack.leave(), stack);
  });

  await test.step("state consistency after complete unwinding", () => {
    const stack = new TreeStack();

    stack.enter(false).enter(true).leave().leave();

    assertEquals(stack.depth, 0);

    stack.enter(true);

    assertEquals(stack.depth, 1);
    assertEquals(stack.node, "└── ");
    assertEquals(stack.lead, "    ");
  });
});

Deno.test("multi-line content formatting", async (test) => {
  await test.step("aligns continuation lines using lead", () => {
    const stack = new TreeStack();

    stack.enter(false);

    const lines = [
      `${stack.node}task: build`,
      `${stack.lead}desc: compiles typescript files`,
      `${stack.lead}status: pending`,
    ];

    assertEquals(
      lines.join("\n"),
      [
        "├── task: build",
        "│   desc: compiles typescript files",
        "│   status: pending",
      ].join("\n"),
    );
  });
});

Deno.test("tree rendering workflow", async (test) => {
  await test.step("renders complete tree hierarchy", () => {
    const stack = new TreeStack();
    const output: string[] = ["root"];

    stack.enter(false);
    output.push(`${stack.node}src`);

    stack.enter(true);
    output.push(`${stack.node}index.ts`);
    stack.leave();

    stack.leave();

    stack.enter(true);
    output.push(`${stack.node}README.md`);
    stack.leave();

    assertEquals(
      output.join("\n"),
      [
        "root",
        "├── src",
        "│   └── index.ts",
        "└── README.md",
      ].join("\n"),
    );
  });

  await test.step("renders complete tree hierarchy using next", () => {
    const stack = new TreeStack();
    const output: string[] = ["."];

    stack.enter();
    output.push(`${stack.node}src/`);

    stack.enter();
    output.push(`${stack.node}index.js`);
    output.push(`${stack.lead}[INFO] Entry Point`);

    stack.next({ last: true });
    output.push(`${stack.node}utils.js`);
    stack.leave();

    stack.next({ last: false });
    output.push(`${stack.node}package.json`);

    stack.next({ last: true });
    output.push(`${stack.node}README.md`);
    stack.leave();

    assertEquals(
      output.join("\n"),
      [
        ".",
        "├── src/",
        "│   ├── index.js",
        "│   │   [INFO] Entry Point",
        "│   └── utils.js",
        "├── package.json",
        "└── README.md",
      ].join("\n"),
    );
  });
});
