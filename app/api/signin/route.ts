import { NextResponse } from "next/server"; 
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

// ✅ Handles POST requests for user sign-in
export async function POST(req: Request) {
  try {
    // ✅ Extract email and password from request body
    const { email, password } = await req.json();
    
    // ✅ Query the database to find a user with the provided email
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    // ✅ If no user is found, return a 404 response
    if (user.rowCount === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ✅ Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    // ✅ If the password is incorrect, return a 401 response
    if (!validPassword) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // ✅ Return success response if login is successful
    return NextResponse.json({ message: "Login successful!" });
  } catch (error) {
    // ✅ Handle any server errors and return a 500 response
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
