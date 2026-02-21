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
      return NextResponse.json({ data: null, lastSync: null, snapshots: [] }, { status: 200 });
    }

    // Return snapshot metadata only (no full data) for the list view
    const snapshots = (
      (user.snapshots || []) as Array<{
        savedAt: Date;
        transactionsCount: number;
        investmentsCount: number;
      }>
    )
      .map((s) => ({
        savedAt: s.savedAt,
        transactionsCount: s.transactionsCount,
        investmentsCount: s.investmentsCount,
      }))
      .reverse(); // most recent first

    return NextResponse.json(
      { data: user.data, lastSync: user.lastSync || null, snapshots },
      { status: 200 }
    );
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
    const db = await getDatabase();

    // --- Rollback to a previous snapshot ---
    if (body.rollbackTo) {
      const user = await db.collection('users').findOne({ email: session.user.email });

      if (!user || !user.snapshots) {
        return NextResponse.json({ error: 'Snapshot não encontrado' }, { status: 404 });
      }

      const snapshot = (
        user.snapshots as Array<{ savedAt: Date; data: Record<string, unknown> }>
      ).find((s) => new Date(s.savedAt).toISOString() === body.rollbackTo);

      if (!snapshot) {
        return NextResponse.json({ error: 'Snapshot não encontrado' }, { status: 404 });
      }

      await db
        .collection('users')
        .updateOne(
          { email: session.user.email },
          { $set: { data: snapshot.data, lastSync: new Date() } }
        );

      return NextResponse.json(
        { success: true, data: snapshot.data, lastSync: new Date() },
        { status: 200 }
      );
    }

    // --- Normal upload ---
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const newSnapshot = {
      savedAt: new Date(),
      transactionsCount: (data.transactions || []).length,
      investmentsCount: (data.investments || []).length,
      data,
    };

    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          data,
          lastSync: new Date(),
        },
        $push: {
          snapshots: {
            $each: [newSnapshot],
            $slice: -20, // keep last 20 snapshots
          },
        } as Record<string, unknown>,
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
