import Message from "./Message";
import { useState, useEffect } from "react";
import { IoSend, IoAttach } from "react-icons/io5";

function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const getMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/conversation/${chatId}`
        );

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

  const sendMessage = async () => {
    if (!chatId) return;

    if (input.trim() === "" && !file) return;

    const userMessage = {
      text: file ? `${input}\n📎 ${file.name}` : input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    const formData = new FormData();

    formData.append("chatId", chatId);
    formData.append("message", currentInput);

    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch("http://localhost:5000/home", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            text: data.reply,
            sender: "AI",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: data.error,
            sender: "AI",
          },
        ]);
      }

      setFile(null);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          text: "Something went wrong. Please try again.",
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
        <div className="text-sm uppercase tracking-[0.24em] text-violet-500">
          Chat
        </div>

        <div className="mt-2 text-3xl font-semibold text-slate-950">
          Start your conversation
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[40px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_80px_rgba(148,110,255,0.08)] scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            sender={msg.sender}
          />
        ))}

        {loading && (
          <div className="italic text-slate-500">
            AI is responding...
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[36px] bg-white/90 border border-white/80 p-4 shadow-[0_12px_40px_rgba(148,110,255,0.12)]">

        {file && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-violet-100 px-4 py-2">
            <span className="text-sm">
              📄 {file.name}
            </span>

            <button
              onClick={() => setFile(null)}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-center gap-3 rounded-[28px] bg-[#f5efff] px-4 py-3">

          <input
            type="file"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded-full p-2 transition hover:bg-violet-200"
          >
            <IoAttach size={22} />
          </label>

          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            <IoSend size={22} />
          </button>

        </div>
      </div>
    </div>
  );
}

export default ChatWindow;