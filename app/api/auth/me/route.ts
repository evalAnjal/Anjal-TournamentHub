import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface UserJwtPayload {
  id: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export async function GET(){
   const cookieStore = await cookies();
       const token = cookieStore.get('session')?.value;
   
       if (!token) { return NextResponse.json({ user: null }, { status: 401 }); }
   
       const user = jwt.verify(token,process.env.JWT_SECRET!) as UserJwtPayload
       return NextResponse.json({
        user
       });
    

}