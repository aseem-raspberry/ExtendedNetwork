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
    const { firstName, lastName, gender, bio, college, currentCity } = body;

    const driver = getDriver();
    if (!driver) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    
    const sessionDB = driver.session();

    try {
      const myId = crypto.randomUUID();
      const instId = crypto.randomUUID();
      const cityId = crypto.randomUUID();

      const query = `
        MERGE (me:Person {treeId: $treeId, firstName: $firstName, lastName: $lastName})
        ON CREATE SET me.id = $myId, me.gender = $gender, me.bio = $bio, me.category = ['Family']
        
        MERGE (inst:Institution {treeId: $treeId, name: $college})
        ON CREATE SET inst.id = $instId, inst.type = 'School/University'
        
        MERGE (city:Place {treeId: $treeId, name: $currentCity})
        ON CREATE SET city.id = $cityId, city.type = 'City/Neighborhood'
        
        MERGE (me)-[:STUDIED_AT]->(inst)
        MERGE (me)-[:LIVED_IN]->(city)
        
        RETURN me, inst, city
      `;

      const result = await sessionDB.executeWrite(tx => 
        tx.run(query, {
          treeId, firstName, lastName, myId, gender, bio, college, instId, currentCity, cityId
        })
      );

      return NextResponse.json({ success: true, count: result.records.length });
    } finally {
      await sessionDB.close();
    }
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
