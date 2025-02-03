import { leadsCollection } from '@/lib/db';
import { redis } from '@/lib/db';

export async function saveLead(lead) {
  const { name, phone, address, source, subsidy } = lead;

  // Save to MongoDB
  await leadsCollection.insertOne(lead);

  // Cache in Redis for quick access
  await redis.set(`lead:${phone}`, JSON.stringify(lead), 'EX', 3600 * 24); // Expires in 24 hours

  let client;
  try {
    // Create a new MongoClient and connect to the MongoDB server
    client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the database and collection
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Insert the lead into the database
    const result = await collection.insertOne(lead);
    console.log(`Lead saved with ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Error saving lead to database:', error);
  } finally {
    // Ensure client is closed even if an error occurs
    if (client) {
      await client.close();
    }
  }

  return { success: true, message: 'Lead saved!' };


}
