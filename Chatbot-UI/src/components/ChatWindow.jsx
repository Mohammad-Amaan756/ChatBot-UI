import Message from "./Message";
import { useEffect, useState } from "react";

function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      text: "hello",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getChats = async () => {
       try {
            const response = await fetch("http://localhost:3000/chats");
            
            const data = await response.json();
            if(data.success){   
                setMessages(data.chats);
            } 
         } catch (error) {
             console.log("Error fetching chats:", error);
       }
    };
    useEffect(() => {
      getChats();
    }, []);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMsg = {
      text: input,
      sender: "amaan",
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMsg,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        text: data.reply,
        sender: "AI",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (err) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          text: "Something went wrong",
          sender: "AI",
        },
      ]);
    }

    setLoading(false);
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

        {loading && <div>AI is Generating...</div>}
      </div>

      <div className="button-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;