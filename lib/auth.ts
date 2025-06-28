import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcrypt";
import { Role } from "@prisma/client";
// import { rateLimit } from "@/lib/rate-limit";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password 
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error("Email dan password diperlukan");
        }

        try {
          console.log('🔍 Looking for user in database...');
          console.log('🔍 Using prisma instance:', typeof prisma);
          console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
              isActive: true,
            },
          });

          console.log('🔍 Database query result:', {
            found: !!user,
            email: user?.email,
            name: user?.name,
            role: user?.role,
            isActive: user?.isActive
          });

          if (!user) {
            console.log('❌ User not found or not active');
            throw new Error("Email atau password salah");
          }

          console.log('🔍 Comparing password...');
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          console.log('🔍 Password validation result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Password invalid');
            throw new Error("Email atau password salah");
          }

          console.log('✅ Login successful, creating login log...');
          await prisma.loginLog.create({
            data: {
              userId: user.id,
              email: user.email,
              status: "SUCCESS",
              ipAddress: "N/A",
              userAgent: "N/A",
            },
          });

          console.log('✅ Returning user data:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.log('❌ Error in authorize:', error);
          if (error instanceof Error) {
            await prisma.loginLog.create({
              data: {
                email: credentials.email,
                status: "FAILED",
                ipAddress: "N/A",
                userAgent: "N/A",
                errorMessage: error.message,
              },
            });
          }
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 