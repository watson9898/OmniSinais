import React, { useState } from 'react';
import { Download, Smartphone, Monitor, Apple, Copy, Check, X, FileCode, ExternalLink, Globe, AlertCircle, Sparkles } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPwa: () => void;
}

const APP_URL = 'https://ais-pre-hvz4om2rx6j3lp5bhynaru-514862978518.us-east1.run.app';

const INDEX_HTML_CONTENT = `<!doctype html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>OmniSinais - Estudo Interativo de Sinais, Fourier e Laplace</title>
    <meta name="description" content="Aplicativo de estudo para Engenharia com resolução guiada de equações passo a passo, testes de múltipla escolha orientados, ranking mundial e gráficos interativos." />
    
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#4f46e5" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="OmniSinais" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%234f46e5'/%3E%3Cpath d='M80 256 C 140 100, 180 412, 256 256 C 332 100, 372 412, 432 256' stroke='%2338bdf8' stroke-width='36' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='256' cy='256' r='24' fill='%23fbbf24'/%3E%3C/svg%3E" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

    <!-- KaTeX CSS for LaTeX math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerPwa,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'code'>('pwa');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(INDEX_HTML_CONTENT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(APP_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadIndexHtml = () => {
    const blob = new Blob([INDEX_HTML_CONTENT], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-sky-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Instalação do Aplicativo OmniSinais
              </h3>
              <p className="text-xs text-slate-400">
                Acesse online, instale no celular/PC com 1 clique ou veja o código
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📲 Instalação no Celular e PC (PWA)
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📄 Arquivo index.html & Exportação
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* Direct Web URL Link Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Globe className="w-4 h-4 text-sky-400" />
                    Link Direto do App (Abra no Navegador):
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Ativo Online
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={APP_URL}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <a
                    href={APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    Abrir no Navegador
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Install Instructions per Device */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Passo a passo para fixar na tela inicial:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Android */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Smartphone className="w-4 h-4" />
                      Android (Chrome)
                    </div>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                      <li>Abra o link no <strong className="text-white">Chrome</strong>.</li>
                      <li>Toque no menu (3 pontinhos).</li>
                      <li>Selecione <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.</li>
                    </ol>
                  </div>

                  {/* iOS iPhone */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                      <Apple className="w-4 h-4" />
                      iPhone / iPad (Safari)
                    </div>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                      <li>Abra o link no <strong className="text-white">Safari</strong>.</li>
                      <li>Toque no ícone de <strong className="text-white">Compartilhar</strong> (quadrado com seta).</li>
                      <li>Selecione <strong className="text-white">"Adicionar à Tela de Início"</strong>.</li>
                    </ol>
                  </div>

                  {/* PC / Desktop */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Monitor className="w-4 h-4" />
                      Computador (PC/Mac)
                    </div>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                      <li>Abra no Chrome ou Edge.</li>
                      <li>Clique no ícone de <strong className="text-white">Instalar App</strong> na barra de endereços (ao lado dos favoritos).</li>
                      <li>O app abrirá como janela nativa.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Notice why index.html needs build or dev server */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-amber-300 block">Atenção sobre o arquivo isolado:</strong>
                  <span>
                    Como o aplicativo é construído com React, TypeScript e renderizador matemático KaTeX, o arquivo <code className="text-amber-200 font-mono">index.html</code> precisa ser executado através de um servidor local (<code className="text-amber-200 font-mono">npm run dev</code> ou <code className="text-amber-200 font-mono">npm run build</code>) ou acessado pelo link da web. Clicar duas vezes no arquivo solto em uma pasta local sem servidor causa tela em branco.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Arquivo: <code className="text-indigo-300 font-mono">index.html</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copiado!' : 'Copiar Código'}
                  </button>
                  <button
                    onClick={handleDownloadIndexHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar index.html
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 sm:max-h-72 leading-relaxed">
                  {INDEX_HTML_CONTENT}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Última atualização: <strong className="text-slate-300">28/08/2026</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Versão 2.4.0 (PWA ativa)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuideModal;
