import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || '';
const user = process.env.NEO4J_USERNAME || '';
const password = process.env.NEO4J_PASSWORD || '';

export function getDriver() {
  if (!uri || !user || !password) {
    console.warn("Neo4j credentials are missing from environment variables.");
    return null;
  }
  
  if (!globalThis.neo4jDriver) {
    globalThis.neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  
  return globalThis.neo4jDriver;
}

export async function closeDriver() {
  if (globalThis.neo4jDriver) {
    await globalThis.neo4jDriver.close();
    globalThis.neo4jDriver = undefined;
  }
}
