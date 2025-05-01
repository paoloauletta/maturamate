import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const user = await request.json();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (existingUser.length === 0) {
      // User doesn't exist, create new user
      await db.insert(usersTable).values({
        id: user.id,
        username: user.given_name, // Using given_name as username for now
        given_name: user.given_name,
        email: user.email,
        profile_picture: user.picture || `https://avatar.vercel.sh/${user.given_name}.png`,
      });
      return NextResponse.json({ message: 'User added successfully' });
    } else {
      return NextResponse.json({ message: 'User already exists' });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
} 