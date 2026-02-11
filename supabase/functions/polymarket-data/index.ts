import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GAMMA_API = "https://gamma-api.polymarket.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "markets";

    let apiUrl: string;

    switch (action) {
      case "markets":
        apiUrl = `${GAMMA_API}/markets?closed=false&limit=20&order=volume&ascending=false`;
        break;
      case "events":
        apiUrl = `${GAMMA_API}/events?closed=false&limit=20&order=volume&ascending=false`;
        break;
      case "market": {
        const id = url.searchParams.get("id");
        if (!id) throw new Error("Market ID required");
        apiUrl = `${GAMMA_API}/markets/${id}`;
        break;
      }
      default:
        apiUrl = `${GAMMA_API}/markets?closed=false&limit=20&order=volume&ascending=false`;
    }

    const response = await fetch(apiUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Polymarket fetch error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
