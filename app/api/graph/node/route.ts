import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getDriver } from "@/lib/neo4j";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).treeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const treeId = (session.user as any).treeId;
    const body = await req.json();
    const { nodeId, updates } = body;
    
    // Prevent modifying core IDs
    delete updates.id;
    delete updates.treeId;
    
    // Filter out undefined and null values if any (optional, but good practice)
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    if (!nodeId || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided or missing nodeId" }, { status: 400 });
    }

    const driver = getDriver();
    if (!driver) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const sessionDB = driver.session();

    try {
      // The `+=` operator in Neo4j safely merges properties, updating existing ones and adding new ones without modifying omitted properties.
      const query = `
        MATCH (n {treeId: $treeId, id: $nodeId})
        SET n += $updates
        RETURN n
      `;

      const result = await sessionDB.executeWrite((tx: any) => 
        tx.run(query, { treeId, nodeId, updates })
      );

      if (result.records.length === 0) {
        return NextResponse.json({ error: "Node not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, node: result.records[0].get('n').properties });
    } finally {
      await sessionDB.close();
    }
  } catch (error: any) {
    console.error("Update node API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
