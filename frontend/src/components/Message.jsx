import ReactMarkdown from "react-markdown";
function Message({ text, sender }) {
  return (
    <div
      className={`max-w-[70%] rounded-[30px] px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${
        sender === "user"
          ? "ml-auto bg-[#ede9ff] text-slate-950"
          : "mr-auto bg-white text-slate-900"
      }`}
    >
      <div className="mb-2 text-[11px] uppercase tracking-[0.2em] opacity-70">
        {sender === "user" ? "You" : "Jarvis"}
      </div>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export default Message;
