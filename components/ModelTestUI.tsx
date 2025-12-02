import React, { useEffect, useState } from "react";
import { embedderLLM } from "../Models/agentlee-local-bundle.js";
import { sendMessageToAgentLee } from "../services/leewayIndustriesService";
import { getModelStatusSnapshot, warmUpModelGroup } from "../services/localModelHub";

interface ModelTestUIProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestMessage {
  id: number;
  sender: "user" | "system";
  text: string;
  timestamp: Date;
}

export const ModelTestUI: React.FC<ModelTestUIProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [messages, setMessages] = useState<TestMessage[]>([
    { id: 1, sender: "system", text: "Model Test UI - Local Transformers Diagnostics", timestamp: new Date() }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [testResults, setTestResults] = useState<{
    modelsReady: boolean | null;
    responseTime: number | null;
    lastError: string | null;
  }>({
    modelsReady: null,
    responseTime: null,
    lastError: null
  });
  const [modelStatuses, setModelStatuses] = useState(() => getModelStatusSnapshot());

  useEffect(() => {
    let mounted = true;
    warmUpModelGroup().finally(() => {
      if (!mounted) return;
      setModelStatuses(getModelStatusSnapshot());
    });
    const id = setInterval(() => {
      if (!mounted) return;
      setModelStatuses(getModelStatusSnapshot());
    }, 1500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const addMessage = (text: string, sender: "user" | "system" = "user") => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input;
    setInput("");
    setIsThinking(true);
    addMessage(userMessage, "user");

    const startTime = performance.now();

    try {
      addMessage("Running local narration stack...", "system");
      
      const response = await sendMessageToAgentLee(userMessage);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setTestResults({
        modelsReady: true,
        responseTime,
        lastError: null
      });

      addMessage(`Response received in ${responseTime}ms:`, "system");
      addMessage(response.text, "system");
      
    } catch (error: any) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setTestResults({
        modelsReady: false,
        responseTime,
        lastError: error.message || String(error)
      });

      addMessage(`Error after ${responseTime}ms:`, "system");
      addMessage(error.message || String(error), "system");
    } finally {
      setIsThinking(false);
    }
  };

  const runQuickTest = async () => {
    addMessage("=== Running Quick Test (Local) ===", "system");
    addMessage("Testing: Hello", "user");
    try {
      const response = await sendMessageToAgentLee("Hello", undefined);
      addMessage("✅ Quick test successful!", "system");
      addMessage(`Response: ${response.text}`, "system");
    } catch (error: any) {
      addMessage("❌ Quick test failed", "system");
      addMessage(error.message, "system");
    }
  };

  const testEmbeddings = async () => {
    addMessage("=== Testing Local Embeddings ===", "system");
    
    try {
      addMessage("Generating embeddings via Transformers.js...", "system");
      const outcome = await embedderLLM.embed("What is Visu-Sewer and what do they do?");
      addMessage("✅ Embeddings test successful!", "system");
      addMessage(`Vector length: ${outcome.embedding.length}`, "system");
      
    } catch (error: any) {
      addMessage("❌ Embeddings test failed", "system");
      addMessage(error.message, "system");
    }
  };

  const clearMessages = () => {
    setMessages([{ id: 1, sender: "system", text: "Model Test UI - Local Transformers Diagnostics", timestamp: new Date() }]);
    setTestResults({ modelsReady: null, responseTime: null, lastError: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Model Test UI</h2>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          {/* Model Selection */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Model Status</label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {modelStatuses.length ? modelStatuses.map((status) => (
                <div key={status.key} className="p-3 bg-slate-700/60 rounded border border-slate-600">
                  <div className="font-semibold text-white">{status.label}</div>
                  <div>Model: {status.modelId}</div>
                  <div>Ready: {status.ready ? 'Yes' : status.loading ? `Loading ${status.progress || 0}%` : 'No'}</div>
                  {status.error && <div className="text-red-300">Error: {status.error}</div>}
                </div>
              )) : (
                <div className="text-slate-300">No model status reported yet.</div>
              )}
            </div>
          </div>
          
          {/* Image Input */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Image URL (for multimodal chat)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runQuickTest}
              className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-sm"
            >
              Quick Test
            </button>
            <button
              onClick={testEmbeddings}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm"
            >
              Test Embeddings
            </button>
            <button
              onClick={clearMessages}
              className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white rounded text-sm"
            >
              Clear
            </button>
          </div>
          
          {/* Test Results */}
          {testResults.modelsReady !== null && (
            <div className="mt-2 p-2 bg-slate-700 rounded text-sm">
              <div className="flex gap-4">
                <span className={`font-mono ${
                  testResults.modelsReady ? 'text-green-400' : 'text-red-400'
                }`}>
                  Local Stack: {testResults.modelsReady ? 'Responsive' : 'Issue'}
                </span>
                {testResults.responseTime && (
                  <span className="text-blue-400 font-mono">
                    Response: {testResults.responseTime}ms
                  </span>
                )}
              </div>
              {testResults.lastError && (
                <div className="text-red-400 mt-1 text-xs">
                  Error: {testResults.lastError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-900/80 text-white rounded-br-none' 
                  : 'bg-slate-700/80 text-slate-100 rounded-bl-none'
              }`}>
                <div className="font-medium text-xs text-slate-400 mb-1">
                  {msg.sender === 'user' ? 'You' : 'System'}
                  <span className="ml-2 text-slate-500">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-700/80 p-3 rounded-lg rounded-bl-none flex gap-1 items-center">
                <span className="text-xs text-green-400 font-mono animate-pulse">Processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message to test the model..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Test examples: "Hello", "What is Visu-Sewer?", "Explain trenchless rehabilitation"
          </div>
        </div>
      </div>
    </div>
  );
};