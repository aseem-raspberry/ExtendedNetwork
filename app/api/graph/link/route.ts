import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getDriver } from "@/lib/neo4j";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).treeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const treeId = (session.user as any).treeId;
    const body = await req.json();
    const { action, sourceId, targetData, relationshipType, targetType } = body;
    // Action: 'addConnection'
    // This expects targetData: {name} or {firstName, lastName}
    
    const driver = getDriver();
    if (!driver) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const sessionDB = driver.session();

    try {
      if (action === "addConnection") {
        const targetId = crypto.randomUUID();
        let targetMergeQuery = "";
        let props = {};
        
        switch (targetType) {
          case "Person":
             targetMergeQuery = `
               MERGE (t:Person {treeId: $treeId, firstName: $firstName, lastName: $lastName})
               ON CREATE SET t.id = $targetId
             `;
             props = { firstName: targetData.firstName, lastName: targetData.lastName };
             break;
          case "Institution":
             targetMergeQuery = `
               MERGE (t:Institution {treeId: $treeId, name: $name})
               ON CREATE SET t.id = $targetId, t.type = 'School/University'
             `;
             props = { name: targetData.name };
             break;
          case "Organization":
             targetMergeQuery = `
               MERGE (t:Organization {treeId: $treeId, name: $name})
               ON CREATE SET t.id = $targetId, t.type = 'Company/Group'
             `;
             props = { name: targetData.name };
             break;
          case "Place":
             targetMergeQuery = `
               MERGE (t:Place {treeId: $treeId, name: $name})
               ON CREATE SET t.id = $targetId, t.type = 'City/Neighborhood'
             `;
             props = { name: targetData.name };
             break;
        }

        const fullQuery = `
          MATCH (s {treeId: $treeId, id: $sourceId})
          ${targetMergeQuery}
          MERGE (s)-[r:${relationshipType}]->(t)
          RETURN collect(DISTINCT t) as targetNode, collect(DISTINCT r) as targetRel
        `;

        const result = await sessionDB.executeWrite((tx: any) => 
          tx.run(fullQuery, { treeId, sourceId, targetId, ...props })
        );

        return NextResponse.json({ success: true, result: result.records[0] });
      }
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } finally {
      await sessionDB.close();
    }
  } catch (error: any) {
    console.error("Link API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
