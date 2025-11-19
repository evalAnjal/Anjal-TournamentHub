import {pool} from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface loginBody {
    email:string;
    password:string;
}