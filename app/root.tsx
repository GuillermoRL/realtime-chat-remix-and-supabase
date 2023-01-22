import { useState, useEffect } from "react";
import { json } from "@remix-run/server-runtime";
import { useRevalidator } from "@remix-run/react";
import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Database } from "./types/database";
import styles from './styles/global.css';
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { createSupabaseClient } from "./utils/supabase.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Realtime Chat",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
]

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  }

  const response = new Response()
  const supabase = createSupabaseClient({ request, response });

  const { data: { session }} = await supabase.auth.getSession();
  return json({ env, session }, { header: response.headers });
}

export default function App() {
  const { env, session: serverSession } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [supabase] = useState(() => createBrowserClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  ));

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if(!session) {
        console.log('in')
        revalidator.revalidate();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
