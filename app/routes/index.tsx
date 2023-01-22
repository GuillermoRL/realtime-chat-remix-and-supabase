import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { LoaderArgs, ActionArgs } from "@remix-run/node";
import { createSupabaseClient } from "~/utils/supabase.server";
import { Login } from "~/components/Login";
import { RealtimeMessages } from "~/components/RealtimeMessages";

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createSupabaseClient({ request, response });

  const { data } = await supabase.from('messages').select();

  return json({ messages: data ?? [] }, { headers: response.headers }); 
};

export const action = async ({ request }: ActionArgs) => {
  const response = new Response();
  const supabase = createSupabaseClient({ request, response });

  const formData = await request.formData();
  const { message } = Object.fromEntries(formData);
  
  await supabase.from('messages').insert({ content: String(message) })

  return json({ message: 'ok' }, { headers: response.headers });
}

export default function Index() {
  const { messages } = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>Realtime Chat</h1>
      <Login />
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </Form>
      <RealtimeMessages serverMessages={messages} />
    </main>
  );
}
