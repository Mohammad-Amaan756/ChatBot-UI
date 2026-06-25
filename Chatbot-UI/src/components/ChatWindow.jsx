import Message from "./Message";
import { useEffect, useState } from "react";

function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      text: "Hello",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Get saved chats from MongoDB
  const getChats = async () => {
    try {
      const response = await fetch("http://localhost:5000/chats");
      const data = await response.json();

      if (data.success) {
        const formattedChats = data.chats.map((chat) => ({
          text: chat.message,
          sender: chat.user,
        }));

        setMessages(formattedChats);
      }
    } catch (error) {
      console.log("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    getChats();
  }, []);

    useEffect(() => {
    getChats();
    }, []);

useEffect(() => {
  setMessages([]);
}, [chatId]);

  const sendMessage = async () => {
    if (input.trim() === "" || loading) return;

    const currentMessage = input.trim();

    const userMsg = {
      text: currentMessage,
      sender: "user",
    };

    // Show user message immediately
    setMessages((previousMessages) => [
      ...previousMessages,
      userMsg,
    ]);

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
        }),
      });

      const data = await response.json();

      // Show Gemini/backend error in chat
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not get AI response");
      }

      const aiMessage = {
        text: data.reply,
        sender: "bot",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (err) {
      console.log("Frontend error:", err.message);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          text: err.message || "Something went wrong. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            sender={msg.sender}
          />
        ))}

        {loading && <div>AI is generating...</div>}
      </div>

      <div className="button-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={loading}
        />

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;