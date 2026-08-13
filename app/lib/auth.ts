import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      provider: string;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    provider?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (604,800 seconds)
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days (604,800 seconds)
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // Update user if googleId is not linked yet
            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
              existingUser.provider =
                existingUser.provider === "credentials" ? "both" : "google";
              if (user.image && !existingUser.image) {
                existingUser.image = user.image;
              }
              await existingUser.save();
            }
          } else {
            // Create new Google user
            await User.create({
              name: user.name || "Google User",
              email: user.email,
              image: user.image || "",
              provider: "google",
              googleId: account.providerAccountId,
              role: "customer",
              isEmailVerified: true,
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google OAuth sign in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if ((user || account) && token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.provider = dbUser.provider;
          }
        } catch (error) {
          console.error("Error fetching user for JWT token:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as string) || "customer";
        session.user.provider = (token.provider as string) || "google";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_development_secret_key_change_me",
};
