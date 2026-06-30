import axios from 'axios';

// ─── Nobitex API Configuration ───────────────────────────────────────────────
// API Token provided: 859f01e6b9a11d668454802c6c08e4e50fa9a43e
// Base URL: https://apiv2.nobitex.ir
// Note: Nobitex API requires Iranian IPs for full access.
// Public market stats endpoint (no auth needed) is used for price data.
// The token is used for authenticated endpoints (profile, orders, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export const NOBITEX_TOKEN = '859f01e6b9a11d668454802c6c08e4e50fa9a43e';
export const NOBITEX_BASE = 'https://apiv2.nobitex.ir';

// CORS proxy options (tried in order)
const CORS_PROXIES = [
  '', // Direct (works if deployed on Iranian server or CORS allowed)
  'https://corsproxy.io/?',
  'https://api.allorigins.win/get?url=',
];



// Smart fetch: try direct, then CORS proxies
export async function nobitexGet(endpoint: string, params?: Record<string, string>): Promise<any> {
  const queryStr = params ? '?' + new URLSearchParams(params).toString() : '';
  const fullPath = `${NOBITEX_BASE}${endpoint}${queryStr}`;

  // Try direct first
  try {
    const res = await axios.get(fullPath, {
      timeout: 8000,
      headers: {
        'Authorization': `Token ${NOBITEX_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    return res.data;
  } catch (directErr) {
    // Try CORS proxy
    for (let i = 1; i < CORS_PROXIES.length; i++) {
      try {
        const proxyUrl = `${CORS_PROXIES[i]}${encodeURIComponent(fullPath)}`;
        const res = await axios.get(proxyUrl, { timeout: 10000 });
        const data = typeof res.data === 'string'
          ? JSON.parse(res.data)
          : res.data?.contents
          ? JSON.parse(res.data.contents)
          : res.data;
        return data;
      } catch {}
    }
    throw directErr;
  }
}

// ─── Public API Endpoints ─────────────────────────────────────────────────────

// GET /market/stats?srcCurrency=btc&dstCurrency=usdt
// Returns market stats for all pairs (no auth needed)
export async function fetchMarketStats(srcCurrency?: string, dstCurrency?: string): Promise<NobitexMarketStats> {
  const params: Record<string, string> = {};
  if (srcCurrency) params.srcCurrency = srcCurrency;
  if (dstCurrency) params.dstCurrency = dstCurrency;
  const data = await nobitexGet('/market/stats', params);
  return data.stats || {};
}

// GET /market/global-stats (public)
export async function fetchGlobalStats(): Promise<any> {
  return nobitexGet('/market/global-stats');
}

// GET /v2/trades/{symbol} - Recent trades (public, no auth)
export async function fetchRecentTrades(symbol: string): Promise<NobitexTrade[]> {
  const data = await nobitexGet(`/v2/trades/${symbol.toUpperCase()}`);
  return data.trades || [];
}

// GET /v2/orderbook/{symbol} - Order book (public, no auth)
export async function fetchOrderBook(symbol: string): Promise<NobitexOrderBook> {
  return nobitexGet(`/v2/orderbook/${symbol.toUpperCase()}`);
}

// GET /market/udf/history - OHLCV data (public)
// symbol: BTCUSDT, ETHIRT, etc.
// resolution: 60, 180, 240, 360, D, W, M
export async function fetchOHLCV(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<NobitexOHLCV> {
  const data = await nobitexGet('/market/udf/history', {
    symbol, resolution, from: String(from), to: String(to)
  });
  return data;
}

// ─── Authenticated Endpoints (require token) ──────────────────────────────────

// GET /users/profile
export async function fetchUserProfile(): Promise<any> {
  return nobitexGet('/users/profile');
}

// GET /users/wallets/list
export async function fetchWallets(): Promise<any> {
  return nobitexGet('/users/wallets/list');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NobitexStats {
  isClosed: boolean;
  bestSell: string;
  bestBuy: string;
  volumeSrc: string;
  volumeDst: string;
  latest: string;
  mark: string;
  dayLow: string;
  dayHigh: string;
  dayOpen: string;
  dayClose: string;
  dayChange: string;
}

export type NobitexMarketStats = Record<string, NobitexStats>;

export interface NobitexTrade {
  time: number;
  price: string;
  volume: string;
  type: 'sell' | 'buy';
}

export interface NobitexOrderBook {
  asks: [string, string][];
  bids: [string, string][];
  lastUpdate: number;
}

export interface NobitexOHLCV {
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
  s: string; // "ok" | "no_data"
}

// ─── Coin Catalog ─────────────────────────────────────────────────────────────

export const NOBITEX_SYMBOLS = [
  // USDT pairs (price in USD)
  { src: 'btc',  dst: 'usdt', symbol: 'BTC',   name: 'Bitcoin',        nameFa: 'بیت‌کوین'     },
  { src: 'eth',  dst: 'usdt', symbol: 'ETH',   name: 'Ethereum',       nameFa: 'اتریوم'        },
  { src: 'bnb',  dst: 'usdt', symbol: 'BNB',   name: 'BNB',            nameFa: 'بایننس کوین'   },
  { src: 'sol',  dst: 'usdt', symbol: 'SOL',   name: 'Solana',         nameFa: 'سولانا'        },
  { src: 'xrp',  dst: 'usdt', symbol: 'XRP',   name: 'XRP',            nameFa: 'ریپل'          },
  { src: 'ada',  dst: 'usdt', symbol: 'ADA',   name: 'Cardano',        nameFa: 'کاردانو'       },
  { src: 'doge', dst: 'usdt', symbol: 'DOGE',  name: 'Dogecoin',       nameFa: 'دوج‌کوین'      },
  { src: 'dot',  dst: 'usdt', symbol: 'DOT',   name: 'Polkadot',       nameFa: 'پولکادات'      },
  { src: 'shib', dst: 'usdt', symbol: 'SHIB',  name: 'Shiba Inu',      nameFa: 'شیبا اینو'     },
  { src: 'link', dst: 'usdt', symbol: 'LINK',  name: 'Chainlink',      nameFa: 'چین‌لینک'      },
  { src: 'avax', dst: 'usdt', symbol: 'AVAX',  name: 'Avalanche',      nameFa: 'اولانچ'        },
  { src: 'atom', dst: 'usdt', symbol: 'ATOM',  name: 'Cosmos',         nameFa: 'کازموس'        },
  { src: 'uni',  dst: 'usdt', symbol: 'UNI',   name: 'Uniswap',        nameFa: 'یونی‌سواپ'     },
  { src: 'near', dst: 'usdt', symbol: 'NEAR',  name: 'NEAR Protocol',  nameFa: 'نیر پروتکل'    },
  { src: 'matic',dst: 'usdt', symbol: 'MATIC', name: 'Polygon',        nameFa: 'پالیگان'       },
  { src: 'trx',  dst: 'usdt', symbol: 'TRX',   name: 'TRON',           nameFa: 'ترون'          },
  { src: 'arb',  dst: 'usdt', symbol: 'ARB',   name: 'Arbitrum',       nameFa: 'آربیتروم'      },
  { src: 'ton',  dst: 'usdt', symbol: 'TON',   name: 'Toncoin',        nameFa: 'تون‌کوین'      },
  { src: 'apt',  dst: 'usdt', symbol: 'APT',   name: 'Aptos',          nameFa: 'اپتوس'         },
  { src: 'fil',  dst: 'usdt', symbol: 'FIL',   name: 'Filecoin',       nameFa: 'فایل‌کوین'     },
  { src: 'grt',  dst: 'usdt', symbol: 'GRT',   name: 'The Graph',      nameFa: 'گراف'          },
  { src: 'ltc',  dst: 'usdt', symbol: 'LTC',   name: 'Litecoin',       nameFa: 'لایت‌کوین'     },
  { src: 'etc',  dst: 'usdt', symbol: 'ETC',   name: 'Ethereum Classic',nameFa: 'اتریوم کلاسیک'},
  { src: 'comp', dst: 'usdt', symbol: 'COMP',  name: 'Compound',       nameFa: 'کامپاند'       },
  // IRT pairs (price in Rial)
  { src: 'btc',  dst: 'rls',  symbol: 'BTC',   name: 'Bitcoin/IRT',    nameFa: 'بیت‌کوین / ریال'},
  { src: 'eth',  dst: 'rls',  symbol: 'ETH',   name: 'Ethereum/IRT',   nameFa: 'اتریوم / ریال' },
  { src: 'usdt', dst: 'rls',  symbol: 'USDT',  name: 'Tether/IRT',     nameFa: 'تتر / ریال'    },
  { src: 'bnb',  dst: 'rls',  symbol: 'BNB',   name: 'BNB/IRT',        nameFa: 'بایننس / ریال' },
  { src: 'sol',  dst: 'rls',  symbol: 'SOL',   name: 'Solana/IRT',     nameFa: 'سولانا / ریال' },
  { src: 'xrp',  dst: 'rls',  symbol: 'XRP',   name: 'XRP/IRT',        nameFa: 'ریپل / ریال'   },
  { src: 'ada',  dst: 'rls',  symbol: 'ADA',   name: 'Cardano/IRT',    nameFa: 'کاردانو / ریال'},
  { src: 'doge', dst: 'rls',  symbol: 'DOGE',  name: 'Dogecoin/IRT',   nameFa: 'دوج / ریال'    },
  { src: 'shib', dst: 'rls',  symbol: 'SHIB',  name: 'Shiba/IRT',      nameFa: 'شیبا / ریال'   },
  { src: 'ltc',  dst: 'rls',  symbol: 'LTC',   name: 'Litecoin/IRT',   nameFa: 'لایت‌کوین/ریال'},
];

// ─── Coin Image Helper ────────────────────────────────────────────────────────

export function getCoinImage(symbol: string): string {
  const map: Record<string, string> = {
    btc:   'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    eth:   'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    usdt:  'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    bnb:   'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    sol:   'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    xrp:   'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    ada:   'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    doge:  'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    dot:   'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    shib:  'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    link:  'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    avax:  'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    atom:  'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    uni:   'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    near:  'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
    matic: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    trx:   'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
    arb:   'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    ton:   'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
    apt:   'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    fil:   'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
    grt:   'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png',
    ltc:   'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    etc:   'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png',
    bch:   'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png',
    xlm:   'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
    comp:  'https://assets.coingecko.com/coins/images/10775/small/COMP.png',
    aave:  'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    mkr:   'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
    snx:   'https://assets.coingecko.com/coins/images/3406/small/SNX.png',
    crv:   'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
    wbtc:  'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
    dai:   'https://assets.coingecko.com/coins/images/9956/small/4943.png',
  };
  const key = symbol.toLowerCase().replace(/[^a-z]/g, '');
  return map[key] || `https://ui-avatars.com/api/?name=${symbol.toUpperCase()}&background=1e3a5f&color=60a5fa&size=64&bold=true`;
}

export function rlsToToman(rls: number): number { return rls / 10; }
export function parseNum(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '' || val === 'N/A') return 0;
  return parseFloat(String(val)) || 0;
}
