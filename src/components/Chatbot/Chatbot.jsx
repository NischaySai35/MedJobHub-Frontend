import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import backendService from "../../Flask_service/flask";
import { useNavigate } from "react-router-dom";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // ⭐ NEW — simple handler for PARA + JSON blocks
  function handleStreamChunk(chunk) {
    // FINAL JSON BLOCK
    if (chunk.sender === "final") {
      try {
        const data = JSON.parse(chunk.text);

        // handle navigation
        if (data.action?.type === "NAVIGATE") {
          navigate(data.action.url);
        }

        // add final reply bubble
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: data.reply }
        ]);

      } catch (err) {
        console.error("JSON parse failed:", err);
      }

      return;
    }

    // PARA block → add as single bubble
    setMessages(prev => [...prev, { sender: "bot", text: chunk.text }]);
  }

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const userMessage = msg;
    setMsg("");

    // add the user's bubble
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);

    try {
      backendService.startChatbotStream(
        userMessage,
        (chunk) => handleStreamChunk(chunk),   // ⭐ UPDATED
        () => console.log("Stream finished")   // onDone
      );
    } catch (err) {
      console.error("Chatbot failed:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong talking to AI." }
      ]);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <button className="chatbot-btn" onClick={() => setOpen(!open)}>
        💬
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${open ? "open" : ""}`}>
        <div className="chatbot-header">
          <span>MedJobHub Assistant 🤖</span>
          <button onClick={() => setOpen(false)}>✖</button>
        </div>

        <div className="chatbot-body" ref={containerRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="chatbot-input-area">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-btn" onClick={sendMessage}>➤</button>
        </div>
      </div>
    </>
  );
}
