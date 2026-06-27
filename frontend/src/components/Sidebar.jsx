import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function Sidebar({
  createNewChat,
  conversations,
  setChatId,
  setConversations,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const renameChat = async (id, newTitle) => {
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/chat/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConversations((prev) =>
          prev.map((chat) => (chat._id === id ? data.conversation : chat)),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/chat/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setConversations((prev) => prev.filter((chat) => chat._id !== id));

        setChatId(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-72 bg-white/80 border border-white/80 backdrop-blur-xl p-6 rounded-[36px] shadow-[0_20px_80px_rgba(131,90,255,0.12)] flex flex-col">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">
          Welcome to
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">Jarvis</div>
      </div>

      <button
        className="w-full rounded-[28px] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 mb-5"
        onClick={createNewChat}
      >
        + New Chat
      </button>

      <div className="space-y-3 overflow-y-auto pr-1">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => setChatId(conversation._id)}
            className="flex justify-between items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-3 hover:bg-slate-800 cursor-pointer group transition"
          >
            {editingId === conversation._id ? (
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameChat(conversation._id, editingTitle);
                    setEditingId(null);
                  }
                }}
                onBlur={() => {
                  renameChat(conversation._id, editingTitle);
                  setEditingId(null);
                }}
                autoFocus
                className="bg-transparent border border-gray-500 rounded px-2 py-1 flex-1 outline-none"
              />
            ) : (
              <span
                onClick={() => setChatId(conversation._id)}
                className="cursor-pointer flex-1"
              >
                {conversation.title}
              </span>
            )}

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(conversation._id);
                  setEditingTitle(conversation.title);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiEdit2 size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(conversation._id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
