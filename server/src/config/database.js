import mongoose from 'mongoose';
import dns from 'dns';
import { config } from '../config/index.js';

dns.setDefaultResultOrder('ipv4first');

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
