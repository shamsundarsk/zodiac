import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, member1_name, member2_name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Team Name is required.' }, { status: 400 });
    }

    if (!member1_name || !member1_name.trim() || !member2_name || !member2_name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Exactly TWO team members are required (Member 01 and Member 02).'
      }, { status: 400 });
    }

    const result = await db.createTeam(name, member1_name, member2_name);

    if (result.isDuplicate) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      team: result.team
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, message: 'Server error registering team' }, { status: 500 });
  }
}
