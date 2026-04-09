import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getDriver } from "@/lib/neo4j";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).treeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const treeId = (session.user as any).treeId;
    
    // Check url params for specific nodeId to expand
    const url = new URL(req.url);
    const expandNodeId = url.searchParams.get("nodeId");

    const driver = getDriver();
    if (!driver) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    
    const sessionDB = driver.session();

    try {
      let query = "";
      let params: any = { treeId };

      if (expandNodeId) {
        query = `
          MATCH (n {treeId: $treeId, id: $nodeId})-[r]-(m {treeId: $treeId})
          RETURN collect(DISTINCT n) + collect(DISTINCT m) as nodes, collect(DISTINCT r) as relationships
        `;
        params.nodeId = expandNodeId;
      } else {
        // Just load the entire tree. For production, limit depth or paginate.
        query = `
          MATCH (n {treeId: $treeId})
          OPTIONAL MATCH (n)-[r]->(m {treeId: $treeId})
          RETURN collect(DISTINCT n) as nodes, collect(DISTINCT r) as relationships
        `;
      }

      const result = await sessionDB.executeRead(tx => tx.run(query, params));
      
      const record = result.records[0];
      if (!record) {
        return NextResponse.json({ nodes: [], edges: [] });
      }

      const rawNodes = record.get("nodes");
      const rawRels = record.get("relationships");

      // Map Neo4j nodes to pure JS objects suitable for React Flow
      const nodes = rawNodes.map((n: any) => ({
        id: n.properties.id,
        labels: n.labels,
        properties: n.properties
      }));

      const edges = rawRels.map((r: any) => ({
        id: r.elementId,
        source: r.startNodeElementId, // We actually need custom string ID, see below
        target: r.endNodeElementId,
        type: r.type,
        properties: r.properties
      }));
      
      // Fix edge source/target to reflect custom 'id' instead of internal elementId
      // We will create a map from elementId to custom id
      const elementMap = new Map();
      rawNodes.forEach((n: any) => {
        elementMap.set(n.elementId, n.properties.id);
      });
      
      const cleanedEdges = edges.filter((e: any) => elementMap.has(e.source) && elementMap.has(e.target))
        .map((e: any) => ({
          ...e,
          source: elementMap.get(e.source),
          target: elementMap.get(e.target)
        }));

      return NextResponse.json({ nodes, edges: cleanedEdges });
    } finally {
      await sessionDB.close();
    }
  } catch (error: any) {
    console.error("Nodes API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
