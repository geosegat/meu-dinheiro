import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user || !user.data) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: user.data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao buscar dados:', message);
    return NextResponse.json({ error: 'Erro ao buscar dados', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const db = await getDatabase();

    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          data: data,
          lastSync: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, lastSync: new Date() }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar dados:', message);
    return NextResponse.json({ error: 'Erro ao salvar dados', message }, { status: 500 });
  }
}
