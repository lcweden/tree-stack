# Tree Stack

A simple, lightweight, stateful prefix manager for rendering tree-view
hierarchies.

## Usage

```plaintext
Friday Order
├── 🍵 Mocha
│   🗒️ Notes:
│   ├── 🍬 30% Sugar
│   └── 🧊 Less Ice
├── 🧋 Milk Tea
│   💰 Discount: 10%
└── ☕️ Americano
```

```javascript
import TreeStack from "tree-stack";

const stack = new TreeStack();

console.log("Friday Order");

stack.enter();

console.log(`${stack.node}🍵 Mocha`);
console.log(`${stack.lead}🗒️ Notes:`);

stack.enter();

console.log(`${stack.node}🍬 30% Sugar`);

stack.leave();
stack.enter(true);

console.log(`${stack.node}🧊 Less Ice`);

stack.leave();
stack.leave();
stack.enter();

console.log(`${stack.node}🧋 Milk Tea`);
console.log(`${stack.lead}💰 Discount: 10%`);

stack.leave();
stack.enter(true);

console.log(`${stack.node}☕️ Americano`);

stack.leave();
```
