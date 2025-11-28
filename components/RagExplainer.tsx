import React from 'react';
import { FileText, ScanLine, Database, MessageSquare } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Ingesta & Chunking",
    desc: "Los documentos (PDF, Wiki) se dividen en fragmentos pequeños.",
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    color: "bg-blue-100",
    border: "border-blue-200"
  },
  {
    id: 2,
    title: "Vectorización",
    desc: "Gemini convierte el texto en vectores (listas de números).",
    icon: <ScanLine className="w-6 h-6 text-purple-600" />,
    color: "bg-purple-100",
    border: "border-purple-200"
  },
  {
    id: 3,
    title: "Vector DB",
    desc: "Almacenamos los vectores para búsquedas rápidas (ej. ChromaDB).",
    icon: <Database className="w-6 h-6 text-indigo-600" />,
    color: "bg-indigo-100",
    border: "border-indigo-200"
  },
  {
    id: 4,
    title: "Generación",
    desc: "Recuperamos lo relevante y Gemini genera la respuesta.",
    icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
    color: "bg-emerald-100",
    border: "border-emerald-200"
  }
];

const RagExplainer: React.FC = () => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">¿Cómo funciona un RAG?</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div key={step.id} className={`p-6 rounded-xl border ${step.border} bg-white shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10`}>
              {React.cloneElement(step.icon as React.ReactElement, { className: "w-24 h-24" })}
            </div>
            
            <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4`}>
              {step.icon}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                {step.id}
              </span>
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RagExplainer;