import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HYPERLIQUID_API = "https://api.hyperliquid.xyz";

// Simple in-memory rate limiter (per IP, 30 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const ALLOWED_ACTIONS = ["meta", "allMids", "fundingHistory", "candleSnapshot"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "meta";

    if (!ALLOWED_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;

    switch (action) {
      case "meta":
        body = { type: "metaAndAssetCtxs" };
        break;
      case "allMids":
        body = { type: "allMids" };
        break;
      case "fundingHistory":
        body = { type: "fundingHistory", coin: (url.searchParams.get("coin") || "ETH").replace(/[^A-Z0-9]/gi, ''), startTime: Date.now() - 86400000, endTime: Date.now() };
        break;
      case "candleSnapshot":
        body = {
          type: "candleSnapshot",
          req: {
            coin: (url.searchParams.get("coin") || "ETH").replace(/[^A-Z0-9]/gi, ''),
            interval: (url.searchParams.get("interval") || "1h").replace(/[^a-z0-9]/gi, ''),
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Hyperliquid fetch error:", msg);
    return new Response(JSON.stringify({ error: "Failed to fetch market data" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
