import React, { useState, useCallback, useRef } from 'react';
import { generateEmbeddings, retrieveContext, generateRAGResponse } from '../services/geminiService';
import { DocumentChunk, ChatMessage } from '../types';
import { SAMPLE_DOCS } from '../constants';
import { Search, Send, Bot, User, Database, Loader2, RefreshCw, Layers, Upload, FileText, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const RagDemo: React.FC = () => {
  // Use the first sample as default, or empty if preferred. 
  // Let's stick to index 0 of samples to start.
  const [corpus, setCorpus] = useState(SAMPLE_DOCS[0].content);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple chunking strategy for demo purposes (splitting by double newline)
  const handleIndex = useCallback(async () => {
    setIsIndexing(true);
    try {
      // Split by paragraphs primarily
      const rawChunks = corpus.split(/\n\n+/).filter(c => c.trim().length > 0);
      const vectorizedChunks = await generateEmbeddings(rawChunks);
      setChunks(vectorizedChunks);
      
      // Add system message
      setChatHistory(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'system',
        text: `Base de conocimiento actualizada. ${vectorizedChunks.length} fragmentos vectorizados.`
      }]);
    } catch (error) {
      console.error(error);
      alert("Error al indexar. Verifica tu API Key.");
    } finally {
      setIsIndexing(false);
    }
  }, [corpus]);

  const handleAsk = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;
    if (chunks.length === 0) {
      alert("¡Primero debes indexar el documento!");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputQuery
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setInputQuery('');

    try {
      // 1. Retrieve
      const relevantChunks = await retrieveContext(userMsg.text, chunks);
      
      // 2. Generate
      const answer = await generateRAGResponse(userMsg.text, relevantChunks);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: answer,
        retrievedContext: relevantChunks.map(c => c.text)
      };

      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: 'Error al procesar la pregunta. Inténtalo de nuevo.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputQuery, chunks, isProcessing]);

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDoc = SAMPLE_DOCS.find(doc => doc.title === e.target.value);
    if (selectedDoc) {
      setCorpus(selectedDoc.content);
      // Optional: Clear previous index/chat or keep it? 
      // Usually cleaner to inform user they need to re-index
      setChunks([]); 
      setChatHistory(prev => [...prev, {
        id: `system-sample-${Date.now()}`,
        role: 'system',
        text: `Se ha cargado el documento "${selectedDoc.title}". Haz clic en "Indexar" para procesarlo.`
      }]);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Página ${i} ---\n${pageText}\n\n`;
    }
    
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
      } else {
        // Assume text/plain or markdown
        text = await file.text();
      }

      setCorpus(text);
      setChunks([]); // Reset index
      setChatHistory(prev => [...prev, {
        id: `system-upload-${Date.now()}`,
        role: 'system',
        text: `Archivo "${file.name}" cargado. Haz clic en "Indexar" para procesarlo.`
      }]);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error al leer el archivo. Asegúrate de que sea un PDF válido o archivo de texto.");
    } finally {
      setUploadLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[750px]">
      {/* Left Column: Knowledge Base */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Database className="w-5 h-5" />
              <h3 className="font-semibold">Base de Conocimiento</h3>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${chunks.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {chunks.length > 0 ? `${chunks.length} vectores listos` : 'Sin indexar'}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                onChange={handleSampleChange}
                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                defaultValue={SAMPLE_DOCS[0].title}
              >
                {SAMPLE_DOCS.map((doc, idx) => (
                  <option key={idx} value={doc.title}>{doc.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              title="Cargar PDF o TXT"
            >
              {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span className="hidden sm:inline">Cargar</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.txt,.md" 
              onChange={handleFileUpload}
            />
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden flex flex-col relative">
          <textarea
            className="flex-1 w-full p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono leading-relaxed outline-none"
            value={corpus}
            onChange={(e) => setCorpus(e.target.value)}
            placeholder="Pega aquí los documentos o carga un archivo..."
          />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleIndex}
            disabled={isIndexing || !corpus.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            {isIndexing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Vectorizando...</span>
              </>
            ) : (
              <>
                <Layers className="w-5 h-5" />
                <span>Indexar en Memoria (Embeddings)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-slate-700">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">Chat con Cerebro</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Bot className="w-12 h-12 mb-4 opacity-20" />
              <p className="max-w-xs">Selecciona un documento, cárgalo o escribe uno nuevo. Luego presiona "Indexar" para comenzar.</p>
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                  ? 'bg-amber-50 text-amber-800 border border-amber-100 text-sm w-full text-center'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.role !== 'system' && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
                {msg.role === 'system' && (
                  <p className="font-medium">{msg.text}</p>
                )}
                
                {msg.retrievedContext && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Fuentes Recuperadas
                    </p>
                    <div className="space-y-2">
                      {msg.retrievedContext.map((ctx, idx) => (
                        <div key={idx} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 text-slate-500 italic truncate">
                          "{ctx.substring(0, 80)}..."
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-slate-500">Consultando la base vectorial y generando respuesta...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ej: ¿Cuál es la política para viajes internacionales?"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              disabled={isProcessing || chunks.length === 0}
            />
            <button 
              type="submit"
              disabled={isProcessing || chunks.length === 0 || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg px-4 transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RagDemo;