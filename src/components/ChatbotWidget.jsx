import React, { useState } from "react";
import backendService from "../Flask_service/flask";
import { useNavigate } from "react-router-dom";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const sendMessage = async () => {
    const userMsg = input;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    const res = await backendService.chatbot(userMsg);
    const reply = res.reply;
    const action = res.action;

    setMessages(prev => [...prev, { sender: "bot", text: reply }]);

    if (action && action.type === "NAVIGATE") {
      navigate(action.url);
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chatbot-box">
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>{m.text}</div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
