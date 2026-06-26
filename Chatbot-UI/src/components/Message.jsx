import React from "react";

function Message({ text, sender }) {
  const isUser = sender === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "bot-row"}`}>
      <div className={`message ${isUser ? "user" : "bot"}`}>
        {text.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}


export default Message;