import { InputParserRegistry } from "../services/judge/inputParsers/InputParserRegistry.js";
import { PrimitiveParser } from "../services/judge/inputParsers/PrimitiveParser.js";
import { ArrayParser } from "../services/judge/inputParsers/ArrayParser.js";
import { MatrixParser } from "../services/judge/inputParsers/MatrixParser.js";
import { LinkedListParser } from "../services/judge/inputParsers/LinkedListParser.js";
import { BinaryTreeParser } from "../services/judge/inputParsers/BinaryTreeParser.js";
import { GraphParser } from "../services/judge/inputParsers/GraphParser.js";

console.log("=== Running Universal Execution Engine InputParserRegistry Unit Tests ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. PrimitiveParser Tests
const numVal = PrimitiveParser.parse(42, "number");
assert(numVal.kind === "primitive" && numVal.value === 42, "PrimitiveParser parses number 42");

const boolVal = PrimitiveParser.parse(true, "boolean");
assert(boolVal.kind === "primitive" && boolVal.value === true, "PrimitiveParser parses boolean true");

// 2. ArrayParser Tests
const arrVal = ArrayParser.parse("[2, 7, 11, 15]");
assert(arrVal.kind === "array" && arrVal.elements.length === 4 && arrVal.elements[1] === 7, "ArrayParser parses JSON array string correctly");

// 3. MatrixParser Tests
const matVal = MatrixParser.parse("[[1, 2], [3, 4]]");
assert(matVal.kind === "matrix" && matVal.dimensions.rows === 2 && matVal.rows[1][0] === 3, "MatrixParser parses 2D matrix correctly");

// 4. LinkedListParser Tests
const listHead = LinkedListParser.parse([1, 2, 3]);
assert(listHead.kind === "linked_list" && listHead.values[0] === 1 && listHead.values[1] === 2 && listHead.values[2] === 3, "LinkedListParser builds linked list IR 1->2->3");

// 5. BinaryTreeParser Tests
const treeRoot = BinaryTreeParser.parse([1, null, 2, 3]);
assert(treeRoot.kind === "binary_tree" && treeRoot.bfsOrder[0] === 1 && treeRoot.bfsOrder[1] === null && treeRoot.bfsOrder[2] === 2, "BinaryTreeParser builds level-order tree IR");

// 6. GraphParser Tests
const graphHead = GraphParser.parse([[2, 4], [1, 3], [2, 4], [1, 3]]);
assert(graphHead.kind === "graph_node" && graphHead.vertexCount === 4 && graphHead.adjacencyList[0][0] === 2, "GraphParser connects adjacency list graph nodes IR");

// 7. Registry Dispatcher Test
const registryResult = InputParserRegistry.parseParameter([10, 20], "ListNode");
assert(registryResult.kind === "linked_list" && registryResult.values[0] === 10 && registryResult.values[1] === 20, "InputParserRegistry dispatches LinkedListParser correctly");

console.log(`\nInputParserRegistry Test Summary: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);
