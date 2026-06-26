import React, { useState, useEffect } from "react";
import Message from "./Message";
import { getMessages, saveMessages } from "../api";

function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load messages whenever conversation changes
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(conversationId);

        const formatted = data.map((msg) => ({
          text: msg.text,
          sender: msg.sender,
        }));

        setMessages(formatted);
      } catch (err) {
        console.log(err);
      }
    };

    loadMessages();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      text: input.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = input.trim();

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const botMessage = {
        text: data.reply,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save both messages
      await saveMessages(conversationId, {
        userMessage: currentMessage,
        botMessage: data.reply,
      });

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          text: err.message,
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="chat-window">
        <h2>Select or create a chat</h2>
      </div>
    );
  }

  return (
    <div className="chat-window">

      <div className="messages">
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            sender={msg.sender}
          />
        ))}

        {loading && (
          <div className="loading">
            AI is generating...
          </div>
        )}
      </div>

      <div className="button-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

    </div>
  );
}

export default ChatWindow;