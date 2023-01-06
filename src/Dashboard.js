import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import { Chat, MessageList, MessageInput,TypingIndicator,ChannelList } from "@pubnub/react-chat-components";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
 
  const currentChannel="chat";
  const theme="light";
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };
 
  const pubnub=new PubNub({ 
    publishKey: "pub-c-8de9466d-463d-4d82-8e03-01bcd90d614d",
    subscribeKey: "sub-c-d3a850e1-83e2-4268-b670-069980288efe",
    uuid:name+user?.uid
  }
  )

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
  }, [user, loading]);
  return (
   <div>
    <div className="dashboard">
       <div className="dashboard__container">
        Logged in as
         <div>{name}</div>
         <div>{user?.email}</div>
         <button className="dashboard__btn" onClick={logout}>
          Logout
         </button>
       </div>

       </div>
     
     <PubNubProvider client={pubnub}>
      {/* PubNubProvider is a part of the PubNub React SDK and allows you to access PubNub instance
        in components down the tree. */}
      <Chat {...{ currentChannel, theme }}>
        {/* Chat is an obligatory state provider. It allows you to configure some common component
          options, like the current channel and the general theme for the app. */}
         
 

        <MessageList fetchMessages={10}>
          <TypingIndicator showAsMessage/>
          </MessageList>
        <MessageInput typingIndicator/>
      </Chat>
    </PubNubProvider>
     </div>
     
  );
}
export default Dashboard;