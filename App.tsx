import React, { useState } from 'react';
import Navbar from './components/Navbar';
import RagExplainer from './components/RagExplainer';
import RagDemo from './components/RagDemo';
import CodeGuide from './components/CodeGuide';
import { AppTab } from './types';
import { Code2, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DEMO);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar currentTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide mb-4">
            Ingeniería de IA
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cerebro Corporativo <span className="text-indigo-600">(RAG)</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sistema avanzado que indexa documentos empresariales en una base vectorial 
            para responder consultas complejas utilizando la API de Gemini.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button
              onClick={() => setActiveTab(AppTab.DEMO)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === AppTab.DEMO 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Demo Interactiva
            </button>
            <button
              onClick={() => setActiveTab(AppTab.GUIDE)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === AppTab.GUIDE 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Guía Python
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === AppTab.DEMO ? (
            <div className="space-y-12">
              <RagExplainer />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Prueba el Sistema</h2>
                  <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    Simulación Client-Side con Gemini API
                  </div>
                </div>
                <RagDemo />
              </div>
            </div>
          ) : (
            <CodeGuide />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;