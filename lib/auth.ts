import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export interface UserJwtPayload {
  id: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export async function getUserFromCookies(){
try{
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) { return null}

    const user = jwt.verify(token,process.env.JWT_SECRET!) as UserJwtPayload
    return user;
}

catch(error){
    return null;
}
}