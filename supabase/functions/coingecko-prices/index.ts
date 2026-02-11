import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ids = url.searchParams.get("ids") || "ethereum,bitcoin,usd-coin,tether,dai,chainlink,uniswap,aave,wrapped-bitcoin,solana,matic-network,arbitrum,optimism,dogecoin,shiba-inu,pepe";
    const vs = url.searchParams.get("vs") || "usd";

    const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    
    const response = await fetch(cgUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("CoinGecko fetch error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
