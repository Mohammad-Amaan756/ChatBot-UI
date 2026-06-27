import Message from "./Message";
import { useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";

function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([
    //   {
    //     text: "Hello",
    //     sender: "user1",
    //   },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const getMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/conversation/${chatId}`);

        const data = await res.json();

        if (data.success) {
          const formattedMessages = data.conversation.messages.map((msg) => ({
            text: msg.text,
            sender: msg.role === "assistant" ? "AI" : "user",
          }));

          setMessages(formattedMessages);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getMessages();
  }, [chatId]);

  // const getChats = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/conversation");
  //     const data = await response.json();
  //     if (data.success) {
  //       setMessages(data.chats);
  //     }
  //   } catch (error) {
  //     console.log("Error fetching chats", error);
  //   }
  // };

  const sendMessage = async () => {
    if (!chatId) return;

    if (input.trim() === "") return;

    const userMessage = {
      text: input,
      sender: "user",
    };

    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/home", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: currentInput,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        text: data.reply,
        sender: "AI",
      };

      // Add AI response
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Something went wrong, please try again.",
          sender: "AI",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-8 py-8">
      <div className="mb-6 rounded-[40px] bg-white/85 border border-white/80 p-6 shadow-[0_18px_80px_rgba(148,110,255,0.16)]">
        <div className="text-sm uppercase tracking-[0.24em] text-violet-500">Chat</div>
        <div className="mt-2 text-3xl font-semibold text-slate-950">Start your conversation</div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[40px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_80px_rgba(148,110,255,0.08)] scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}

        {loading && (
          <div className="text-slate-500 italic">AI is responding...</div>
        )}
      </div>

      <div className="mt-6 rounded-[36px] bg-white/90 border border-white/80 p-4 shadow-[0_12px_40px_rgba(148,110,255,0.12)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 rounded-[28px] bg-[#f5efff] px-4 py-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="inline-flex h-14 w-32 items-center justify-center rounded-[30px] bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
