// import ReactMarkdown from "react-markdown";
// import logo from "../assets/logo.png";

// function Message({ text, sender }) {
//   return (
//     <div
//       className={`max-w-[70%] rounded-[30px] px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${
//         sender === "user"
//           ? "ml-auto bg-[#ede9ff] text-slate-950"
//           : "mr-auto bg-white text-slate-900"
//       }`}
//     >
//       <div className="mb-2 text-[11px] uppercase tracking-[0.2em] opacity-70">
//         {sender === "user" ? "You" : "Jarvis"}
//       </div>
//       <ReactMarkdown>{text}</ReactMarkdown>
//     </div>
//   );
// }

// export default Message;



import ReactMarkdown from "react-markdown";
import logo from "../assets/logo.png";

function Message({ text, sender }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex items-start gap-3 mb-5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Bot Logo */}
      {!isUser && (
        <img
          src={logo}
          alt="Jarvis"
          className="w-10 h-10 rounded-full object-cover border border-violet-500 shadow-md"
        />
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${
          isUser
            ? "bg-[#ede9ff] text-slate-900"
            : "bg-white text-slate-900"
        }`}
      >
        <div className="mb-2 text-[11px] uppercase tracking-[0.2em] opacity-70">
          {isUser ? "You" : "Jarvis"}
        </div>

        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Message;