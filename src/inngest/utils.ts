import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // If no connection, return nodes as is
  if (connections.length === 0) {
    return nodes;
  }
  //   Create edges array from connections
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);
  // Add node with no connection as self-edges to ensure they're included
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  //   perform topological sort
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow has a cycle");
    }
    throw error;
  }

  //   map sorted IDs back to nodesObject
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return sortedNodeIds
    .map((id) => {
      const node = nodeMap.get(id);
      if (!node) {
        throw new Error(`Node with ID ${id} not found in workflow`);
      }
      return node;
    })
    .filter(Boolean);
};
