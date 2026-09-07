import { Role } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      username: string;
      referralCode: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    username: string;
    referralCode: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    referralCode: string;
  }
}
