import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

// ✅ Handles POST requests for user registration (sign-up)
export async function POST(req: Request) {
  try {
    // ✅ Extract email and password from request body
    const { email, password } = await req.json();

    // ✅ Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Check if a user with the same email already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    // ✅ Ensure rowCount is always treated as a number (default to 0 if null)
    if ((existingUser.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    // ✅ Insert new user into the database
    await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);

    // ✅ Return success response if registration is successful
    return NextResponse.json({ message: "User registered successfully!" });
  } catch (error) {
    // ✅ Handle any database errors and return a 500 response
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
}
