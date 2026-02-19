// Test file to check available NodeType values
import { NodeType } from "@/generated/prisma";

console.log("Available NodeType values:", Object.values(NodeType));
console.log("Has TELEGRAM:", "TELEGRAM" in NodeType);
