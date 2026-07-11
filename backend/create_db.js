const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: 'postgres', // connect to default postgres DB
});

async function createDatabase() {
  try {
    await client.connect();
    // Check if tyreshop database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='tyreshop'");
    if (res.rowCount === 0) {
      await client.query("CREATE DATABASE tyreshop");
      console.log("✅ Database 'tyreshop' created successfully!");
    } else {
      console.log("ℹ️ Database 'tyreshop' already exists.");
    }
  } catch (err) {
    console.error("❌ Error creating database:", err);
  } finally {
    await client.end();
  }
}

createDatabase();
