import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  
  adapter:PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true
})

