import React, { useState, useEffect, useRef, useCallback } from "react";
import { createChart, ColorType } from "lightweight-charts";
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  BarChart2,
  PieChart,
  Maximize2,
  Minimize2,
  Search,
  Coins,
  X,
  PanelLeft,
  PanelRight,
  Wallet,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  Trophy,
  Plus,
  Minus,
  Clock
} from "lucide-react";
const PAIRS = [
  { rank: 1, symbol: "BTCUSDT", name: "Bitcoin", defaultPrice: 62500 },
  { rank: 2, symbol: "ETHUSDT", name: "Ethereum", defaultPrice: 3450 },
  { rank: 3, symbol: "BNBUSDT", name: "BNB", defaultPrice: 580 },
  { rank: 4, symbol: "SOLUSDT", name: "Solana", defaultPrice: 145.5 },
  { rank: 5, symbol: "XRPUSDT", name: "XRP", defaultPrice: 0.62 },
  { rank: 6, symbol: "ADAUSDT", name: "Cardano", defaultPrice: 0.45 },
  { rank: 7, symbol: "AVAXUSDT", name: "Avalanche", defaultPrice: 35 },
  { rank: 8, symbol: "DOGEUSDT", name: "Dogecoin", defaultPrice: 0.12 },
  { rank: 9, symbol: "DOTUSDT", name: "Polkadot", defaultPrice: 7.2 },
  { rank: 10, symbol: "TRXUSDT", name: "TRON", defaultPrice: 0.12 },
  { rank: 11, symbol: "LINKUSDT", name: "Chainlink", defaultPrice: 14.5 },
  { rank: 12, symbol: "MATICUSDT", name: "Polygon", defaultPrice: 0.72 },
  { rank: 13, symbol: "SHIBUSDT", name: "Shiba Inu", defaultPrice: 18e-6 },
  { rank: 14, symbol: "LTCUSDT", name: "Litecoin", defaultPrice: 75 },
  { rank: 15, symbol: "BCHUSDT", name: "Bitcoin Cash", defaultPrice: 380 },
  { rank: 16, symbol: "UNIUSDT", name: "Uniswap", defaultPrice: 9.5 },
  { rank: 17, symbol: "ATOMUSDT", name: "Cosmos", defaultPrice: 8.8 },
  { rank: 18, symbol: "XLMUSDT", name: "Stellar", defaultPrice: 0.11 },
  { rank: 19, symbol: "NEARUSDT", name: "NEAR Protocol", defaultPrice: 5.2 },
  { rank: 20, symbol: "APTUSDT", name: "Aptos", defaultPrice: 8.4 },
  { rank: 21, symbol: "ICPUSDT", name: "Internet Computer", defaultPrice: 12 },
  { rank: 22, symbol: "FILUSDT", name: "Filecoin", defaultPrice: 5.6 },
  { rank: 23, symbol: "HBARUSDT", name: "Hedera", defaultPrice: 0.08 },
  { rank: 24, symbol: "VETUSDT", name: "VeChain", defaultPrice: 0.03 },
  { rank: 25, symbol: "ARBUSDT", name: "Arbitrum", defaultPrice: 1.1 },
  { rank: 26, symbol: "OPUSDT", name: "Optimism", defaultPrice: 2.4 },
  { rank: 27, symbol: "INJUSDT", name: "Injective", defaultPrice: 28 },
  { rank: 28, symbol: "SUIUSDT", name: "Sui", defaultPrice: 1.15 },
  { rank: 29, symbol: "SEIUSDT", name: "Sei", defaultPrice: 0.45 },
  { rank: 30, symbol: "TIAUSDT", name: "Celestia", defaultPrice: 9.8 },
  { rank: 31, symbol: "AAVEUSDT", name: "Aave", defaultPrice: 95 },
  { rank: 32, symbol: "MKRUSDT", name: "Maker", defaultPrice: 2200 },
  { rank: 33, symbol: "GRTUSDT", name: "The Graph", defaultPrice: 0.22 },
  { rank: 34, symbol: "ALGOUSDT", name: "Algorand", defaultPrice: 0.18 },
  { rank: 35, symbol: "FTMUSDT", name: "Fantom", defaultPrice: 0.65 },
  { rank: 36, symbol: "SANDUSDT", name: "The Sandbox", defaultPrice: 0.42 },
  { rank: 37, symbol: "MANAUSDT", name: "Decentraland", defaultPrice: 0.45 },
  { rank: 38, symbol: "AXSUSDT", name: "Axie Infinity", defaultPrice: 7.2 },
  { rank: 39, symbol: "THETAUSDT", name: "Theta Network", defaultPrice: 1.8 },
  { rank: 40, symbol: "EOSUSDT", name: "EOS", defaultPrice: 0.75 },
  { rank: 41, symbol: "XTZUSDT", name: "Tezos", defaultPrice: 0.95 },
  { rank: 42, symbol: "FLOWUSDT", name: "Flow", defaultPrice: 0.85 },
  { rank: 43, symbol: "CHZUSDT", name: "Chiliz", defaultPrice: 0.12 },
  { rank: 44, symbol: "ZECUSDT", name: "Zcash", defaultPrice: 28 },
  { rank: 45, symbol: "DASHUSDT", name: "Dash", defaultPrice: 32 },
  { rank: 46, symbol: "NEOUSDT", name: "Neo", defaultPrice: 14.5 },
  { rank: 47, symbol: "IOTAUSDT", name: "IOTA", defaultPrice: 0.22 },
  { rank: 48, symbol: "KSMUSDT", name: "Kusama", defaultPrice: 35 },
  { rank: 49, symbol: "RUNEUSDT", name: "THORChain", defaultPrice: 5.8 },
  { rank: 50, symbol: "LDOUSDT", name: "Lido DAO", defaultPrice: 2.1 },
  { rank: 51, symbol: "CRVUSDT", name: "Curve DAO", defaultPrice: 0.55 },
  { rank: 52, symbol: "SNXUSDT", name: "Synthetix", defaultPrice: 2.8 },
  { rank: 53, symbol: "COMPUSDT", name: "Compound", defaultPrice: 55 },
  { rank: 54, symbol: "YFIUSDT", name: "yearn.finance", defaultPrice: 7500 },
  { rank: 55, symbol: "1INCHUSDT", name: "1inch", defaultPrice: 0.42 },
  { rank: 56, symbol: "ENJUSDT", name: "Enjin Coin", defaultPrice: 0.28 },
  { rank: 57, symbol: "BATUSDT", name: "Basic Attention", defaultPrice: 0.25 },
  { rank: 58, symbol: "ZILUSDT", name: "Zilliqa", defaultPrice: 0.025 },
  { rank: 59, symbol: "HOTUSDT", name: "Holo", defaultPrice: 22e-4 },
  { rank: 60, symbol: "ONEUSDT", name: "Harmony", defaultPrice: 0.018 },
  { rank: 61, symbol: "ANKRUSDT", name: "Ankr", defaultPrice: 0.04 },
  { rank: 62, symbol: "CELRUSDT", name: "Celer Network", defaultPrice: 0.02 },
  { rank: 63, symbol: "CTSIUSDT", name: "Cartesi", defaultPrice: 0.18 },
  { rank: 64, symbol: "SKLUSDT", name: "SKALE", defaultPrice: 0.07 },
  { rank: 65, symbol: "STORJUSDT", name: "Storj", defaultPrice: 0.55 },
  { rank: 66, symbol: "OMGUSDT", name: "OMG Network", defaultPrice: 0.55 },
  { rank: 67, symbol: "KAVAUSDT", name: "Kava", defaultPrice: 0.75 },
  { rank: 68, symbol: "BANDUSDT", name: "Band Protocol", defaultPrice: 1.6 },
  { rank: 69, symbol: "OCEANUSDT", name: "Ocean Protocol", defaultPrice: 0.65 },
  { rank: 70, symbol: "RLCUSDT", name: "iExec RLC", defaultPrice: 2.4 },
  { rank: 71, symbol: "FETUSDT", name: "Fetch.ai", defaultPrice: 1.85 },
  { rank: 72, symbol: "AGIXUSDT", name: "SingularityNET", defaultPrice: 0.75 },
  { rank: 73, symbol: "RNDRUSDT", name: "Render", defaultPrice: 8.5 },
  { rank: 74, symbol: "IMXUSDT", name: "Immutable X", defaultPrice: 2.1 },
  { rank: 75, symbol: "GALAUSDT", name: "Gala", defaultPrice: 0.04 },
  { rank: 76, symbol: "APEUSDT", name: "ApeCoin", defaultPrice: 1.35 },
  { rank: 77, symbol: "LRCUSDT", name: "Loopring", defaultPrice: 0.28 },
  { rank: 78, symbol: "ENSUSDT", name: "Ethereum Name Service", defaultPrice: 18 },
  { rank: 79, symbol: "BLURUSDT", name: "Blur", defaultPrice: 0.45 },
  { rank: 80, symbol: "CFXUSDT", name: "Conflux", defaultPrice: 0.22 },
  { rank: 81, symbol: "MINAUSDT", name: "Mina", defaultPrice: 0.85 },
  { rank: 82, symbol: "ROSEUSDT", name: "Oasis Network", defaultPrice: 0.12 },
  { rank: 83, symbol: "KLAYUSDT", name: "Klaytn", defaultPrice: 0.18 },
  { rank: 84, symbol: "WAVESUSDT", name: "Waves", defaultPrice: 2.2 },
  { rank: 85, symbol: "QTUMUSDT", name: "Qtum", defaultPrice: 3.4 },
  { rank: 86, symbol: "ICXUSDT", name: "ICON", defaultPrice: 0.25 },
  { rank: 87, symbol: "ZRXUSDT", name: "0x", defaultPrice: 0.45 },
  { rank: 88, symbol: "BALUSDT", name: "Balancer", defaultPrice: 4.2 },
  { rank: 89, symbol: "SUSHIUSDT", name: "SushiSwap", defaultPrice: 1.1 },
  { rank: 90, symbol: "CAKEUSDT", name: "PancakeSwap", defaultPrice: 2.4 },
  { rank: 91, symbol: "JUPUSDT", name: "Jupiter", defaultPrice: 0.95 },
  { rank: 92, symbol: "WIFUSDT", name: "dogwifhat", defaultPrice: 2.5 },
  { rank: 93, symbol: "PEPEUSDT", name: "Pepe", defaultPrice: 95e-7 },
  { rank: 94, symbol: "BONKUSDT", name: "Bonk", defaultPrice: 25e-6 },
  { rank: 95, symbol: "FLOKIUSDT", name: "FLOKI", defaultPrice: 18e-5 },
  { rank: 96, symbol: "ORDIUSDT", name: "ORDI", defaultPrice: 45 },
  { rank: 97, symbol: "WLDUSDT", name: "Worldcoin", defaultPrice: 4.5 },
  { rank: 98, symbol: "ARUSDT", name: "Arweave", defaultPrice: 28 },
  { rank: 99, symbol: "STXUSDT", name: "Stacks", defaultPrice: 2.1 },
  { rank: 100, symbol: "TAOUSDT", name: "Bittensor", defaultPrice: 420 }
];
const PAIR_NAME_MAP = PAIRS.reduce((acc, p) => {
  acc[p.symbol] = p.name;
  return acc;
}, {});
const INTERVAL_SECONDS = { "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400 };
const STORAGE_KEYS = {
  balance: "et_exchange_balance",
  positions: "et_exchange_positions",
  tradeMarkers: "et_exchange_trade_markers",
  favorites: "et_exchange_favorites",
  history: "et_exchange_history"
};
const BINANCE_BASE = "https://api.binance.com";
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};
const formatCompactNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
};
const formatHistoryDate = (isoString) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return isoString;
  }
};
const formatUSD = (amount) => {
  const n = Number(amount) || 0;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const INTERVALS = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1d" }
];
function App() {
  const exchange = "LIVE";
  const [binancePairs, setBinancePairs] = useState(PAIRS);
  const [binancePairsLoading, setBinancePairsLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [balance, setBalance] = useState(() => loadFromStorage(STORAGE_KEYS.balance, 1e3));
  const [currentPrice, setCurrentPrice] = useState(PAIRS[0].defaultPrice);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [amountUSD, setAmountUSD] = useState("");
  const [sellAmountCoin, setSellAmountCoin] = useState("");
  const [positions, setPositions] = useState(() => loadFromStorage(STORAGE_KEYS.positions, []));
  const [tradeMarkers, setTradeMarkers] = useState(() => loadFromStorage(STORAGE_KEYS.tradeMarkers, []));
  const [history, setHistory] = useState(() => loadFromStorage(STORAGE_KEYS.history, []));
  const [fundsModalMode, setFundsModalMode] = useState(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [livePrices, setLivePrices] = useState({});
  const [orderType, setOrderType] = useState("BUY");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [interval, setIntervalOption] = useState("15m");
  const [chartLoading, setChartLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => new Set(loadFromStorage(STORAGE_KEYS.favorites, [])));
  const [assetFilter, setAssetFilter] = useState("all");
  const [mobileTab, setMobileTab] = useState("chart");
  const [toasts, setToasts] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [priceFlash, setPriceFlash] = useState(null);
  const [volume24h, setVolume24h] = useState(0);
  const audioCtxRef = useRef(null);
  const playTradeSound = useCallback((type) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      if (type === "BUY") {
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
      } else {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.12);
      }
      gain.gain.setValueAtTime(1e-4, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
    }
  }, []);
  const prevPriceRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const chartOuterRef = useRef(null);
  const pairs = binancePairs;
  const pairsLoading = binancePairsLoading;
  const filteredPairs = pairs.filter((p) => assetFilter !== "favorites" || favorites.has(p.symbol)).filter(
    (p) => p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.rank).includes(searchQuery)
  );
  const toggleFavorite = (symbol) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };
  const pushToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4e3);
  }, []);
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  useEffect(() => {
    const list = binancePairs;
    const match = list.find((p) => p.symbol === selectedPair.symbol);
    if (match) {
      if (match.defaultPrice !== selectedPair.defaultPrice || match.rank !== selectedPair.rank) {
        setSelectedPair(match);
      }
    } else if (list.length > 0) {
      setSelectedPair(list[0]);
    }
  }, [binancePairs]);
  useEffect(() => {
    let cancelled = false;
    const loadBinancePairs = async () => {
      try {
        const [exInfoRes, tickerRes] = await Promise.all([
          fetch(`${BINANCE_BASE}/api/v3/exchangeInfo`),
          fetch(`${BINANCE_BASE}/api/v3/ticker/24hr`)
        ]);
        const exInfo = await exInfoRes.json();
        const tickers = await tickerRes.json();
        if (cancelled) return;
        const tickerMap = {};
        (tickers || []).forEach((t) => {
          tickerMap[t.symbol] = t;
        });
        const usdtPairs = (exInfo.symbols || []).filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING" && s.isSpotTradingAllowed).map((s) => {
          const t = tickerMap[s.symbol];
          return {
            symbol: s.symbol,
            name: PAIR_NAME_MAP[s.symbol] || s.baseAsset,
            defaultPrice: t ? parseFloat(t.lastPrice) : 0,
            volume: t ? parseFloat(t.quoteVolume) : 0
          };
        }).filter((p) => p.defaultPrice > 0).sort((a, b) => b.volume - a.volume).map((p, idx) => ({ rank: idx + 1, symbol: p.symbol, name: p.name, defaultPrice: p.defaultPrice }));
        if (!cancelled && usdtPairs.length > 0) {
          setBinancePairs(usdtPairs);
        }
      } catch (e) {
        console.error("Failed to load full live Binance pair list", e);
      } finally {
        if (!cancelled) setBinancePairsLoading(false);
      }
    };
    loadBinancePairs();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.balance, JSON.stringify(balance));
    } catch (e) {
    }
  }, [balance]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.positions, JSON.stringify(positions));
    } catch (e) {
    }
  }, [positions]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tradeMarkers, JSON.stringify(tradeMarkers));
    } catch (e) {
    }
  }, [tradeMarkers]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    } catch (e) {
    }
  }, [history]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(Array.from(favorites)));
    } catch (e) {
    }
  }, [favorites]);
  useEffect(() => {
    if (prevPriceRef.current !== null && prevPriceRef.current !== currentPrice) {
      setPriceFlash(currentPrice > prevPriceRef.current ? "up" : "down");
      const t = setTimeout(() => setPriceFlash(null), 650);
      prevPriceRef.current = currentPrice;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);
  const heldBinanceKey = Array.from(new Set(positions.filter((p) => p.exchange === "LIVE").map((p) => p.pair))).sort().join(",");
  useEffect(() => {
    const symbols = heldBinanceKey ? heldBinanceKey.split(",") : [];
    if (symbols.length === 0) return;
    const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (d && d.s && d.c) {
          setLivePrices((prev) => ({ ...prev, [`${exchange}_${d.s}`]: parseFloat(d.c) }));
        }
      } catch (e) {
      }
    };
    return () => ws.close();
  }, [heldBinanceKey]);
  const getLivePrice = useCallback((symbol, posExchange) => {
    const key = `${posExchange}_${symbol}`;
    if (livePrices[key] !== void 0) return livePrices[key];
    if (posExchange === exchange && symbol === selectedPair.symbol) return currentPrice;
    return null;
  }, [livePrices, selectedPair, currentPrice, exchange]);
  useEffect(() => {
    setCurrentPrice(selectedPair.defaultPrice);
    setPriceChange24h(0);
    setHigh24h(0);
    setLow24h(0);
    setVolume24h(0);
    prevPriceRef.current = null;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair.symbol.toLowerCase()}@ticker`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.c) {
          setCurrentPrice(parseFloat(data.c));
          setPriceChange24h(parseFloat(data.P));
          setHigh24h(parseFloat(data.h));
          setLow24h(parseFloat(data.l));
          if (data.q) setVolume24h(parseFloat(data.q));
        }
      } catch (e) {
      }
    };
    return () => ws.close();
  }, [selectedPair, exchange]);
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  const toggleFullscreen = async () => {
    if (!chartOuterRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await chartOuterRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#020617" },
        textColor: "#94a3b8",
        attributionLogo: false
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" }
      },
      crosshair: {
        mode: 0
      },
      rightPriceScale: {
        borderColor: "#1e293b"
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 440
    });
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderUpColor: "#10b981",
      borderDownColor: "#f43f5e",
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e"
    });
    const volumeSeries = chart.addHistogramSeries({
      color: "#334155",
      priceFormat: { type: "volume" },
      priceScaleId: ""
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    });
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 440
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    let cancelled = false;
    setChartLoading(true);
    const loadKlines = async () => {
      try {
        const url = `${BINANCE_BASE}/api/v3/klines?symbol=${selectedPair.symbol}&interval=${interval}&limit=300`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        const candles = data.map((k) => ({
          time: Math.floor(k[0] / 1e3),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4])
        }));
        const volumes = data.map((k) => ({
          time: Math.floor(k[0] / 1e3),
          value: parseFloat(k[5]),
          color: parseFloat(k[4]) >= parseFloat(k[1]) ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)"
        }));
        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (e) {
        console.error("Kline load error", e);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };
    loadKlines();
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedPair.symbol.toLowerCase()}@kline_${interval}`
    );
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        if (!k || !candleSeriesRef.current) return;
        const bar = {
          time: Math.floor(k.t / 1e3),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c)
        };
        candleSeriesRef.current.update(bar);
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
            time: Math.floor(k.t / 1e3),
            value: parseFloat(k.v),
            color: parseFloat(k.c) >= parseFloat(k.o) ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)"
          });
        }
      } catch (e) {
      }
    };
    return () => {
      cancelled = true;
      ws.close();
    };
  }, [selectedPair, interval, exchange]);
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    const markers = tradeMarkers.filter((m) => m.symbol === selectedPair.symbol && m.exchange === exchange).sort((a, b) => a.time - b.time).map((m) => {
      const isBuyLike = m.action === "BUY";
      return {
        time: m.time,
        position: isBuyLike ? "belowBar" : "aboveBar",
        color: isBuyLike ? "#10b981" : "#f43f5e",
        shape: isBuyLike ? "arrowUp" : "arrowDown",
        text: isBuyLike ? "BUY" : "SELL"
      };
    });
    candleSeriesRef.current.setMarkers(markers);
  }, [tradeMarkers, selectedPair, exchange]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 440
        });
      }
    }, 50);
    return () => clearTimeout(t);
  }, [showLeftPanel, showRightPanel, isFullscreen]);
  const handlePlaceOrder = (type) => {
    if (type === "BUY") {
      handleBuyOrder();
    } else {
      handleSellOrder();
    }
  };
  const handleBuyOrder = () => {
    const cost = parseFloat(amountUSD);
    if (!cost || cost <= 0) {
      pushToast("Please enter a valid USD amount.", "error");
      return;
    }
    if (cost > balance) {
      pushToast("Insufficient balance \u2014 reduce order size or top up.", "error");
      return;
    }
    const bucket = INTERVAL_SECONDS[interval] || 60;
    const markerTime = Math.floor(Date.now() / 1e3 / bucket) * bucket;
    const newPosition = {
      id: Date.now(),
      pair: selectedPair.symbol,
      name: selectedPair.name,
      exchange,
      type: "BUY",
      entryPrice: currentPrice,
      amountUSD: cost,
      cryptoAmount: cost / currentPrice,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      openTime: markerTime
    };
    setBalance((prev) => prev - cost);
    setPositions((prev) => [newPosition, ...prev]);
    setTradeMarkers((prev) => [...prev, {
      id: `${newPosition.id}-open`,
      symbol: selectedPair.symbol,
      exchange,
      time: markerTime,
      price: currentPrice,
      action: "BUY",
      kind: "OPEN"
    }]);
    setAmountUSD("");
    playTradeSound("BUY");
    setHistory((prev) => [{
      id: `${newPosition.id}-hist`,
      type: "BUY",
      pair: selectedPair.symbol,
      coinAmount: cost / currentPrice,
      usdAmount: cost,
      price: currentPrice,
      realizedPnL: null,
      date: (/* @__PURE__ */ new Date()).toISOString()
    }, ...prev]);
    pushToast(
      `BUY executed \u2014 ${formatCoinAmount(cost / currentPrice)} ${selectedPair.symbol.replace("USDT", "")} for ${formatUSD(cost)}`,
      "success"
    );
  };
  const handleSellOrder = () => {
    const sellAmount = parseFloat(sellAmountCoin);
    if (!sellAmount || sellAmount <= 0) {
      pushToast("Please enter a valid coin amount.", "error");
      return;
    }
    const heldLots = positions.filter((p) => p.pair === selectedPair.symbol && p.exchange === exchange && p.type === "BUY").sort((a, b) => a.id - b.id);
    const totalHeld = heldLots.reduce((sum, p) => sum + p.cryptoAmount, 0);
    if (totalHeld <= 0) {
      pushToast(`You don't hold any ${selectedPair.symbol.replace("USDT", "")} to sell yet \u2014 buy some first.`, "error");
      return;
    }
    if (sellAmount > totalHeld + 1e-9) {
      pushToast(`You only hold ${formatCoinAmount(totalHeld)} ${selectedPair.symbol.replace("USDT", "")}.`, "error");
      return;
    }
    let remaining = sellAmount;
    let proceeds = 0;
    let costBasisSold = 0;
    const consumedIds = [];
    const updatedLot = {};
    for (const lot of heldLots) {
      if (remaining <= 0) break;
      if (lot.cryptoAmount <= remaining + 1e-9) {
        proceeds += lot.cryptoAmount * currentPrice;
        costBasisSold += lot.amountUSD;
        remaining -= lot.cryptoAmount;
        consumedIds.push(lot.id);
      } else {
        const portionSold = remaining;
        proceeds += portionSold * currentPrice;
        const fraction = portionSold / lot.cryptoAmount;
        costBasisSold += lot.amountUSD * fraction;
        updatedLot[lot.id] = {
          cryptoAmount: lot.cryptoAmount - portionSold,
          amountUSD: lot.amountUSD * (1 - fraction)
        };
        remaining = 0;
      }
    }
    setPositions(
      (prev) => prev.filter((p) => !consumedIds.includes(p.id)).map((p) => updatedLot[p.id] ? { ...p, ...updatedLot[p.id] } : p)
    );
    const bucket = INTERVAL_SECONDS[interval] || 60;
    const markerTime = Math.floor(Date.now() / 1e3 / bucket) * bucket;
    setBalance((prev) => prev + proceeds);
    setTradeMarkers((prev) => [...prev, {
      id: `${Date.now()}-sell`,
      symbol: selectedPair.symbol,
      exchange,
      time: markerTime,
      price: currentPrice,
      action: "SELL",
      kind: "CLOSE"
    }]);
    setSellAmountCoin("");
    playTradeSound("SELL");
    const realizedPnL = proceeds - costBasisSold;
    setHistory((prev) => [{
      id: `${Date.now()}-hist`,
      type: "SELL",
      pair: selectedPair.symbol,
      coinAmount: sellAmount,
      usdAmount: proceeds,
      price: currentPrice,
      realizedPnL,
      date: (/* @__PURE__ */ new Date()).toISOString()
    }, ...prev]);
    pushToast(
      `SELL executed \u2014 ${formatCoinAmount(sellAmount)} ${selectedPair.symbol.replace("USDT", "")} for ${formatUSD(proceeds)}`,
      "success"
    );
  };
  const handleClosePosition = (id) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;
    const exitPrice = getLivePrice(pos.pair, pos.exchange) ?? pos.entryPrice;
    let currentValue = 0;
    if (pos.type === "BUY") {
      currentValue = pos.cryptoAmount * exitPrice;
    } else {
      const priceDiff = pos.entryPrice - exitPrice;
      const pnl = priceDiff / pos.entryPrice * pos.amountUSD;
      currentValue = pos.amountUSD + pnl;
    }
    const bucket = INTERVAL_SECONDS[interval] || 60;
    const markerTime = Math.floor(Date.now() / 1e3 / bucket) * bucket;
    setBalance((prev) => prev + currentValue);
    setPositions((prev) => prev.filter((p) => p.id !== id));
    setTradeMarkers((prev) => [...prev, {
      id: `${id}-close`,
      symbol: pos.pair,
      exchange: pos.exchange,
      time: markerTime,
      price: exitPrice,
      action: pos.type,
      kind: "CLOSE"
    }]);
    pushToast(`Position closed \u2014 ${pos.pair.replace("USDT", "")} ${currentValue >= pos.amountUSD ? "+" : ""}${formatUSD(currentValue - pos.amountUSD)}`, currentValue >= pos.amountUSD ? "success" : "error");
  };
  const handleResetDemo = () => {
    setShowResetConfirm(true);
  };
  const confirmResetDemo = () => {
    setBalance(1e3);
    setPositions([]);
    setTradeMarkers([]);
    setHistory([]);
    setShowResetConfirm(false);
    pushToast("Balance reset to $1,000.00", "success");
  };
  const openDepositModal = () => {
    setFundsAmount("");
    setFundsModalMode("deposit");
  };
  const openWithdrawModal = () => {
    setFundsAmount("");
    setFundsModalMode("withdraw");
  };
  const confirmFundsAction = () => {
    const amount = parseFloat(fundsAmount);
    if (!amount || amount <= 0) {
      pushToast("Please enter a valid amount.", "error");
      return;
    }
    if (fundsModalMode === "deposit") {
      setBalance((prev) => prev + amount);
      setHistory((prev) => [{
        id: `${Date.now()}-hist`,
        type: "DEPOSIT",
        pair: null,
        coinAmount: null,
        usdAmount: amount,
        price: null,
        realizedPnL: null,
        date: (/* @__PURE__ */ new Date()).toISOString()
      }, ...prev]);
      pushToast(`Deposited ${formatUSD(amount)}.`, "success");
    } else if (fundsModalMode === "withdraw") {
      if (amount > balance) {
        pushToast("Insufficient balance to withdraw that much.", "error");
        return;
      }
      setBalance((prev) => prev - amount);
      setHistory((prev) => [{
        id: `${Date.now()}-hist`,
        type: "WITHDRAW",
        pair: null,
        coinAmount: null,
        usdAmount: amount,
        price: null,
        realizedPnL: null,
        date: (/* @__PURE__ */ new Date()).toISOString()
      }, ...prev]);
      pushToast(`Withdrew ${formatUSD(amount)}.`, "success");
    }
    setFundsModalMode(null);
    setFundsAmount("");
  };
  const totalRealizedPnL = history.reduce((acc, h) => acc + (h.realizedPnL ?? 0), 0);
  const totalBuys = history.filter((h) => h.type === "BUY").length;
  const totalSells = history.filter((h) => h.type === "SELL").length;
  const totalDeposited = history.filter((h) => h.type === "DEPOSIT").reduce((acc, h) => acc + h.usdAmount, 0);
  const totalWithdrawn = history.filter((h) => h.type === "WITHDRAW").reduce((acc, h) => acc + h.usdAmount, 0);
  const totalUnrealizedPnL = positions.reduce((acc, pos) => {
    const price = getLivePrice(pos.pair, pos.exchange) ?? pos.entryPrice;
    if (pos.type === "BUY") {
      return acc + (pos.cryptoAmount * price - pos.amountUSD);
    } else {
      const priceDiff = pos.entryPrice - price;
      return acc + priceDiff / pos.entryPrice * pos.amountUSD;
    }
  }, 0);
  const totalEquity = balance + positions.reduce((acc, pos) => acc + pos.amountUSD, 0) + totalUnrealizedPnL;
  const estimatedCoins = amountUSD && !isNaN(amountUSD) && currentPrice > 0 ? parseFloat(amountUSD) / currentPrice : 0;
  const heldCoinsForSelectedPair = positions.filter((p) => p.pair === selectedPair.symbol && p.exchange === exchange && p.type === "BUY").reduce((sum, p) => sum + p.cryptoAmount, 0);
  const estimatedSellUSD = sellAmountCoin && !isNaN(sellAmountCoin) && currentPrice > 0 ? parseFloat(sellAmountCoin) * currentPrice : 0;
  const computePositionLive = (pos) => {
    const livePrice = getLivePrice(pos.pair, pos.exchange);
    const priceKnown = livePrice !== null;
    const price = livePrice ?? pos.entryPrice;
    let livePnL = 0;
    if (pos.type === "BUY") {
      livePnL = pos.cryptoAmount * price - pos.amountUSD;
    } else {
      const diff = pos.entryPrice - price;
      livePnL = diff / pos.entryPrice * pos.amountUSD;
    }
    return { priceKnown, price, livePnL, isProfit: livePnL >= 0 };
  };
  const formatCoinAmount = (amount) => {
    if (amount === 0) return "0.0000";
    if (amount < 1e-4) return amount.toFixed(8);
    if (amount < 1) return amount.toFixed(6);
    if (amount < 100) return amount.toFixed(4);
    return amount.toFixed(2);
  };
  const holdings = positions.filter((p) => p.type === "BUY").reduce((acc, pos) => {
    const key = `${pos.exchange}_${pos.pair}`;
    if (!acc[key]) {
      acc[key] = { pair: pos.pair, name: pos.name, exchange: pos.exchange, totalCoins: 0, totalUSD: 0 };
    }
    acc[key].totalCoins += pos.cryptoAmount;
    acc[key].totalUSD += pos.amountUSD;
    return acc;
  }, {});
  const holdingsList = Object.values(holdings).map((h) => {
    const price = getLivePrice(h.pair, h.exchange);
    const liveValue = price !== null ? h.totalCoins * price : null;
    const pnl = liveValue !== null ? liveValue - h.totalUSD : null;
    const pnlPct = liveValue !== null && h.totalUSD > 0 ? pnl / h.totalUSD * 100 : null;
    return { ...h, liveValue, pnl, pnlPct };
  });
  const chartClass = showLeftPanel && showRightPanel ? "lg:col-span-2" : showLeftPanel || showRightPanel ? "lg:col-span-3" : "lg:col-span-4";
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" }, /* @__PURE__ */ React.createElement("div", { className: "h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" }), toasts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-xs" }, toasts.map((t) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: t.id,
      className: `flex items-start gap-2 px-4 py-3 rounded-xl border shadow-2xl text-xs backdrop-blur bg-slate-900/95 animate-[toastIn_0.2s_ease-out] ${t.type === "error" ? "border-rose-500/40 text-rose-300" : t.type === "success" ? "border-emerald-500/40 text-emerald-300" : "border-amber-500/40 text-amber-300"}`
    },
    t.type === "error" ? /* @__PURE__ */ React.createElement(AlertCircle, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }) : t.type === "success" ? /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }) : /* @__PURE__ */ React.createElement(Info, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
    /* @__PURE__ */ React.createElement("span", { className: "flex-1 leading-relaxed" }, t.message),
    /* @__PURE__ */ React.createElement("button", { onClick: () => dismissToast(t.id), className: "text-slate-500 hover:text-slate-300 transition" }, /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5" }))
  ))), showResetConfirm && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-100 mb-2" }, "Reset balance?"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 mb-5" }, "This closes all open positions, clears chart markers and trade history, and restores your balance to $1,000.00. This can't be undone."), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowResetConfirm(false),
      className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: confirmResetDemo,
      className: "px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
    },
    "Reset"
  )))), fundsModalMode && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-100 mb-2" }, fundsModalMode === "deposit" ? "Deposit funds" : "Withdraw funds"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 mb-4" }, fundsModalMode === "deposit" ? "Add any amount you like to your available balance." : `Available balance: ${formatUSD(balance)}`), /* @__PURE__ */ React.createElement("div", { className: "relative mb-5" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      autoFocus: true,
      placeholder: "e.g. 500",
      value: fundsAmount,
      onChange: (e) => setFundsAmount(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") confirmFundsAction();
      },
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500 transition"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute right-3 top-2.5 text-xs text-slate-500" }, "USD")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setFundsModalMode(null),
      className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: confirmFundsAction,
      className: `px-4 py-2 rounded-xl text-sm font-bold text-slate-950 transition ${fundsModalMode === "deposit" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-rose-500 hover:bg-rose-400"}`
    },
    fundsModalMode === "deposit" ? "Deposit" : "Withdraw"
  )))), /* @__PURE__ */ React.createElement("header", { className: "border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90 backdrop-blur px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between sm:justify-start gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-br from-amber-500/25 to-amber-600/5 p-2 rounded-lg border border-amber-500/30 flex-shrink-0" }, /* @__PURE__ */ React.createElement(Activity, { className: "w-6 h-6 text-amber-400" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h1", { className: "font-bold text-base sm:text-lg tracking-wider text-slate-100 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent" }, "ET EXCHANGE"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }), "LIVE")), /* @__PURE__ */ React.createElement("p", { className: "hidden sm:block text-xs text-slate-400" }, "Real-time Trading & Order Execution"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleResetDemo,
      title: "Reset balance to $1,000.00",
      className: "sm:hidden p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition active:scale-95 flex-shrink-0"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, !showLeftPanel && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowLeftPanel(true),
      title: "Show Assets Panel",
      className: "hidden lg:flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition items-center gap-1.5 text-xs"
    },
    /* @__PURE__ */ React.createElement(PanelLeft, { className: "w-4 h-4" }),
    " Assets"
  ), !showRightPanel && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowRightPanel(true),
      title: "Show Order Panel",
      className: "hidden lg:flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition items-center gap-1.5 text-xs"
    },
    /* @__PURE__ */ React.createElement(PanelRight, { className: "w-4 h-4" }),
    " Order"
  ), /* @__PURE__ */ React.createElement("div", { className: "flex-1 sm:flex-none bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between sm:justify-start gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase tracking-wider text-slate-400" }, "Available Balance"), /* @__PURE__ */ React.createElement("div", { className: "text-amber-400 font-bold font-mono text-sm sm:text-base" }, formatUSD(balance))), /* @__PURE__ */ React.createElement("div", { className: "h-8 w-[1px] bg-slate-800" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase tracking-wider text-slate-400" }, "Total Equity"), /* @__PURE__ */ React.createElement("div", { className: "text-slate-100 font-bold font-mono text-sm sm:text-base" }, formatUSD(totalEquity)))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: openDepositModal,
      title: "Deposit funds",
      className: "p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl border border-slate-700 transition hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " ",
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Deposit")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: openWithdrawModal,
      title: "Withdraw funds",
      className: "p-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl border border-slate-700 transition hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
    },
    /* @__PURE__ */ React.createElement(Minus, { className: "w-4 h-4" }),
    " ",
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Withdraw")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleResetDemo,
      title: "Reset balance to $1,000.00",
      className: "hidden sm:block p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition hover:scale-105 active:scale-95"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center gap-5 sm:gap-6 text-xs overflow-x-auto sm:overflow-visible sm:flex-wrap whitespace-nowrap sm:whitespace-normal scrollbar-hide" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-bold text-sm flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wide ${exchange === "LIVE" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30"}` }, exchange), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 text-[11px]" }, "#", selectedPair.rank), /* @__PURE__ */ React.createElement("span", null, selectedPair.symbol), /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-normal" }, "(", selectedPair.name, ")")), /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "Price: "), /* @__PURE__ */ React.createElement("span", { className: `font-mono text-sm font-bold text-amber-400 px-1 -mx-1 rounded transition-colors duration-500 ${priceFlash === "up" ? "bg-emerald-500/25" : priceFlash === "down" ? "bg-rose-500/25" : ""}` }, "$", currentPrice.toFixed(currentPrice < 1 ? 6 : 2))), /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "24h Change: "), /* @__PURE__ */ React.createElement("span", { className: `font-mono font-semibold ${priceChange24h >= 0 ? "text-emerald-400" : "text-rose-400"}` }, priceChange24h >= 0 ? "+" : "", priceChange24h.toFixed(2), "%")), /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "24h High: "), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, "$", high24h > 0 ? high24h.toFixed(high24h < 1 ? 6 : 2) : "--")), /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "24h Low: "), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, "$", low24h > 0 ? low24h.toFixed(low24h < 1 ? 6 : 2) : "--")), /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "24h Volume: "), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, volume24h > 0 ? `$${formatCompactNumber(volume24h)}` : "--"))), /* @__PURE__ */ React.createElement("div", { className: "lg:hidden px-4 sm:px-6 py-2 bg-slate-900/50 border-b border-slate-800/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1" }, [
    { key: "assets", label: "Assets", icon: Coins },
    { key: "chart", label: "Chart", icon: BarChart2 },
    { key: "order", label: "Order", icon: DollarSign }
  ].map(({ key, label, icon: Icon }) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key,
      onClick: () => setMobileTab(key),
      className: `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${mobileTab === key ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`
    },
    /* @__PURE__ */ React.createElement(Icon, { className: "w-3.5 h-3.5" }),
    label
  )))), /* @__PURE__ */ React.createElement("main", { className: "flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4" }, showLeftPanel && /* @__PURE__ */ React.createElement("div", { className: `${mobileTab === "assets" ? "flex" : "hidden"} lg:flex lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-col max-h-[620px]` }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs sticky top-0 z-10" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 font-medium text-slate-200" }, /* @__PURE__ */ React.createElement(Coins, { className: "w-4 h-4 text-amber-400" }), "Top Assets (", pairs.length, pairsLoading ? ", loading all..." : "", ")"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowLeftPanel(false),
      title: "Close panel",
      className: "hidden lg:block p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "p-2 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 py-1.5 rounded-lg text-xs font-bold text-center bg-amber-500/15 text-amber-400 border border-amber-500/40" }, "Live Market"), /* @__PURE__ */ React.createElement("div", { className: "relative mb-2" }, /* @__PURE__ */ React.createElement(Search, { className: "w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search coin / rank...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setAssetFilter("all"),
      className: `py-1.5 rounded-lg text-[11px] font-semibold transition ${assetFilter === "all" ? "bg-slate-800 text-slate-100 border border-slate-700" : "text-slate-500 hover:text-slate-300 border border-transparent"}`
    },
    "All"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setAssetFilter("favorites"),
      className: `py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 ${assetFilter === "favorites" ? "bg-amber-500/15 text-amber-400 border border-amber-500/40" : "text-slate-500 hover:text-slate-300 border border-transparent"}`
    },
    /* @__PURE__ */ React.createElement(Star, { className: "w-3 h-3", fill: assetFilter === "favorites" ? "currentColor" : "none" }),
    "Favorites (",
    favorites.size,
    ")"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto" }, pairsLoading && pairs.length === 0 ? (
    // Skeleton rows while the live pair list is loading
    /* @__PURE__ */ React.createElement("div", { className: "p-2 space-y-2" }, [...Array(8)].map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-2 px-1 py-1.5 animate-pulse", style: { animationDelay: `${i * 60}ms` } }, /* @__PURE__ */ React.createElement("div", { className: "w-6 h-3 bg-slate-800 rounded" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "h-3 bg-slate-800 rounded w-1/2" }), /* @__PURE__ */ React.createElement("div", { className: "h-2 bg-slate-800/70 rounded w-1/3" })))))
  ) : filteredPairs.length === 0 ? assetFilter === "favorites" ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-center py-10 px-4 text-slate-500 text-xs" }, /* @__PURE__ */ React.createElement(Star, { className: "w-6 h-6 text-slate-700" }), /* @__PURE__ */ React.createElement("span", null, "No favorites yet."), /* @__PURE__ */ React.createElement("span", { className: "text-slate-600" }, "Tap the star on any coin to pin it here.")) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-center py-10 text-slate-500 text-xs" }, /* @__PURE__ */ React.createElement(Search, { className: "w-6 h-6 text-slate-700" }), /* @__PURE__ */ React.createElement("span", null, "No assets found")) : filteredPairs.map((pair) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: pair.symbol,
      className: `w-full flex items-center gap-1.5 border-b border-slate-800/50 hover:bg-slate-800/40 transition ${selectedPair.symbol === pair.symbol ? "bg-amber-500/10 border-l-2 border-l-amber-500" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => toggleFavorite(pair.symbol),
        title: favorites.has(pair.symbol) ? "Remove from favorites" : "Add to favorites",
        className: "pl-3 py-2.5 text-slate-600 hover:text-amber-400 transition flex-shrink-0"
      },
      /* @__PURE__ */ React.createElement(Star, { className: "w-3.5 h-3.5", fill: favorites.has(pair.symbol) ? "currentColor" : "none", color: favorites.has(pair.symbol) ? "#fbbf24" : "currentColor" })
    ),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedPair(pair);
          setSearchQuery("");
        },
        className: "flex-1 text-left pr-3 py-2.5 flex items-center gap-2 min-w-0"
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 w-6 font-mono" }, "#", pair.rank),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-200 truncate" }, pair.symbol.replace("USDT", "")), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 truncate" }, pair.name)),
      selectedPair.symbol === pair.symbol && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-amber-400 font-medium flex-shrink-0" }, "Active")
    )
  )))), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: chartOuterRef,
      className: `${mobileTab === "chart" ? "flex" : "hidden"} lg:flex ${chartClass} bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[480px] shadow-xl flex-col`
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 font-medium text-slate-200" }, /* @__PURE__ */ React.createElement(BarChart2, { className: "w-4 h-4 text-amber-400" }), selectedPair.name, " (", selectedPair.symbol.replace("USDT", ""), ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 gap-0.5" }, INTERVALS.map((iv) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: iv.value,
        onClick: () => setIntervalOption(iv.value),
        className: `px-2 py-1 rounded-md text-[11px] font-semibold transition ${interval === iv.value ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`
      },
      iv.label
    ))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleFullscreen,
        title: isFullscreen ? "Exit Fullscreen" : "Fullscreen Chart",
        className: "p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-amber-400"
      },
      isFullscreen ? /* @__PURE__ */ React.createElement(Minimize2, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(Maximize2, { className: "w-4 h-4" })
    ))),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 w-full relative bg-slate-950 min-h-[440px]" }, chartLoading && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm z-10 bg-slate-950/90" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end gap-1 h-16" }, [40, 65, 30, 80, 50, 70, 35, 60, 45, 75].map((h, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: "w-2.5 bg-amber-500/25 rounded-t animate-pulse",
        style: { height: `${h}%`, animationDelay: `${i * 90}ms` }
      }
    ))), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Loading chart...")), /* @__PURE__ */ React.createElement("div", { ref: chartContainerRef, className: "w-full h-full min-h-[440px]" }))
  ), showRightPanel && /* @__PURE__ */ React.createElement("div", { className: `${mobileTab === "order" ? "flex" : "hidden"} lg:flex bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex-col justify-between shadow-xl` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3 mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-sm text-slate-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(DollarSign, { className: "w-4 h-4 text-amber-400" }), "Place Order"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowRightPanel(false),
      title: "Close panel",
      className: "hidden lg:block p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOrderType("BUY"),
      className: `py-2 rounded-lg text-xs font-bold transition ${orderType === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"}`
    },
    "BUY"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOrderType("SELL"),
      className: `py-2 rounded-lg text-xs font-bold transition ${orderType === "SELL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"}`
    },
    "SELL"
  )), orderType === "BUY" ? /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 block mb-1" }, "Order Amount ($USD)"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      placeholder: "e.g. 100",
      value: amountUSD,
      onChange: (e) => setAmountUSD(e.target.value),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500 transition"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute right-3 top-2.5 text-xs text-slate-500" }, "USD"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-1.5" }, [25, 50, 75, 100].map((pct) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pct,
      onClick: () => setAmountUSD((balance * pct / 100).toFixed(2)),
      className: "bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono py-1.5 rounded-lg text-slate-400 transition"
    },
    pct,
    "%"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "Current Price"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, "$", currentPrice.toFixed(currentPrice < 1 ? 6 : 2))), /* @__PURE__ */ React.createElement("div", { className: "h-px bg-slate-800" }), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "You Pay (USD)"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-100 font-semibold" }, formatUSD(amountUSD && !isNaN(amountUSD) ? parseFloat(amountUSD) : 0))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "You Get (Coins)"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-amber-400 font-bold text-sm" }, formatCoinAmount(estimatedCoins), " ", selectedPair.symbol.replace("USDT", ""))))) : /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400" }, "Sell Amount (", selectedPair.symbol.replace("USDT", ""), ")"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-500" }, "Available: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300 font-mono" }, formatCoinAmount(heldCoinsForSelectedPair)))), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      placeholder: "e.g. 0.05",
      value: sellAmountCoin,
      onChange: (e) => setSellAmountCoin(e.target.value),
      disabled: heldCoinsForSelectedPair <= 0,
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute right-3 top-2.5 text-xs text-slate-500" }, selectedPair.symbol.replace("USDT", "")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-1.5" }, [25, 50, 75, 100].map((pct) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pct,
      onClick: () => setSellAmountCoin((heldCoinsForSelectedPair * pct / 100).toString()),
      disabled: heldCoinsForSelectedPair <= 0,
      className: "bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono py-1.5 rounded-lg text-slate-400 transition disabled:opacity-50"
    },
    pct,
    "%"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "Current Price"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, "$", currentPrice.toFixed(currentPrice < 1 ? 6 : 2))), /* @__PURE__ */ React.createElement("div", { className: "h-px bg-slate-800" }), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "You Sell (Coins)"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-100 font-semibold" }, formatCoinAmount(sellAmountCoin && !isNaN(sellAmountCoin) ? parseFloat(sellAmountCoin) : 0), " ", selectedPair.symbol.replace("USDT", ""))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "You Receive (USD)"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-amber-400 font-bold text-sm" }, formatUSD(estimatedSellUSD)))), heldCoinsForSelectedPair <= 0 && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 text-center" }, "You don't hold any ", selectedPair.symbol.replace("USDT", ""), " yet \u2014 buy some first."))), /* @__PURE__ */ React.createElement("div", { className: "mt-5" }, orderType === "BUY" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handlePlaceOrder("BUY"),
      className: "w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
    },
    /* @__PURE__ */ React.createElement(ArrowUpRight, { className: "w-5 h-5" }),
    "EXECUTE BUY"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handlePlaceOrder("SELL"),
      disabled: heldCoinsForSelectedPair <= 0,
      className: "w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
    },
    /* @__PURE__ */ React.createElement(ArrowDownRight, { className: "w-5 h-5" }),
    "EXECUTE SELL"
  )))), /* @__PURE__ */ React.createElement("footer", { className: "p-3 sm:p-4 pt-0 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-sm text-slate-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Wallet, { className: "w-4 h-4 text-amber-400" }), "My Coins / Holdings (", holdingsList.length, ")"), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline text-xs text-slate-500" }, "Coins you bought (BUY positions)")), holdingsList.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl" }, /* @__PURE__ */ React.createElement(Wallet, { className: "w-7 h-7 text-slate-700" }), /* @__PURE__ */ React.createElement("span", null, "No coins held yet."), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-600" }, "Buy some coins to see your holdings here.")) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" }, holdingsList.map((h) => {
    const isProfit = (h.pnl ?? 0) >= 0;
    const borderClass = h.pnl === null ? "border-slate-800" : isProfit ? "border-emerald-500/40" : "border-rose-500/40";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: `${h.exchange}_${h.pair}`,
        className: `bg-slate-950 border ${borderClass} rounded-xl p-3.5 flex flex-col gap-1 transition-colors`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs" }, h.pair.replace("USDT", "").slice(0, 3)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-100 text-sm" }, h.pair.replace("USDT", "")), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500" }, h.name))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end gap-1" }, /* @__PURE__ */ React.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded border font-bold whitespace-nowrap ${h.exchange === "LIVE" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30"}` }, h.exchange), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap" }, "HOLDING"))),
      /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-2 border-t border-slate-800 flex justify-between items-end" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider" }, "Total Coins"), /* @__PURE__ */ React.createElement("div", { className: "font-mono text-amber-400 font-bold text-base" }, formatCoinAmount(h.totalCoins))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider" }, "Live Value"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-sm text-slate-100" }, h.liveValue !== null ? formatUSD(h.liveValue) : "--"))),
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center text-[11px]" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Invested: ", formatUSD(h.totalUSD)), h.pnl !== null && /* @__PURE__ */ React.createElement("span", { className: `font-mono font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}` }, isProfit ? "+" : "", formatUSD(h.pnl), " (", isProfit ? "+" : "", h.pnlPct.toFixed(2), "%)"))
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-sm text-slate-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(PieChart, { className: "w-4 h-4 text-amber-400" }), "Open Positions (", positions.length, ")"), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline text-xs text-slate-500" }, "Live Unrealized PnL")), positions.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-center py-10 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl" }, /* @__PURE__ */ React.createElement(PieChart, { className: "w-8 h-8 text-slate-700" }), /* @__PURE__ */ React.createElement("span", null, "No open positions yet."), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-600" }, "Select a coin and place an order to get started.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "sm:hidden space-y-2.5" }, positions.map((pos) => {
    const { priceKnown, price, livePnL, isProfit } = computePositionLive(pos);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: pos.id,
        className: `bg-slate-950 border rounded-xl p-3.5 ${priceKnown ? isProfit ? "border-emerald-500/40" : "border-rose-500/40" : "border-slate-800"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded border font-bold ${pos.exchange === "LIVE" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30"}` }, pos.exchange), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-200 text-sm" }, pos.pair), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}` }, pos.type))),
      /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs font-mono" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Entry"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "$", pos.entryPrice.toFixed(pos.entryPrice < 1 ? 6 : 2))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Live"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-200" }, priceKnown ? `$${price.toFixed(price < 1 ? 6 : 2)}` : /* @__PURE__ */ React.createElement("span", { className: "text-slate-600" }, "\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Coins"), /* @__PURE__ */ React.createElement("span", { className: "text-amber-400" }, formatCoinAmount(pos.cryptoAmount))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Size"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, formatUSD(pos.amountUSD)))),
      /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-2 border-t border-slate-800 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-500" }, "Unrealized PnL"), /* @__PURE__ */ React.createElement("span", { className: `font-mono font-bold text-sm ${isProfit ? "text-emerald-400" : "text-rose-400"}` }, isProfit ? "+" : "", formatUSD(livePnL)))
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "hidden sm:block overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/50" }, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Exchange"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Pair"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Type"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Entry Price"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Live Price"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Coins"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Size ($)"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Unrealized PnL"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-xs font-mono" }, positions.map((pos) => {
    const { priceKnown, price, livePnL, isProfit } = computePositionLive(pos);
    return /* @__PURE__ */ React.createElement("tr", { key: pos.id, className: `hover:bg-slate-800/30 transition ${priceKnown ? isProfit ? "bg-emerald-500/5" : "bg-rose-500/5" : ""}` }, /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3" }, /* @__PURE__ */ React.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded border font-bold whitespace-nowrap ${pos.exchange === "LIVE" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30"}` }, pos.exchange)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 font-bold text-slate-200" }, pos.pair), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}` }, pos.type)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-300" }, "$", pos.entryPrice.toFixed(pos.entryPrice < 1 ? 6 : 2)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-200" }, priceKnown ? `$${price.toFixed(price < 1 ? 6 : 2)}` : /* @__PURE__ */ React.createElement("span", { className: "text-slate-600" }, "loading...")), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-amber-400" }, formatCoinAmount(pos.cryptoAmount)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-300" }, formatUSD(pos.amountUSD)), /* @__PURE__ */ React.createElement("td", { className: `py-3 px-3 font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}` }, isProfit ? "+" : "", formatUSD(livePnL)));
  })))))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-sm text-slate-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Trophy, { className: "w-4 h-4 text-amber-400" }), "Trade History (", history.length, ")"), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline text-xs text-slate-500" }, "Saved automatically \u2014 survives refresh")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 border border-slate-800 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider mb-1" }, "Realized PnL"), /* @__PURE__ */ React.createElement("div", { className: `font-mono font-bold text-sm ${totalRealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}` }, totalRealizedPnL >= 0 ? "+" : "", formatUSD(totalRealizedPnL))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 border border-slate-800 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider mb-1" }, "Buys / Sells"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-sm text-slate-100" }, totalBuys, " / ", totalSells)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 border border-slate-800 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider mb-1" }, "Deposited"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-sm text-emerald-400" }, formatUSD(totalDeposited))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 border border-slate-800 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider mb-1" }, "Withdrawn"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-sm text-rose-400" }, formatUSD(totalWithdrawn)))), history.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-center py-10 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl" }, /* @__PURE__ */ React.createElement(Trophy, { className: "w-8 h-8 text-slate-700" }), /* @__PURE__ */ React.createElement("span", null, "No trade history yet."), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-600" }, "Every buy, sell, deposit and withdrawal will show up here.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "sm:hidden space-y-2.5" }, history.map((h) => /* @__PURE__ */ React.createElement("div", { key: h.id, className: "bg-slate-950 border border-slate-800 rounded-xl p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${h.type === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : h.type === "SELL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : h.type === "DEPOSIT" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}` }, h.type), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-3 h-3" }), " ", formatHistoryDate(h.date))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-end text-xs font-mono" }, /* @__PURE__ */ React.createElement("div", null, h.pair && /* @__PURE__ */ React.createElement("div", { className: "text-slate-300 font-bold" }, h.pair.replace("USDT", "")), h.coinAmount !== null && /* @__PURE__ */ React.createElement("div", { className: "text-amber-400" }, formatCoinAmount(h.coinAmount), " coins")), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-100 font-semibold" }, formatUSD(h.usdAmount)), h.realizedPnL !== null && /* @__PURE__ */ React.createElement("div", { className: `font-bold ${h.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}` }, h.realizedPnL >= 0 ? "+" : "", formatUSD(h.realizedPnL))))))), /* @__PURE__ */ React.createElement("div", { className: "hidden sm:block overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/50" }, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Date"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Type"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Pair"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Coins"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "USD Amount"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Realized PnL"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-xs font-mono" }, history.map((h) => /* @__PURE__ */ React.createElement("tr", { key: h.id, className: "hover:bg-slate-800/30 transition" }, /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-400 whitespace-nowrap" }, formatHistoryDate(h.date)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${h.type === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : h.type === "SELL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : h.type === "DEPOSIT" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}` }, h.type)), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-200 font-bold" }, h.pair ? h.pair.replace("USDT", "") : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-amber-400" }, h.coinAmount !== null ? formatCoinAmount(h.coinAmount) : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "py-3 px-3 text-slate-300" }, formatUSD(h.usdAmount)), /* @__PURE__ */ React.createElement("td", { className: `py-3 px-3 font-bold ${h.realizedPnL === null ? "text-slate-600" : h.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}` }, h.realizedPnL === null ? "\u2014" : `${h.realizedPnL >= 0 ? "+" : ""}${formatUSD(h.realizedPnL)}`))))))))));
}
export {
  App as default
};
