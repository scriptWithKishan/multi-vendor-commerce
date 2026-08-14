import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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

// Extract root domain for wildcard cookie domain sharing across subdomains (.domainname.com)
const rawRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
const cleanRootDomain = rawRootDomain.split(":")[0].replace(/^www\./, "").toLowerCase();
const isLocalDomain = !cleanRootDomain || cleanRootDomain === "localhost" || cleanRootDomain === "127.0.0.1";
const cookieDomain = isLocalDomain ? undefined : `.${cleanRootDomain}`;

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");

        if (!user) {
          throw new Error("No user found with this email address");
        }

        if (!user.password) {
          throw new Error("This account was registered via Google OAuth. Please sign in with Google.");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || "",
          role: user.role,
          provider: user.provider,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: cookieDomain,
      },
    },
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

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.provider = user.provider;
      } else if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
      } else if (token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.provider = dbUser.provider;
            token.name = dbUser.name;
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
        session.user.provider = (token.provider as string) || "credentials";
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_development_secret_key_change_me",
};
