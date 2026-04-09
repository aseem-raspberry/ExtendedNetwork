const fs = require('fs');
const neo4j = require('neo4j-driver');

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

loadEnv();

async function testConnection() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.error("Missing Neo4j credentials in .env.local");
    process.exit(1);
  }

  console.log(`Connecting to ${uri} as ${user}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  
  try {
    const serverInfo = await driver.getServerInfo();
    console.log('Connection successful!');
    console.log(serverInfo);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error.message);
  } finally {
    await driver.close();
  }
}

testConnection();
