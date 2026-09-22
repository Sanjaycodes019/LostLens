import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../.env') });

async function checkMongo() {
  const mongoose = (await import('mongoose')).default;
  const dns = await import('dns');
  dns.setDefaultResultOrder('ipv4first');
  await mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  await mongoose.connection.db.admin().command({ ping: 1 });
  await mongoose.disconnect();
  return 'ok';
}

async function checkCloudinary() {
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const res = await cloudinary.api.ping();
  return res.status || JSON.stringify(res);
}

async function checkGemini() {
  const key = process.env.GEMINI_API_KEY;
  const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  const errors = [];
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply with the single word OK' }] }],
      }),
    });
    const text = await response.text();
    if (response.ok) return `${model}: ok`;
    errors.push(`${model}: ${response.status} ${text.slice(0, 200)}`);
  }
  throw new Error(errors.join(' | '));
}

const results = {};
try {
  results.mongodb = await checkMongo();
} catch (e) {
  results.mongodb = `FAIL: ${e.message}`;
}
try {
  results.cloudinary = await checkCloudinary();
} catch (e) {
  results.cloudinary = `FAIL: ${e.message}`;
}
try {
  results.gemini = await checkGemini();
} catch (e) {
  results.gemini = `FAIL: ${e.message}`;
}
console.log(JSON.stringify(results, null, 2));
