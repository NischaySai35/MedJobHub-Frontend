import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import backendService from "../../Flask_service/flask";
import { useNavigate } from "react-router-dom";

/**
 * Robust Chatbot component (PARA streaming version)
 * - Expects backendService.startChatbotStream(message, onMessage, onDone)
 *   to call onMessage with objects like:
 *     { sender: "bot", text: "<paragraph text>" }  // for <PARA> blocks
 *     { sender: "final", text: '<JSON string>' }    // for final <JSON> block
 *
 * Minimal structural changes from your original file, but with:
 * - visible "Analyzing..." bubble while stream is running
 * - try/catch and error bubble
 * - prevent Enter double-send
 */

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false); // shows analyzing bubble
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Helper: add a message bubble
  const pushMessage = (m) => {
    setMessages((prev) => [...prev, m]);
  };

  // Handler for incoming PARA / final JSON chunks
  function handleStreamChunk(chunk) {
    try {
      if (!chunk || !chunk.sender) return;

      if (chunk.sender === "final") {
        // final JSON block: parse and handle
        try {
          const data = JSON.parse(chunk.text);
          if (data.action?.type === "NAVIGATE") {
            // navigate then show reply (or show reply then navigate if you prefer)
            pushMessage({ sender: "bot", text: data.reply || "" });
            navigate(data.action.url);
          } else {
            pushMessage({ sender: "bot", text: data.reply || "" });
          }
        } catch (err) {
          console.error("Failed parsing final JSON:", err, chunk.text);
          pushMessage({ sender: "bot", text: chunk.text });
        }
      } else {
        // PARA paragraph chunk: show as single bubble
        pushMessage({ sender: "bot", text: chunk.text });
      }
    } catch (err) {
      console.error("handleStreamChunk error:", err);
    }
  }

  const sendMessage = async () => {
    if (!msg.trim() || streaming) return; // prevent sending when streaming already in progress
    const userMessage = msg;
    setMsg("");

    // Show user's message immediately
    pushMessage({ sender: "user", text: userMessage });

    // Show analyzing bubble
    setStreaming(true);
    const analyzingId = `__analyzing_${Date.now()}`;
    pushMessage({ sender: "bot", text: "Analyzing your data...", _id: analyzingId });

    try {
      // startChatbotStream must attach event listeners and call onMessage for each PARA/final chunk
      backendService.startChatbotStream(
        userMessage,
        (chunk) => {
          // remove the "Analyzing..." bubble the first time we get a chunk
          setMessages(prev => {
            // remove the first analyzing bubble if it exists
            const filtered = prev.filter(m => !(m.text === "Analyzing your data..." && m._id === analyzingId));
            return filtered;
          });

          // handle incoming chunks
          handleStreamChunk(chunk);
        },
        () => {
          // stream ended
          setStreaming(false);
          // ensure analyzing bubble removed
          setMessages(prev => prev.filter(m => !(m.text === "Analyzing your data..." && m._id === analyzingId)));
          console.log("Stream finished");
        }
      );
    } catch (err) {
      // If startChatbotStream threw synchronously
      console.error("Failed to start stream:", err);
      setStreaming(false);

      // remove analyzing bubble
      setMessages(prev => prev.filter(m => !(m.text === "Analyzing your data..." && m._id === analyzingId)));

      // show error bubble for user
      pushMessage({ sender: "bot", text: "⚠️ Something went wrong starting the chat stream." });
    }
  };

  // Prevent Enter from submitting twice and allow using Shift+Enter for newline (if you want)
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

          {/* If streaming and there is NO analyzing bubble present, show a small indicator */}
          {streaming && !messages.some(m => m.text === "Analyzing your data...") && (
            <div className="chat-msg bot">Analyzing your data...</div>
          )}
        </div>

        <div className="chatbot-input-area">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="send-btn" onClick={sendMessage}>➤</button>
        </div>
      </div>
    </>
  );
}
