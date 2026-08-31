import React, { useState } from 'react';
import { Coffee, Coins, CircleDollarSign, ExternalLink, Sparkles, Check, X, ShieldCheck, QrCode, Copy, DollarSign, Smartphone, ArrowRight, Zap, Gift } from 'lucide-react';

interface KofiSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AUTHOR_KOFI_USERNAME = 'watson17';
// Direct payment/profile URL
export const AUTHOR_KOFI_URL = `https://ko-fi.com/${AUTHOR_KOFI_USERNAME}`;
export const AUTHOR_KOFI_PAYMENT_URL = `https://ko-fi.com/${AUTHOR_KOFI_USERNAME}`;
export const AUTHOR_PIX_KEY = '5acb34d5-52ab-487c-a480-eed105f7346e';

export const KofiSupportModal: React.FC<KofiSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'kofi'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedKofi, setCopiedKofi] = useState(false);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(AUTHOR_PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyKofi = () => {
    navigator.clipboard.writeText(AUTHOR_KOFI_PAYMENT_URL);
    setCopiedKofi(true);
    setTimeout(() => setCopiedKofi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-rose-500/20 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/80 via-indigo-950/60 to-slate-900 border-b border-slate-800 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-amber-500 to-indigo-500 text-white flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-amber-500/25">
            <Coins className="w-7 h-7 text-white animate-bounce" />
          </div>

          <h3 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
            Apoie o Desenvolvedor do OmniSinais
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
            Sua contribuição voluntária incentiva o desenvolvedor a manter o projeto ativo, atualizando os motores de resolução analítica e criando novos problemas práticos.
          </p>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 mt-4 p-1 bg-slate-950/80 rounded-xl border border-slate-800 max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab('pix')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pix'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>PIX Instantâneo</span>
            </button>
            <button
              onClick={() => setActiveTab('kofi')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'kofi'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-rose-300" />
              <span>Ko-fi (Cartão)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'pix' ? (
            /* PIX SECTION */
            <div className="space-y-4 animate-fade-in">
              {/* Official Key Card */}
              <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Chave PIX Aleatória Oficial:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Sem Taxas
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-mono text-emerald-400 font-bold break-all select-all tracking-wider">
                      {AUTHOR_PIX_KEY}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Qualquer valor de incentivo (R$ 2, R$ 5, R$ 10, R$ 20...)
                    </span>
                    <button
                      onClick={handleCopyPix}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        copiedPix
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions Steps */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Como realizar o PIX no aplicativo do seu banco:
                </h4>
                <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Clique em <strong className="text-emerald-400">"Copiar Chave PIX"</strong> acima.
                  </li>
                  <li>
                    Abra o app do seu banco (Nubank, Inter, Itaú, BB, Bradesco, Mercado Pago, etc.).
                  </li>
                  <li>
                    Vá na opção <strong className="text-slate-200">Área PIX &gt; Transferir / Pagar &gt; Chave Aleatória</strong> e cole a chave.
                  </li>
                  <li>
                    Escolha qualquer valor de apoio e confirme a transferência.
                  </li>
                </ol>
              </div>

              {/* Quick Values Suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sugestões de contribuição para o projeto:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    onClick={handleCopyPix}
                    className="p-2.5 bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="text-lg">☕</div>
                    <div className="text-xs font-bold text-slate-200">1 Café</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">R$ 5,00</div>
                  </div>
                  <div
                    onClick={handleCopyPix}
                    className="p-2.5 bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="text-lg">⚡</div>
                    <div className="text-xs font-bold text-slate-200">Servidores</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">R$ 15,00</div>
                  </div>
                  <div
                    onClick={handleCopyPix}
                    className="p-2.5 bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="text-lg">🚀</div>
                    <div className="text-xs font-bold text-slate-200">Super Dev</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">R$ 30,00</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* KO-FI SECTION */
            <div className="space-y-4 animate-fade-in">
              {/* Ko-fi Direct Payment Card */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Página Oficial de Doação no Ko-fi:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Apoio Direto ao Desenvolvedor
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Coffee className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-mono text-rose-300 font-bold truncate">
                      ko-fi.com/watson17
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyKofi}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKofi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKofi ? 'Link Copiado!' : 'Copiar Link'}
                    </button>
                    <a
                      href={AUTHOR_KOFI_PAYMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Acessar
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Donation Tiers Suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Escolha o valor de apoio no Ko-fi (Cartão de Crédito ou PayPal):
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <a
                    href={AUTHOR_KOFI_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-center transition-all group shadow-sm hover:scale-[1.02]"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">☕</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300">1 Cafézinho</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">R$ 5,00</div>
                  </a>

                  <a
                    href={AUTHOR_KOFI_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-center transition-all group shadow-sm hover:scale-[1.02]"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📚</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300">Livro Didático</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">R$ 15,00</div>
                  </a>

                  <a
                    href={AUTHOR_KOFI_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-center transition-all group shadow-sm hover:scale-[1.02]"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚀</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300">Super Mentor</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">R$ 30,00</div>
                  </a>
                </div>
              </div>

              {/* Primary Direct Payment Button */}
              <div className="pt-2">
                <a
                  href={AUTHOR_KOFI_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition-all active:scale-98 hover:shadow-rose-600/60 cursor-pointer"
                >
                  <Coffee className="w-5 h-5" />
                  Apoiar o Desenvolvedor no Ko-fi (Ir para Pagamento)
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KofiSupportModal;

