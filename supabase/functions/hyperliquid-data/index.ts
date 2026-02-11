import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HYPERLIQUID_API = "https://api.hyperliquid.xyz";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "meta";

    let body: Record<string, unknown>;

    switch (action) {
      case "meta":
        body = { type: "metaAndAssetCtxs" };
        break;
      case "allMids":
        body = { type: "allMids" };
        break;
      case "fundingHistory":
        body = { type: "fundingHistory", coin: url.searchParams.get("coin") || "ETH", startTime: Date.now() - 86400000, endTime: Date.now() };
        break;
      case "candleSnapshot":
        body = {
          type: "candleSnapshot",
          req: {
            coin: url.searchParams.get("coin") || "ETH",
            interval: url.searchParams.get("interval") || "1h",
            startTime: Date.now() - 86400000 * 7,
            endTime: Date.now(),
          },
        };
        break;
      default:
        body = { type: "metaAndAssetCtxs" };
    }

    const response = await fetch(`${HYPERLIQUID_API}/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Hyperliquid fetch error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
