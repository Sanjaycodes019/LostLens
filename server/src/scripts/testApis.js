import { config, isCloudinaryConfigured } from '../config/index.js';
import { v2 as cloudinary } from 'cloudinary';

async function main() {
  console.log('=== External API Configuration Check ===\n');

  // Cloudinary Check
  console.log('1. Cloudinary Configuration:');
  console.log('   Cloud Name:', config.cloudinary.cloudName);
  console.log('   API Key:', config.cloudinary.apiKey ? 'Present' : 'Missing');
  console.log('   API Secret:', config.cloudinary.apiSecret ? 'Present' : 'Missing');
  console.log('   Configured:', isCloudinaryConfigured());

  if (isCloudinaryConfigured()) {
    try {
      cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
      });
      const result = await cloudinary.api.ping();
      console.log('   ✅ Cloudinary API connection successful');
    } catch (error) {
      console.log('   ❌ Cloudinary API connection failed:', error.message);
    }
  } else {
    console.log('   ⚠️  Cloudinary not configured');
  }

  // MongoDB Check
  console.log('\n2. MongoDB Configuration:');
  console.log('   URI:', config.mongodbUri);
  console.log('   Database:', config.mongodbUri.split('/').pop());

  try {
    const mongoose = await import('mongoose');
    await mongoose.connect(config.mongodbUri);
    console.log('   ✅ MongoDB connection successful');
    
    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('   Collections:', collections.map(c => c.name).join(', '));
    
    // Count documents in each collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
  }

  console.log('\n=== Configuration Check Complete ===');
}

main().catch(console.error);
