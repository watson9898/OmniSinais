import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  children?: string;
  block?: boolean;
  className?: string;
}

// Common Portuguese & English words that unequivocally indicate natural language text
const NATURAL_LANGUAGE_WORDS_REGEX =
  /\b(o|a|os|as|um|uma|uns|umas|de|da|do|das|dos|em|no|na|nos|nas|por|para|com|sem|sob|sobre|que|se|e|ou|mas|como|quando|onde|porque|porquê|qual|quais|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|seu|sua|seus|suas|meu|minha|cada|todo|toda|todos|todas|outro|outra|muito|muita|pouco|pouca|mais|menos|também|já|ainda|assim|apenas|somente|não|sim|substitua|isole|calcule|determine|encontre|obtenha|aplique|reconheça|observe|repare|veja|note|use|utilize|simplifique|multiplique|divida|some|subtraia|integre|derive|escreva|coloque|transforme|inverta|agrupe|expanda|fatore|resolva|passo|etapa|objetivo|dados|enunciado|resposta|solução|resultado|valor|valores|termo|termos|função|funções|sinal|sinais|sistema|sistemas|equação|equações|fórmula|fórmulas|propriedade|propriedades|teorema|teoremas|tabela|tabelas|domínio|tempo|frequência|complexa|real|imaginária|inversa|direta|parcial|parciais|resíduo|resíduos|polo|polos|zero|zeros|raiz|raízes|grau|ordem|inicial|iniciais|final|finais|constante|constantes|variável|variáveis|coeficiente|coeficientes|amostragem|peneiramento|impulso|degrau|rampa|exponencial|seno|cosseno|convolução|estabilidade|atenção|cuidado|armadilha|dica|estratégia|roteiro|plano|como|fazer|saber|nesta|neste|questão|exercício|problema|calculate|solve|find|determine|substitute|isolate|apply|given|step|hint|objective)\b/i;

function isNaturalLanguageText(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();

  // If it contains line breaks with sentences or punctuation with words
  if (trimmed.includes('\n') && /[a-zA-Z]{3,}/.test(trimmed)) return true;

  // Check matching Portuguese/English dictionary keywords
  const match = trimmed.match(NATURAL_LANGUAGE_WORDS_REGEX);
  if (match) return true;

  // If there are multiple words with spaces and no typical formula equal signs or backslashes
  const words = trimmed.split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 3 && !trimmed.startsWith('\\') && !trimmed.includes('\\frac')) {
    return true;
  }

  return false;
}

