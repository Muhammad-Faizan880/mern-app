import { useState, useRef, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };

    // add user message to chat
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          token: localStorage.getItem("token"),
        }),
      });

      const data = await res.json();

      const aiMsg = { role: "ai", text: data.reply };

      // add AI response
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error fetching response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b text-center font-semibold text-lg">
          🤖 AI Assistant
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
  {messages.map((msg, i) => (
    <div
      key={i}
      className={`flex flex-col ${
        msg.role === "user" ? "items-end" : "items-start"
      }`}
    >
      {/* 👤 Name */}
      <span className="text-xs text-gray-500 mb-1">
        {msg.role === "user"
          ? loggedInUser?.name || "You"
          : "AI"}
      </span>

      {/* 💬 Message bubble */}
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
          msg.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {msg.text}
      </div>
    </div>
  ))}

  {loading && (
    <div className="flex justify-start">
      <div className="bg-gray-200 px-4 py-2 rounded-2xl text-sm">
        Typing...
      </div>
    </div>
  )}

  <div ref={bottomRef}></div>
</div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
