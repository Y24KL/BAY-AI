import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const pass = url.searchParams.get("pass");
  
  // Strict check for the authorized admin email and password
  if (email !== "opujoedou@gmail.com" || pass !== "admin2026") {
    return new Response(JSON.stringify({ error: "Unauthorized access" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore("bay-ai-registrations");
    const { blobs } = await store.list();
    const registrations = [];
    
    for (const blob of blobs) {
      if (blob.key.startsWith("payref:")) continue;
      const data = await store.getJSON(blob.key);
      if (data) registrations.push(data);
    }
    
    registrations.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

    return new Response(JSON.stringify(registrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
