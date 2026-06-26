import React from "react";

function Sidebar({
  createNewChat,
  conversations,
  selectedConversation,
  onSelectConversation,
}) {
  return (
    <div className="sidebar">
      <h1>Welcome to JARVIS</h1>

      <button className="new-chat" onClick={createNewChat}>
        + New Chat
      </button>

      <div className="chatlist">
        {conversations.length === 0 ? (
          <p className="no-chat">No chats yet</p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`chat-item ${
                selectedConversation?._id === conversation._id
                  ? "active"
                  : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              {conversation.title || "New Chat"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;