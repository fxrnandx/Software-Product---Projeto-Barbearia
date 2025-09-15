import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import authConfig from "./auth.config";

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  secret: process.env.AUTH_SECRET,
  events: {
    signIn: ({ user, account }) => {
      if(account?.provider === 'google' && user.id && account.id_token) {
        const sql = 'UPDATE accounts SET access_token = $1 WHERE "userId" = $2';
        pool.query(sql, [account.id_token, user.id]);
      };
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
  pages: {
    signIn: "/login",
  },
});
