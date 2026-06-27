import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { useState, useEffect } from "react";

function App() {
  const [chatId, setChatId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const createNewChat = async () => {
    try {
      const response = await fetch("http://localhost:5000/conversation", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setChatId(data.conversation._id);
        // await getConversations();
        setConversations((previous) => [data.conversation, ...previous]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  const getConversations = async () => {
    const res = await fetch("http://localhost:5000/conversation");
    const data = await res.json();

    try {
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0) {
          setChatId(data.conversations[0]._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getConversations();
  // }, []);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-[#f5efff] via-[#efe1ff] to-[#f9f4ff] text-slate-900">
      <div className="pointer-events-none absolute -left-20 top-16 h-80 w-80 rounded-full bg-[#c5b0ff]/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-64 w-64 rounded-full bg-[#e5d2ff]/50 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-72 h-40 w-40 -translate-x-1/2 rounded-full bg-[#f2e3ff]/60 blur-2xl" />

      <Sidebar
        conversations={conversations}
        createNewChat={createNewChat}
        setChatId={setChatId}
        setConversations={setConversations}
      />
      <ChatWindow chatId={chatId} />
    </div>
  );
}

export default App;
