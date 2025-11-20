import {pool} from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import {neon} from '@neondatabase/serverless'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function POST (req: NextRequest){
    try{
        const body = await req.json();
        const {email,password}=body;

        if (!email && !password){
            return NextResponse.json(
                {message: "email & password are required",
                
                },
                {
                    status:400,
                }
            )
        }
        // connecting to Neon DB
        const sql = neon (process.env.NEON_DB_URL!);

        // checking the existance of user 

        const user  = await sql `
        SELECT id , full_name , email , password_hash
        FROM users
        where email = ${email}
        LIMIT 1
        `

        if (user.length==0){
            return NextResponse.json({
                message:"user does not exist",
            },
            {
                status:401,
            }
        )
        }
        const foundUser = user[0];

        // validating passwor
        const validPass = await bcrypt.compare (
            password , foundUser.password_hash
        )

        if(!validPass){
            return NextResponse.json({
                message:"Invalid username or password"
            })
        }
        
        // creating a jwt token for saving user's login state

        const token = jwt.sign(
            {id: foundUser.id , email:foundUser.email , name:foundUser.full_name},
            process.env.JWT_SECRET!,
            {expiresIn : "7D"}
        )

        // setting jwt in cookie 
        const response = NextResponse.json({suscess:true});

        response.cookies.set({
            name:'session',
            value:token,
            httpOnly:true,
            secure:true,
            path:'/',
            maxAge: 60 * 60 * 24 * 7 , // 7 days
        });

        return response;

    }
    catch(error){
        return NextResponse.json({
            message:'something went wrong',
            error:error
        })
    }
}