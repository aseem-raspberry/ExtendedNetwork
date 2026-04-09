import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Gotaavalaa Tree",
      credentials: {
        treeId: { label: "Tree ID (Your Unique Workspace)", type: "text", placeholder: "e.g., aseem" },
      },
      async authorize(credentials) {
        if (credentials?.treeId) {
          // In a real app, verify against database and check passwords.
          // For this seed, username becomes the isolated treeId.
          return { id: credentials.treeId, name: credentials.treeId, treeId: credentials.treeId };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.treeId = (user as any).treeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).treeId = token.treeId;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
