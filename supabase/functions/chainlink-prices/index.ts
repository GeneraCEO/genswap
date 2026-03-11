import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Chainlink Price Feed Aggregator V3 addresses on Ethereum Mainnet (USD-denominated only)
const CHAINLINK_FEEDS: Record<string, string> = {
  ETH: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  BTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
  AAVE: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
  UNI: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
  SOL: "0x4ffC43a60e009B551865A93d232E33Fce9f01507",
  DOGE: "0x2465CefD3b488BE410b941b1d4b2767088e2A028",
  MATIC: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
  DOT: "0x1C07AFb8E2B827c5A4739C6d59Ae3A5035f28734",
  AVAX: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7",
  BNB: "0x14e613AC691a42F21B17961Ba18C6E26DCb30466",
  ADA: "0xAE48c91dF1fE419994FFDa27da09D5AC69c30f55",
  XRP: "0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12",
  FIL: "0x1A31D42149e82Eb99777f903C08A2E41A00085d3",
  ATOM: "0xDC4BDB458C6361093069Ca2aD30D74cc152EdC75",
  NEAR: "0xC12A6d1D827e23318266Ef16Ba6F397F2F91dA9b",
  DAI: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  USDC: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  USDT: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  MKR: "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
  CRV: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
  SNX: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
  COMP: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
  SUSHI: "0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7",
  BAL: "0xdF2917806E30300537aEB49A7663062F4d1F2b5F",
  ENS: "0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16",
};

const AGGREGATOR_ABI_HEX = "50d25bcd"; // latestAnswer() selector
const DECIMALS_ABI_HEX = "313ce567"; // decimals() selector

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RPC_URL = "https://eth.llamarpc.com";
    const url = new URL(req.url);
    const requestedSymbols = url.searchParams.get("symbols")?.split(",") || Object.keys(CHAINLINK_FEEDS);

    const prices: Record<string, { usd: number; source: string }> = {};

    // Batch calls using eth_call for each feed
    const calls = requestedSymbols
      .filter(s => CHAINLINK_FEEDS[s.toUpperCase()])
      .map(async (symbol) => {
        const feedAddress = CHAINLINK_FEEDS[symbol.toUpperCase()];
        try {
          // Fetch both latestAnswer and decimals in parallel
          const [answerRes, decimalsRes] = await Promise.all([
            fetch(RPC_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0", method: "eth_call",
                params: [{ to: feedAddress, data: `0x${AGGREGATOR_ABI_HEX}` }, "latest"],
                id: 1,
              }),
            }),
            fetch(RPC_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0", method: "eth_call",
                params: [{ to: feedAddress, data: `0x${DECIMALS_ABI_HEX}` }, "latest"],
                id: 2,
              }),
            }),
          ]);

          const answerResult = await answerRes.json();
          const decimalsResult = await decimalsRes.json();

          if (answerResult.result && answerResult.result !== "0x") {
            const rawPrice = BigInt(answerResult.result);
            // Use actual decimals from the feed (default 8)
            let feedDecimals = 8;
            if (decimalsResult.result && decimalsResult.result !== "0x") {
              feedDecimals = Number(BigInt(decimalsResult.result));
            }
            const price = Number(rawPrice) / (10 ** feedDecimals);
            if (price > 0 && price < 1e9) { // sanity check
              prices[symbol.toUpperCase()] = { usd: price, source: "chainlink" };
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${symbol}:`, e);
        }
      });

    await Promise.all(calls);

    return new Response(JSON.stringify(prices), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Chainlink fetch error:", msg);
    return new Response(JSON.stringify({ error: "Failed to fetch Chainlink prices" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
