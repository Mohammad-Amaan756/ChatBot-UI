
import { useState } from "react";
import Sidebar from './components/Sidebar'
import './App.css'
import ChatWindow from './components/ChatWindow';


function App() {
  const [conversation, setConversation] = useState([]);
  const [setConversation, setConversation] = useState(null);

  const getConversation = async () => {
  try {
    const response = await fetch("http://localhost:5000/conversations");
    const data = await response.json();

    if (data.success) {
      setConversations(data.conversations);

      if (data.conversations.length > 0 && !setSelectedConversationId) {
        setSelectedConversationId(data.conversations[0]._id);
      }
    }
  } catch (error) {
    console.log("Error fetching conversations:", error);
  }
};
  // const [chatId, setChatId] = useState(Date.now());
  
  const createNewChat = async() => {
    const response = await fetch("http:localhost:5000/conversation",{
      method: "post",
      headers: {},
    });
    // Logic to create a new chat
    // setChatId(Date.now());
  };


  return (
   <div className='App'>
    {/* <Sidebar createNewChat={createNewChat}/> */}
    <Sidebar conversation = {conversation} on setSelectedConversation = {setSelectedConversation}
    SelectedConversation=[SelectedConversation/>
    <ChatWindow chatId={chatId}/>
   </div>
  )
}

export default App;
