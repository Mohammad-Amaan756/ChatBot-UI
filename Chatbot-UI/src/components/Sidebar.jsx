function Sidebar( {createNewChat }) {
    return(
        <div className="sidebar">
            <h1>Welcome to </h1>
            <button className="new-chat" onClick={createNewChat}>
                + New chat
            </button>
            {/* <div className="sidebar">JARVIS</div>
            <div className="sidebar">Pinned Chats</div>
            <div className="sidebar">Important</div>
            <div className="sidebar">Chats History</div> */}

            {/* <div className="chatlist">
                <div className="chat-item">JARVIS</div>
                <div className="chat-item">Pinned Chats</div>
                <div className="chat-item">Important</div>
                <div className="chat-item">Chats History</div>
            </div> */}

            <div className="chatlist">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            className={`chat-item ${
              selectedConversation &&
              selectedConversation._id === conversation._id
                ? "active"
                : ""
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            {conversation.title}
          </div>
          ))}
          </div>
        </div>
    )
}

export default Sidebar;