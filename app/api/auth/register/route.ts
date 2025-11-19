import {pool} from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

interface user {
    id:number;
    full_name:string;
    email:string;
    password_hash?:string; 
    created_at?:string;
}

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {full_name, email, password} = body as {full_name : string ; email:string; password:string;};
    
        if (!full_name || !email || !password){
            return NextResponse.json({error: "missing parameters"}, {status:400})
        }
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json({error: "User already exists"}, {status: 409});
        }

        const password_hash = await bcrypt.hash(password, 10);

        const query = `
        INSERT INTO users (full_name,email,password_hash)
        VALUES ($1,$2,$3)
        RETURNING id,full_name,email
        `
        
        const result = await pool.query<user>(query,[full_name,email,password_hash])

        return NextResponse.json({message:"suscess",user : result.rows[0]})
    }



    catch(error){
        console.error('Registration error:', error);
        return NextResponse.json({error: "Internal server error"+error}, {status: 500});
    }
}

export async function GET(){
    return NextResponse.json({message:"alo alo 123"})
}