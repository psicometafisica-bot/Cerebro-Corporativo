import React from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { PYTHON_CODE_SETUP, PYTHON_CODE_INGEST, PYTHON_CODE_QUERY } from '../constants';

const CodeBlock: React.FC<{ title: string; code: string; language?: string }> = ({ title, code, language = 'python' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-slate-800 bg-[#1e293b] shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">{title}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors"
          title="Copiar código"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-sm font-mono text-slate-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const CodeGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Implementación en Python</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Utiliza este código para implementar el "Cerebro Corporativo" en tu entorno de producción.
          Requiere una base de datos vectorial como ChromaDB y la librería oficial de Gemini.
        </p>
      </div>

      <CodeBlock 
        title="1. Configuración del Entorno" 
        code={PYTHON_CODE_SETUP} 
        language="bash" 
      />

      <CodeBlock 
        title="2. Ingesta y Vectorización (Embeddings)" 
        code={PYTHON_CODE_INGEST} 
      />

      <CodeBlock 
        title="3. Sistema de Preguntas (El Bot)" 
        code={PYTHON_CODE_QUERY} 
      />
    </div>
  );
};

export default CodeGuide;