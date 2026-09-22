import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

async function clearDatabase() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB:', config.mongodbUri);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections found:', collections.map(c => c.name).join(', '));
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    console.log('\nDropping all collections...');
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}`);
    }
    
    console.log('\n✅ Database cleared successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearDatabase();
