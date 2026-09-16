import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bot,
  Sparkles,
  Download,
  Film,
  TrendingUp,
  Heart,
  Wrench,
  MessageSquare,
  QrCode,
  Link,
  Copy,
  Check,
  Play,
  Pause,
  RefreshCw,
  Send,
  Lock,
  Shield,
  Phone,
  Terminal,
  Zap,
  Globe,
  DollarSign,
  Tv,
  Music,
  ShoppingBag,
  CreditCard,
  BarChart3,
  HelpCircle,
  Bell,
  Newspaper,
  Rocket,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../lib/api';

export const ToolModals: React.FC = () => {
  const { activeToolModal, setActiveToolModal, sendPushNotification, profile } = useApp();

  if (!activeToolModal) return null;

  const closeModal = () => setActiveToolModal(null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[88vh] bg-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                {activeToolModal === 'bot-deployer' && 'WhatsApp Bot Deployer & Rebrander'}
                {activeToolModal === 'ai-chat' && 'ScottyAI Assistant Chat'}
                {activeToolModal === 'downloader' && 'Media & Video Downloader'}
                {activeToolModal === 'watch-movies' && 'Trending Movies & Series'}
                {activeToolModal === 'crypto-forex' && 'Crypto & Forex / ZWL Live Rates'}
                {activeToolModal === 'earn-referrals' && 'Earn Referrals & Commissions'}
                {activeToolModal === 'free-tools' && 'Free Utilities (QR & Shortener)'}
                {activeToolModal === 'smm-panel' && 'Social Media SMM Panel'}
                {activeToolModal === 'marketplace' && 'ScottyHub Digital Marketplace'}
                {activeToolModal === 'client-portal' && 'Client Hosting & Services'}
                {activeToolModal === 'payments' && 'Deposit & Wallet Payments'}
                {activeToolModal === 'analytics' && 'Platform Performance Analytics'}
                {activeToolModal === 'admin-panel' && 'ScottyHub Admin Control Panel'}
                {activeToolModal === 'news' && 'News & System Announcements'}
                {activeToolModal === 'notifications-list' && 'Notifications Drawer'}
                {activeToolModal === 'music-sports' && 'Music Player & Live Sports'}
                {activeToolModal === 'support' && 'ScottyHub 24/7 VIP Support'}
              </h3>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto scrollbar-none flex-1 space-y-4 text-xs">
            {activeToolModal === 'bot-deployer' && <BotDeployerTool />}
            {activeToolModal === 'ai-chat' && <AIChatTool />}
            {activeToolModal === 'downloader' && <DownloaderTool />}
            {activeToolModal === 'watch-movies' && <WatchMoviesTool />}
            {activeToolModal === 'crypto-forex' && <CryptoForexTool />}
            {activeToolModal === 'earn-referrals' && <EarnReferralsTool />}
            {activeToolModal === 'free-tools' && <FreeToolsModal />}
            {activeToolModal === 'smm-panel' && <SMMPanelTool />}
            {activeToolModal === 'marketplace' && <MarketplaceTool />}
            {activeToolModal === 'client-portal' && <ClientPortalTool />}
            {activeToolModal === 'payments' && <PaymentsTool />}
            {activeToolModal === 'analytics' && <AnalyticsTool />}
            {activeToolModal === 'admin-panel' && <AdminPanelTool />}
            {activeToolModal === 'news' && <NewsTool />}
            {activeToolModal === 'notifications-list' && <NotificationsListTool />}
            {activeToolModal === 'music-sports' && <MusicSportsTool />}
            {activeToolModal === 'support' && <SupportTool />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* 1. WhatsApp Bot Deployer & Rebrander — wired to routes/botgen.js (real template
   list + real generated zip). ScottyHub has no live WhatsApp pairing endpoint (a
   Baileys session is a separate always-on process, not a request/response API),
   so "pairing" here is presentational; the Generate action produces a real,
   downloadable, custom-branded bot zip. */
const BotDeployerTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [templates, setTemplates] = useState<api.BotTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  React.useEffect(() => {
    api
      .getBotTemplates()
      .then((tpls) => {
        setTemplates(tpls);
        if (tpls[0]) selectTemplate(tpls[0]);
      })
      .catch((e) => setLoadError(e?.message || 'Could not load bot templates.'));
  }, []);

  const selectTemplate = (t: api.BotTemplate) => {
    setTemplateId(t.id);
    const defaults: Record<string, string> = {};
    for (const f of t.fields) defaults[f.key] = f.default || (f.key === 'botName' ? 'ScottyBot MD' : '');
    setFields(defaults);
    setDownloadUrl(null);
  };

  const activeTemplate = templates.find((t) => t.id === templateId);

  const handleDeploy = async () => {
    if (!templateId) return;
    setIsDeploying(true);
    setDownloadUrl(null);
    setLogs(['[botgen] Packaging template...', '[botgen] Applying your bot configuration...']);

    try {
      const res = await api.generateBot(templateId, fields);
      setLogs((prev) => [...prev, `[botgen] Build complete: ${fields.botName || activeTemplate?.name}`]);
      setDownloadUrl(res.downloadUrl);
      sendPushNotification('🚀 Bot Generated!', `${fields.botName || 'Your bot'} is packaged and ready to download.`, 'system');
    } catch (e: any) {
      setLogs((prev) => [...prev, `[botgen] Error: ${e?.message || 'Generation failed'}`]);
      sendPushNotification('Bot Generation Failed', e?.message || 'Please try again.', 'system');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">WhatsApp Bot Engine</span>
        <p className="text-xs text-slate-300 mt-0.5">Deploy your own custom-branded WhatsApp bot with multi-device Baileys session management.</p>
      </div>

      <div className="space-y-3">
        {loadError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{loadError}</div>
        )}

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Template</label>
          <select
            value={templateId}
            onChange={(e) => {
              const t = templates.find((x) => x.id === e.target.value);
              if (t) selectTemplate(t);
            }}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            {templates.length === 0 && <option value="">Loading templates...</option>}
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fields are generated dynamically from the selected template's real
            metadata (routes/botgen.js) since each template requires different
            settings keys. */}
        {(activeTemplate?.fields || []).map((f) => (
          <div key={f.key}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {f.label}
              {f.required && ' *'}
            </label>
            <input
              type="text"
              value={fields[f.key] ?? ''}
              onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        ))}

        {/* Generate Action — calls POST /api/botgen/generate for a real, downloadable zip */}
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !templateId}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          {isDeploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          <span>{isDeploying ? 'Packaging Bot...' : 'Generate Bot'}</span>
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center py-2.5 bg-slate-900 border border-orange-500/40 text-orange-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition"
          >
            Download {fields.botName || activeTemplate?.name || 'bot'}.zip
          </a>
        )}

        {/* Build Logs */}
        {logs.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 font-mono text-[10px] text-green-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 pb-1 border-b border-white/5 mb-1">
              <Terminal className="w-3 h-3" />
              <span>Build Log</span>
            </div>
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* 2. ScottyAI Chat */
const AIChatTool: React.FC = () => {
  const { messages, sendMessage } = useApp();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="space-y-3 flex flex-col h-[380px]">
      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Ask ScottyAI about bot commands, ZWL/ZiG rates, coding scripts, or general info.</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-slate-900/40 rounded-2xl border border-white/5 scrollbar-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-2xl max-w-[85%] ${
              m.isSelf
                ? 'ml-auto bg-indigo-600 text-white rounded-br-none'
                : 'mr-auto bg-slate-800/90 border border-white/10 text-slate-200 rounded-bl-none'
            }`}
          >
            <span className="text-[9px] opacity-70 block mb-0.5">{m.senderName} • {m.timestamp}</span>
            <p className="leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask ScottyAI..."
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleSend}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* 3. Media Downloader — wired to routes/download.js (real drexapp-backed audio
   downloader). The real backend downloads/streams audio from a YouTube link or
   song title/query; it doesn't offer selectable video quality, so that control
   is dropped in favor of the real result (title + working file link). */
const DownloaderTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url.trim()) return;
    setIsDownloading(true);
    setResult(null);
    setError(null);
    try {
      const data = await api.downloadMedia(url.trim());
      setResult(data);
      sendPushNotification('Download Ready', `"${data?.title || url}" is ready.`, 'system');
    } catch (e: any) {
      setError(e?.message || 'Downloader unavailable. Try again shortly.');
    } finally {
      setIsDownloading(false);
    }
  };

  const resultUrl = result?.url || result?.downloadUrl || result?.data?.url || result?.link;

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
        <span className="font-bold block">YouTube Audio Downloader</span>
        <p className="text-[11px] text-slate-300 mt-0.5">Paste a YouTube link or song title to fetch a downloadable audio file.</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste video URL or song title (e.g. Faded Alan Walker)"
          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
        />

        {error && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>}

        {result && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <span className="font-bold text-white text-xs block">{result.title || 'Result found'}</span>
            {resultUrl && (
              <a
                href={resultUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px]"
              >
                Open / Download
              </a>
            )}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={isDownloading || !url}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{isDownloading ? 'Processing...' : 'Start Download'}</span>
        </button>
      </div>
    </div>
  );
};

/* 4. Watch Movies — wired to routes/movies.js (real trending + search) */
const WatchMoviesTool: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<api.MovieResult | null>(null);
  const [movies, setMovies] = useState<api.MovieResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrending = () => {
    setLoading(true);
    setError(null);
    api
      .getTrendingMovies()
      .then((res) => setMovies(res.results || []))
      .catch((e) => setError(e?.message || 'Could not load movies.'))
      .finally(() => setLoading(false));
  };

  React.useEffect(loadTrending, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return loadTrending();
    setLoading(true);
    setError(null);
    api
      .searchMovies(query.trim())
      .then((res) => setMovies(res.results || []))
      .catch((e) => setError(e?.message || 'Search failed.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-3">
      {selectedMovie ? (
        <div className="space-y-3">
          <button
            onClick={() => setSelectedMovie(null)}
            className="text-xs text-cyan-400 font-bold flex items-center gap-1"
          >
            ← Back to Movies
          </button>

          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
            <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full h-full object-cover opacity-60" />
            <button className="absolute p-4 bg-orange-600/90 text-white rounded-full shadow-2xl hover:scale-110 transition">
              <Play className="w-8 h-8 fill-white" />
            </button>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">{selectedMovie.title} {selectedMovie.year ? `(${selectedMovie.year})` : ''}</h4>
            <p className="text-slate-400 text-[11px]">{(selectedMovie.genres || []).map((g) => g.text).join(' / ')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trending movies & TV series..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
            />
          </form>

          {error && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>}
          {loading && <div className="text-center text-slate-500 text-xs py-4">Loading...</div>}

          <div className="grid grid-cols-2 gap-3">
            {movies.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMovie(m)}
                className="p-2 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-orange-500/40 transition cursor-pointer space-y-2 group"
              >
                <img src={m.poster} alt={m.title} className="w-full h-28 object-cover rounded-xl" />
                <div>
                  <h5 className="font-bold text-xs text-white group-hover:text-orange-400 transition">{m.title}</h5>
                  <span className="text-[10px] text-slate-400">{(m.genres || []).map((g) => g.text).join(' / ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* 5. Crypto & Forex — ScottyHub has no crypto/forex-rate route, so this stays a
   local calculator using fixed illustrative rates rather than a fake API call. */
const CryptoForexTool: React.FC = () => {
  const [usdAmount, setUsdAmount] = useState('10');

  const usd = parseFloat(usdAmount) || 0;
  const zwlRate = 35000;
  const zigRate = 13.8;
  const btcPrice = 96400;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">USD / ZWL Rate</span>
          <span className="text-sm font-extrabold text-pink-400">1 USD = 35,000 ZWL</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">USD / ZiG Rate</span>
          <span className="text-sm font-extrabold text-emerald-400">1 USD = 13.80 ZiG</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
        <h4 className="font-bold text-xs text-slate-200">Currency Converter</h4>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Enter USD Amount ($)</label>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Equivalent ZWL:</span>
            <span className="font-extrabold text-pink-400">ZWL ${(usd * zwlRate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Equivalent ZiG:</span>
            <span className="font-extrabold text-emerald-400">ZiG {(usd * zigRate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Bitcoin Value:</span>
            <span className="font-extrabold text-amber-400">{(usd / btcPrice).toFixed(6)} BTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 6. Earn Referrals — wired to routes/earn.js overview (real referral code + counts) */
const EarnReferralsTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState<{ code: string; totalReferrals: number; totalEarnings: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    api
      .getEarnOverview()
      .then((o) => setReferral(o.referral))
      .catch((e) => setError(e?.message || 'Could not load referral data.'));
  }, []);

  const link = referral ? `https://scottyhub.co.zw/ref/${referral.code}` : '';

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    sendPushNotification('Referral Link Copied', 'Share on WhatsApp & social media to earn commission.', 'system');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
        <span className="font-bold block">Earn Referral Commission</span>
        <p className="text-[11px] text-slate-300 mt-0.5">Invite friends to ScottyHub and earn on their activity via your referral link.</p>
      </div>

      {error && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>}

      <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
        <label className="text-[10px] font-bold uppercase text-slate-400 block">Your Personal Referral Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={link || 'Loading...'}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-blue-400 font-mono"
          />
          <button
            onClick={handleCopy}
            disabled={!link}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Referrals</span>
          <span className="text-sm font-extrabold text-emerald-400">{referral?.totalReferrals ?? '—'}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Earnings</span>
          <span className="text-sm font-extrabold text-amber-400">${(referral?.totalEarnings ?? 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

/* 7. Free Tools (QR & URL Shortener) — ScottyHub has no shortener/QR route;
   QR rendering is inherently client-side anyway, so this stays local. */
const FreeToolsModal: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [tab, setTab] = useState<'qr' | 'shortener'>('qr');
  const [qrText, setQrText] = useState('https://scottyhub.co.zw');
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const handleShorten = () => {
    if (!longUrl) return;
    const code = Math.random().toString(36).substring(2, 8);
    setShortUrl(`https://scotty.link/${code}`);
    sendPushNotification('Short Link Created', `Shortened: scotty.link/${code}`, 'system');
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10">
        <button
          onClick={() => setTab('qr')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
            tab === 'qr' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          QR Code Generator
        </button>
        <button
          onClick={() => setTab('shortener')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
            tab === 'shortener' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          URL Shortener
        </button>
      </div>

      {tab === 'qr' ? (
        <div className="space-y-3 text-center">
          <input
            type="text"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="Enter text or URL for QR Code..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />

          <div className="p-4 bg-white rounded-2xl w-36 h-36 mx-auto flex items-center justify-center border-2 border-amber-500/50 shadow-xl">
            <QrCode className="w-28 h-28 text-slate-950" />
          </div>
          <span className="text-[10px] text-slate-400 block">Scan with camera to open content</span>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Paste long URL (e.g. https://example.com/long-path...)"
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />

          <button
            onClick={handleShorten}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
          >
            Shorten URL
          </button>

          {shortUrl && (
            <div className="p-3 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between">
              <span className="font-mono text-amber-400 font-bold">{shortUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shortUrl);
                  sendPushNotification('Link Copied', shortUrl, 'system');
                }}
                className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg text-[10px] font-bold"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* 8. SMM Panel — wired to routes/boost.js (real services list + real order placement,
   deducted from wallet balance server-side) */
const SMMPanelTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [services, setServices] = useState<api.BoostService[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('1000');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    api
      .getBoostServices()
      .then((res) => {
        setServices(res.services);
        if (res.services[0]) setServiceId(res.services[0].id);
      })
      .catch((e) => setError(e?.message || 'Could not load services.'));
  }, []);

  const selected = services.find((s) => s.id === serviceId);
  const qty = parseInt(quantity) || 0;
  const price = selected ? ((selected.price_per_1000 / 1000) * qty).toFixed(4) : '0.0000';

  const handleOrder = async () => {
    if (!serviceId || !link.trim() || qty < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createBoostOrder(serviceId, link.trim(), qty);
      sendPushNotification('SMM Order Submitted', `Order for ${qty} ${selected?.type} on ${selected?.platform} is processing.`, 'system');
      setLink('');
    } catch (e: any) {
      setError(e?.message || 'Order failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
        <span className="font-bold block">ScottyHub SMM Booster Panel</span>
        <p className="text-[11px] text-slate-300 mt-0.5">Instant social media growth — paid from your wallet balance.</p>
      </div>

      {error && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>}

      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          >
            {services.length === 0 && <option value="">Loading services...</option>}
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.platform} — {s.type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Link</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste the profile/post link"
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={selected?.min_qty}
            max={selected?.max_qty}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
          {selected && (
            <span className="text-[10px] text-slate-500 mt-1 block">Min {selected.min_qty} • Max {selected.max_qty}</span>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between font-bold">
          <span className="text-slate-400">Total Price:</span>
          <span className="text-purple-400 text-sm">${price} USD</span>
        </div>

        <button
          onClick={handleOrder}
          disabled={submitting || !serviceId || !link.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20"
        >
          {submitting ? 'Submitting...' : 'Submit SMM Order'}
        </button>
      </div>
    </div>
  );
};

/* 9. Marketplace — wired to routes/marketplace.js (real listings) */
const MarketplaceTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [listings, setListings] = useState<api.MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    api
      .getMarketplaceListings()
      .then(setListings)
      .catch((e) => setError(e?.message || 'Could not load listings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (listing: api.MarketplaceListing) => {
    try {
      await api.buyListing(listing.id);
      sendPushNotification('Purchase Complete', `You now own "${listing.name}".`, 'system');
    } catch (e: any) {
      sendPushNotification('Purchase Failed', e?.message || 'Could not complete purchase.', 'system');
    }
  };

  if (loading) return <div className="text-center text-slate-500 text-xs py-4">Loading marketplace...</div>;
  if (error) return <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>;

  return (
    <div className="space-y-3">
      {listings.length === 0 && <div className="text-center text-slate-500 text-xs py-4">No listings yet.</div>}
      {listings.map((l) => (
        <div key={l.id} className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-3">
          {l.category?.toLowerCase().includes('smm') ? (
            <Rocket className="w-8 h-8 text-purple-400 shrink-0" />
          ) : (
            <Bot className="w-8 h-8 text-orange-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-white truncate">{l.name}</h5>
            <p className="text-slate-400 text-[11px]">by {l.seller_username} • ${Number(l.price).toFixed(2)}</p>
          </div>
          <button
            onClick={() => handleBuy(l)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-[11px] shrink-0"
          >
            Buy
          </button>
        </div>
      ))}
    </div>
  );
};

/* 10. Client Portal — ScottyHub has no VPS/hosting-status route, so this stays a
   static informational panel rather than faking live server metrics. */
const ClientPortalTool: React.FC = () => (
  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
    <h4 className="font-bold text-blue-400 text-sm">Client Hosting</h4>
    <p className="text-slate-300 text-xs">Manage bot deployments from the Bot Deployer tool. Dedicated hosting plans are arranged directly with the ScottyHub team via Support.</p>
  </div>
);

/* 11. Payments / Wallet — wired to routes/wallet.js (real balance + withdrawals) */
const PaymentsTool: React.FC = () => {
  const { sendPushNotification } = useApp();
  const [overview, setOverview] = useState<api.WalletOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('EcoCash');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .getWalletOverview()
      .then(setOverview)
      .catch((e) => setError(e?.message || 'Could not load wallet.'));
  };
  React.useEffect(load, []);

  const handleWithdraw = async () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 1) return;
    setSubmitting(true);
    try {
      await api.requestWithdrawal(amt, method, '');
      sendPushNotification('Withdrawal Requested', `$${amt} via ${method} is pending approval.`, 'system');
      setAmount('');
      load();
    } catch (e: any) {
      sendPushNotification('Withdrawal Failed', e?.message || 'Could not submit withdrawal.', 'system');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Wallet Balance</span>
        <span className="text-xl font-extrabold text-emerald-400">
          {overview ? `$${Number(overview.balance).toFixed(2)} USD` : '—'}
        </span>
        {overview && <span className="text-[10px] text-slate-500 block mt-0.5">Min withdrawal: ${overview.minWithdrawal}</span>}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          >
            <option value="EcoCash">EcoCash</option>
            <option value="InnBucks">InnBucks</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={submitting || !amount}
          className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition"
        >
          {submitting ? 'Submitting...' : 'Request Withdrawal'}
        </button>
      </div>

      {overview && overview.transactions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Recent Transactions</span>
          {overview.transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex justify-between text-[11px] p-2 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-slate-300">{t.description || t.type}</span>
              <span className={Number(t.amount) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {Number(t.amount) >= 0 ? '+' : ''}{Number(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* 12. Analytics — wired to routes/analytics.js overview */
const AnalyticsTool: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    api
      .getAnalyticsOverview()
      .then(setData)
      .catch((e) => setError(e?.message || 'Could not load analytics.'));
  }, []);

  if (error) return <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">{error}</div>;
  if (!data) return <div className="text-center text-slate-500 text-xs py-4">Loading analytics...</div>;

  const aiTotal = data.aiTotal ?? (data.aiUsage || []).reduce((s: number, r: any) => s + (r.count || 0), 0);
  const downloadTotal = data.downloadTotal ?? 0;

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
      <h4 className="font-bold text-emerald-400">Account Activity</h4>
      <p className="text-slate-300 text-xs">AI Generations: {aiTotal} • Downloads: {downloadTotal}</p>
    </div>
  );
};

/* 13. Admin Panel — wired to routes/admin.js /stats (real, and enforced server-side
   by adminOnly middleware — the client-side PIN below is just a local UI gate on
   top of that, not the real authorization boundary). */
const AdminPanelTool: React.FC = () => {
  const { profile } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [stats, setStats] = useState<api.AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isUnlocked) return;
    api
      .getAdminStats()
      .then(setStats)
      .catch((e) => setError(e?.message || 'Not authorized — this account is not an admin on ScottyHub.'));
  }, [isUnlocked]);

  return (
    <div className="space-y-3">
      {!isUnlocked ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
          <Shield className="w-8 h-8 text-rose-400 mx-auto" />
          <h4 className="font-bold text-rose-300">Admin Security Protection</h4>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (e.target.value === profile.pinCode) {
                setIsUnlocked(true);
              }
            }}
            placeholder="Enter Admin PIN"
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-center text-white text-xs font-mono font-bold tracking-widest w-40 mx-auto block"
          />
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">{error}</div>
      ) : !stats ? (
        <div className="text-center text-slate-500 text-xs py-4">Loading admin stats...</div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2 text-emerald-400">
          <h4 className="font-bold">Admin System Dashboard</h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Users: {stats.totalUsers} ({stats.verifiedUsers} verified) • Posts: {stats.totalPosts} • Premium: {stats.activePremiumUsers}
            <br />
            Pending withdrawals: {stats.pendingWithdrawals} (${stats.pendingWithdrawalAmount}) • Pending reports: {stats.pendingReports}
          </p>
        </div>
      )}
    </div>
  );
};

/* 14. News — ScottyHub's news feed is populated via the admin-only POST /api/admin/news;
   there's no public GET endpoint to read it back, so this stays a static panel. */
const NewsTool: React.FC = () => (
  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
    <span className="text-[10px] text-amber-400 font-bold uppercase">Official Announcement</span>
    <h4 className="font-bold text-white text-xs">ScottyHub Announcements</h4>
    <p className="text-slate-300 text-[11px] leading-relaxed">Check the Connect feed for the latest pinned announcements from the ScottyHub team.</p>
  </div>
);

const NotificationsListTool: React.FC = () => {
  const { notifications } = useApp();
  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className="p-3 rounded-2xl bg-slate-900 border border-white/5 space-y-1">
          <div className="flex justify-between font-bold text-white text-xs">
            <span>{n.title}</span>
            <span className="text-[9px] text-slate-500">{n.timestamp}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
        </div>
      ))}
    </div>
  );
};

/* 15. Music & Sports — the sports scores are wired to routes/sports.js (real ESPN
   passthrough). Music streaming has no ScottyHub route (only song search/download
   exists under routes/download.js, used by the Downloader tool), so that block
   stays presentational. */
const MusicSportsTool: React.FC = () => {
  const [events, setEvents] = useState<api.SportEvent[]>([]);
  const [type, setType] = useState<'livescores' | 'basketball' | 'cricket' | 'rugby'>('livescores');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getSports(type)
      .then(setEvents)
      .catch((e) => setError(e?.message || 'Could not load scores.'))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-pink-400" />
          <div>
            <h5 className="font-bold text-white text-xs">Amapiano & Zimdancehall Mix</h5>
            <span className="text-[10px] text-slate-400">Use the Downloader tool to fetch tracks</span>
          </div>
        </div>
        <button className="p-2 bg-pink-600 text-white rounded-full">
          <Play className="w-4 h-4 fill-white" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['livescores', 'basketball', 'cricket', 'rugby'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
              type === t ? 'bg-cyan-600 text-white' : 'bg-slate-900 border border-white/10 text-slate-400'
            }`}
          >
            {t === 'livescores' ? 'Soccer' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
        <span className="text-[10px] font-bold uppercase text-cyan-400 block">Live Sports Scores</span>
        {loading && <p className="text-slate-500 text-xs">Loading...</p>}
        {error && <p className="text-rose-400 text-xs">{error}</p>}
        {!loading && !error && events.length === 0 && <p className="text-slate-500 text-xs">No events right now.</p>}
        {events.slice(0, 6).map((e, idx) => (
          <p key={idx} className="text-white font-bold text-xs">
            {e.strHomeTeam} {e.intHomeScore ?? '-'} - {e.intAwayScore ?? '-'} {e.strAwayTeam} <span className="text-slate-400 font-normal">({e.strStatus})</span>
          </p>
        ))}
      </div>
    </div>
  );
};

const SupportTool: React.FC = () => (
  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 text-center">
    <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto" />
    <div>
      <h4 className="font-bold text-white">ScottyHub VIP Support</h4>
      <p className="text-slate-400 text-xs mt-1">Chat directly with our technical support team on WhatsApp or Telegram.</p>
    </div>
    <a
      href="https://wa.me/263781234567"
      target="_blank"
      rel="noreferrer"
      className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
    >
      Open WhatsApp Support
    </a>
  </div>
);