// Replaces any raw LaTeX commands, backslashes and symbols in plain text with beautiful standard unicode symbols
export function cleanRawMathAndTextSymbols(text: string): string {
  if (!text) return '';
  return text
    // Replace script Laplace / Fourier / Z operators
    .replace(/\\mathcal\{L\}\^\{-1\}/gi, 'ℒ⁻¹')
    .replace(/\\mathcal\{L\}\^-1/gi, 'ℒ⁻¹')
    .replace(/\\mathcal\{L\}/gi, 'ℒ')
    .replace(/\\mathcal\{F\}\^\{-1\}/gi, 'ℱ⁻¹')
    .replace(/\\mathcal\{F\}\^-1/gi, 'ℱ⁻¹')
    .replace(/\\mathcal\{F\}/gi, 'ℱ')
    .replace(/\\mathcal\{Z\}\^\{-1\}/gi, '𝒵⁻¹')
    .replace(/\\mathcal\{Z\}\^-1/gi, '𝒵⁻¹')
    .replace(/\\mathcal\{Z\}/gi, '𝒵')
    // Operators
    .replace(/\\operatorname\{Re\}/gi, 'Re')
    .replace(/\\operatorname\{Im\}/gi, 'Im')
    .replace(/\\operatorname\{sinc\}/gi, 'sinc')
    .replace(/\\operatorname\{rect\}/gi, 'rect')
    .replace(/\\operatorname\{sgn\}/gi, 'sgn')
    // Fractions in text: \frac{a}{b} -> (a)/(b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Roots
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    // Text formatting wrappers & units
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathit\{([^}]+)\}/g, '$1')
    .replace(/\\boldsymbol\{([^}]+)\}/g, '$1')
    // Brackets and delimiters
    .replace(/\\left\s*/g, '')
    .replace(/\\right\s*/g, '')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    // Spacing commands in LaTeX
    .replace(/\\quad/g, '  ')
    .replace(/\\qquad/g, '   ')
    .replace(/\\enspace/g, ' ')
    .replace(/\\[,;:!]/g, ' ')
    // Greek letters
    .replace(/\\delta\b/gi, 'δ')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\omega_0\b/gi, 'ω₀')
    .replace(/\\omega_n\b/gi, 'ωₙ')
    .replace(/\\omega_d\b/gi, 'ω_d')
    .replace(/\\omega_c\b/gi, 'ω_c')
    .replace(/\\omega\b/gi, 'ω')
    .replace(/\\Omega\b/g, 'Ω')
    .replace(/\\pi\b/gi, 'π')
    .replace(/\\Pi\b/g, 'Π')
    .replace(/\\tau\b/gi, 'τ')
    .replace(/\\sigma\b/gi, 'σ')
    .replace(/\\Sigma\b/g, 'Σ')
    .replace(/\\alpha\b/gi, 'α')
    .replace(/\\beta\b/gi, 'β')
    .replace(/\\gamma\b/gi, 'γ')
    .replace(/\\Gamma\b/g, 'Γ')
    .replace(/\\theta\b/gi, 'θ')
    .replace(/\\Theta\b/g, 'Θ')
    .replace(/\\lambda\b/gi, 'λ')
    .replace(/\\Lambda\b/g, 'Λ')
    .replace(/\\zeta\b/gi, 'ζ')
    .replace(/\\eta\b/gi, 'η')
    .replace(/\\epsilon\b/gi, 'ε')
    .replace(/\\varepsilon\b/gi, 'ε')
    .replace(/\\mu\b/gi, 'μ')
    .replace(/\\nu\b/gi, 'ν')
    .replace(/\\rho\b/gi, 'ρ')
    .replace(/\\phi\b/gi, 'φ')
    .replace(/\\varphi\b/gi, 'ϕ')
    .replace(/\\Phi\b/g, 'Φ')
    .replace(/\\psi\b/gi, 'ψ')
    .replace(/\\Psi\b/g, 'Ψ')
    // Calculus & mathematical symbols
    .replace(/\\int_{-\\infty}\^\{\\infty\}/g, '∫_{-∞}^{∞}')
    .replace(/\\int_0\^\{\\infty\}/g, '∫₀^∞')
    .replace(/\\int\b/g, '∫')
    .replace(/\\oint\b/g, '∮')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\prod\b/g, '∏')
    .replace(/\\infty\b/gi, '∞')
    .replace(/\\partial\b/g, '∂')
    .replace(/\\nabla\b/g, '∇')
    .replace(/\\pm\b/g, '±')
    .replace(/\\mp\b/g, '∓')
    .replace(/\\times\b/g, '×')
    .replace(/\\div\b/g, '÷')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\equiv\b/g, '≡')
    .replace(/\\neq\b/g, '≠')
    .replace(/\\le\b|\\leq\b/g, '≤')
    .replace(/\\ge\b|\\geq\b/g, '≥')
    .replace(/\\to\b|\\rightarrow\b/g, '→')
    .replace(/\\leftarrow\b/g, '←')
    .replace(/\\implies\b|\\Rightarrow\b/g, '⟹')
    .replace(/\\iff\b|\\Leftrightarrow\b/g, '⟺')
    .replace(/\\forall\b/g, '∀')
    .replace(/\\exists\b/g, '∃')
    .replace(/\\in\b/g, '∈')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\angle\b/g, '∠')
    // Subscripts and superscripts in plain text
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^n\b/g, 'ⁿ')
    .replace(/\^t\b/g, 'ᵗ')
    .replace(/\^0\b/g, '⁰')
    .replace(/\^1\b/g, '¹')
    .replace(/_0\b/g, '₀')
    .replace(/_1\b/g, '₁')
    .replace(/_2\b/g, '₂')
    .replace(/_n\b/g, 'ₙ')
    // Strip accidental unescaped backslashes before characters
    .replace(/\\([a-zA-Z0-9])/g, '$1')
    // Remove standalone backslashes
    .replace(/\\/g, '')
    // Remove any remaining stray $ signs
    .replace(/\$/g, '')
    // Ensure clean natural spacing between words
    .replace(/[ \t]+/g, ' ');
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  children,
  block = false,
  className = '',
}) => {
  const rawContent = math !== undefined ? math : children || '';

  const html = useMemo(() => {
    if (!rawContent || !rawContent.trim()) return '';

    const content = rawContent.trim();
    const hasDollar = content.includes('$');
    const isText = isNaturalLanguageText(content);

    // CASE 1: Pure Mathematical Formula (no natural language sentences)
    if (!hasDollar && !isText) {
      try {
        return katex.renderToString(content, {
          displayMode: block,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (err) {
        return `<span class="font-mono text-sm">${escapeHtml(cleanRawMathAndTextSymbols(content))}</span>`;
      }
    }

    // CASE 2: Text containing Math ($...$ or $$...$$) OR Natural Language Guide Text
    const parts: string[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      // Text segment before the math token
      if (matchIndex > lastIndex) {
        const textSegment = content.substring(lastIndex, matchIndex);
        const cleanedText = cleanRawMathAndTextSymbols(escapeHtml(textSegment)).replace(/\n/g, '<br/>');
        parts.push(cleanedText);
      }

      // Formula segment
      const isBlockMath = matchText.startsWith('$$') && matchText.endsWith('$$');
      const formula = isBlockMath
        ? matchText.slice(2, -2).trim()
        : matchText.slice(1, -1).trim();

      if (formula) {
        try {
          const rendered = katex.renderToString(formula, {
            displayMode: isBlockMath,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          if (isBlockMath) {
            parts.push(`<div class="my-2 overflow-x-auto text-center py-1">${rendered}</div>`);
          } else {
            // Keep inline math cleanly aligned and spaced
            parts.push(` <span class="inline-math inline-block px-1 align-baseline">${rendered}</span> `);
          }
        } catch (e) {
          parts.push(` ${cleanRawMathAndTextSymbols(formula)} `);
        }
      }

      lastIndex = matchIndex + matchText.length;
    }

    // Trailing text segment
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      const cleanedRemaining = cleanRawMathAndTextSymbols(escapeHtml(remainingText)).replace(/\n/g, '<br/>');
      parts.push(cleanedRemaining);
    }

    return parts.join('');
  }, [rawContent, block]);

  return (
    <span
      className={`katex-wrapper ${block ? 'block my-1 overflow-x-auto text-center py-1' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathView;

