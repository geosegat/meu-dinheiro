import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

const options = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  tls: true,
  tlsAllowInvalidCertificates: false,
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error('Por favor, adicione MONGODB_URI nas variáveis de ambiente');
  }

  const client = new MongoClient(uri, options);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db('meu-dinheiro');

  return cachedDb;
}
