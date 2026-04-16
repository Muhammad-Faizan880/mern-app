import { useState } from "react";

export default function CodeGeneratorModal({ open, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setCode("");

    try {
      const res = await fetch("http://localhost:5000/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          token: localStorage.getItem("token"),
        }),
      });

      const data = await res.json();
      setCode(data.code);
    } catch (err) {
      setCode("Error generating code");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-xl p-5 flex flex-col">
        
        <h2 className="text-lg font-semibold mb-3">⚡ AI Code Generator</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Create login form in React with Tailwind"
          className="border p-2 rounded mb-3"
        />

        <button
          onClick={generateCode}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-3"
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>

        <div className="bg-black text-green-400 p-3 rounded overflow-auto text-sm flex-1">
          <pre>{code}</pre>
        </div>

        <button
          onClick={onClose}
          className="mt-3 bg-gray-300 px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}