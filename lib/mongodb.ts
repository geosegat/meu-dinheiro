import { MongoClient, Db } from 'mongodb';

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Por favor, adicione MONGODB_URI no arquivo .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    // Em desenvolvimento, usa uma variável global para preservar o client entre hot reloads
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // Em produção, cria uma nova conexão
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// Helper para obter o database
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('meu-dinheiro');
}

export default getClientPromise;
