import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Smile, Reply, Copy, Trash2, Edit } from 'lucide-react'
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import raccoon1Img from "../assets/raccoon1.png";
import raccoon2Img from "../assets/raccoon2.png";
import raccoon3Img from "../assets/raccoon3.png";
import raccoon4Img from "../assets/raccoon4.png";
import raccoon5Img from "../assets/raccoon5.png";
import raccoon6Img from "../assets/raccoon6.png";
import raccoon7Img from "../assets/raccoon7.png";
import raccoon8Img from "../assets/raccoon8.png";
import raccoon9Img from "../assets/raccoon9.png";
import raccoon10Img from "../assets/raccoon10.png";
import raccoonForAdminImg1 from "../assets/raccoonForAdmin1.png";
import raccoonForAdminImg2 from "../assets/raccoonForAdmin2.png";
import raccoonForAdminImg3 from "../assets/raccoonForAdmin3.png";

export default function ChatMessage() {
  const { uid } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const [highlightedMessage, setHighlightedMessage] = useState(null);

  const [userProfiles, setUserProfiles] = useState({});

  const [openTextModal, setOpenTextModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [replyTo, setReplyTo] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const [edit, setEdit] = useState(null);

  const displayName = user?.username || "User";

  const raccoonAvatars = [
    raccoon1Img,
    raccoon2Img,
    raccoon3Img,
    raccoon4Img,
    raccoon5Img,
    raccoon6Img,
    raccoon7Img,
    raccoon8Img,
    raccoon9Img,
    raccoon10Img,
    raccoonForAdminImg1,
    raccoonForAdminImg2,
    raccoonForAdminImg3,
  ];

  const emojis = [
    // Faces
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳",

    // Reactions
    "😭", "😢", "😥", "😰", "😅", "😱", "😨", "😡",
    "🤬", "😤", "😮", "😯", "😲", "😳", "🥺", "😶",
    "🙄", "😏", "😴", "🤤", "🤯", "😵", "🤢", "🤮",

    // Hands
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙",
    "👋", "👏", "🙌", "🫶", "🙏", "💪", "☝️", "👇",
    "👈", "👉", "👆", "✋", "🤚", "🖐️", "🤝", "🫡",

    // Hearts
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "🤎", "💔", "❤️‍🔥", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟",

    // Fun
    "🔥", "✨", "⭐", "🌟", "💫", "💥", "💯", "🎉",
    "🎊", "🎂", "🎁", "🏆", "👑", "💎", "🚀", "⚡",
    "☀️", "🌙", "🌈", "☁️",

    // Animals
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈",
    "🙉", "🙊", "🐔", "🐧", "🦆", "🦅", "🦉", "🦄",
    "🦋", "🐝", "🐌", "🐢", "🐍", "🐙", "🦀", "🐠",

    // Food
    "🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🍒", "🥭",
    "🍍", "🥥", "🍕", "🍔", "🍟", "🌭", "🍿", "🍩",
    "🍪", "🎂", "🍰", "🍫", "🍭", "☕", "🧋", "🍺",

    // Objects
    "💻", "📱", "⌨️", "🖱️", "🎮", "🎧", "📷", "📸",
    "💡", "📚", "✏️", "🔑", "🔒", "🔓", "💰", "💵",
    "🎵", "🎶", "📌", "❤️‍🩹",

    // Raccoon Chat vibes 😎
    "🦝", "👀", "💀", "😭", "😂", "🤡", "👻", "👽",
    "😈", "👿", "🤖", "🙃", "🗿", "🍿", "🔥", "💀"
  ];
  
  const list = [
    {label: 'Reply', icon: Reply},
    {label: 'Edit', icon: Edit},
    {label: 'Copy', icon: Copy},
    {label: 'Delete', icon: Trash2},
  ];



  const [showEmojis, setShowEmojis] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  
  // Fetch profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        console.log("==================================");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (uid) {
      fetchUser();
    }
  }, [uid]);
  
  // Send Message
  const handleSend = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("You must be logged in.");
        return;
      }

      const text = message.trim();

      if (!text) {
        return;
      }

      if (edit) {
        console.log("EDITING:", edit.id);
        console.log("NEW TEXT:", text);

        await updateDoc(doc(db, "messages", edit.id), {
          text: text,
          originalText: edit.originalText || edit.text,
          editedAt: serverTimestamp(),
        });

        const check = await getDoc(doc(db, "messages", edit.id));

        console.log("FIRESTORE AFTER UPDATE:", check.data());

        setMessage("");
        setEdit(null);
        setOpenTextModal(false);

        return;
      }      

      // NORMAL MESSAGE 
      const messageData = {
        senderId: currentUser.uid,
        receiverId: uid,
        text: text,
        createdAt: serverTimestamp(),

        ...(replyTo && {
          replyTo: {
            messageId: replyTo.id,
            senderId: replyTo.senderId,
            text: replyTo.text,
          }
        })
      };

      console.log("=================================");
      console.log("Current user:", currentUser.uid);
      console.log("Receiver:", uid);
      console.log("Message:", messageData);

      await addDoc(collection(db, "messages"), messageData);

      console.log("Message sent successfully!");

      setMessage("");
      setReplyTo(null);

    } catch (err) {
      console.log("Cannot send message:", err);
    }
  };  

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser || !uid) {
      return;
    }

    const messagesRef = collection(db, "messages");

    const sentQuery = query(
      messagesRef,
      where("senderId", "==", currentUser.uid),
      where("receiverId", "==", uid),
      orderBy("createdAt", "asc")
    );

    const receivedQuery = query(
      messagesRef,
      where("senderId", "==", uid),
      where("receiverId", "==", currentUser.uid),
      orderBy("createdAt", "asc")
    );

    let sentMessages = [];
    let receivedMessages = [];

    const updateMessages = () => {
      const combinedMessages = [
        ...sentMessages,
        ...receivedMessages,
      ].sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;

        return timeA - timeB;
      });

      setMessages(combinedMessages);
    };

    const unsubscribeSent = onSnapshot(
      sentQuery,
      (snapshot) => {
        sentMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        updateMessages();
      },
      (error) => {
        console.error("Error fetching sent messages:", error);
      }
    );

    const unsubscribeReceived = onSnapshot(
      receivedQuery,
      (snapshot) => {
        receivedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        updateMessages();
      },
      (error) => {
        console.error("Error fetching received messages:", error);
      }
    );

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [uid]);  

  useEffect(() => {
    const fetchSenderProfiles = async () => {
      const senderIds = [...new Set(messages.map((msg) => msg.senderId))];

      const profiles = {};

      for (const senderId of senderIds) {
        const userRef = doc(db, "users", senderId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          profiles[senderId] = userSnap.data();
        }
      }

      setUserProfiles(profiles);
    };

    if (messages.length > 0) {
      fetchSenderProfiles();
    }
  }, [messages]);

  const handleReply = (msg) => {
    setReplyTo(msg);
    setOpenTextModal(false);
  };

  const handleEdit = (msg) => {
    if (msg.deleted) {
      return;
    }

    if (msg.senderId !== auth.currentUser?.uid) {
      return;
    }

    setEdit(msg);
    setMessage(msg.text);
    setOpenTextModal(false);
  };  

  const handleCopy = async (msg) => {
    try {
      await navigator.clipboard.writeText(msg.text);

      setCopiedMessage(msg.id);
      setOpenTextModal(false);

      setTimeout(() => {
        setCopiedMessage(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleDelete = async (msg) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("You must be logged in.");
        return;
      }

      if (msg.senderId !== currentUser.uid) {
        console.log("You can only delete your own messages.");
        return;
      }

      await updateDoc(doc(db, 'messages', msg.id), {
        deleted: true,
        deletedAt: serverTimestamp(),
        text: "",
      });

      console.log("Message deleted:", msg.id);

      setOpenTextModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Cannot delete message:", error);
    }
  };


  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-slate-400">
        Loading Chat...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-slate-400">
        User not found.
      </div>
    );
  }

  return (
    <div
      className="
        w-full min-h-full pt-10 pb-20 border-l border-slate-900 overflow-y-auto thin-scrollbar
        px-4 bg-black text-white font-semibold overflow-hidden"
    >
      <header
        className="
          w-[220px] p-1 lg:hidden
          fixed top-2 z-10 left-15
          border border-slate-900 rounded-2xl 
          bg-gray-700/50"
      >
        <div className="flex items-center gap-4 cursor-pointer relative">
          {user.avatar !== null && user.avatar !== undefined ? (
            <img
              src={raccoonAvatars[user.avatar]}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="font-semibold">{displayName}</h2>
          </div>
        </div>
      </header>

      <main
        className="
          w-full h-auto
        "
      >
        {messages.map((msg, index) => {
          const sender = userProfiles[msg.senderId]; // Me
          const chater = msg.senderId === uid; // The other person

          return (
            <div
              key={msg.id}
              ref={(el) => {
                messageRefs.current[msg.id] = el;
                
              }}
              className={`flex gap-2 my-2 items-start 
                ${chater ? "justify-start" : "justify-end"}
              `}
            >
              {/* OTHER PERSON — LEFT */}
              {chater && (
                <>
                  {sender?.avatar !== null && sender?.avatar !== undefined ? (
                    <img
                      src={raccoonAvatars[sender.avatar]}
                      alt="Profile"
                      className="w-10 h-10 shrink-0 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white">
                      {sender?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </>
              )}

              {/* MESSAGE BUBBLE */}
              <div
                type="button"
                onClick={() => {
                  setSelectedMessage(msg);
                  setOpenTextModal(true);
                }}
                className={` 
                  max-w-[70%]
                  min-w-0 
                  break-words relative
                  whitespace-pre-wrap
                  p-2 cursor-pointer
                  border text-start
                  border-slate-500
                  rounded-2xl
                  ${chater ? "bg-blue-300/50" : "bg-green-300/50"}
                  ${openTextModal && selectedMessage?.id === msg.id
                    ? chater ? "bg-blue-900" : 'bg-green-900'
                    : chater
                      ? "bg-blue-300/50"
                      : "bg-green-300/50"
                  }
                  ${highlightedMessage === msg.id 
                    ? "ring-2 ring-purple-400 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    : ""
                  }
                `}
              >
                {openTextModal && selectedMessage?.id === msg.id && (
                  <div
                    className={`
                      absolute
                      ${index < 4 ? 'top-full' : 'bottom-full'}
                      ${chater ? "right-0" : "left-0"}
                      my-2
                      w-[120px]
                      p-2
                      grid
                      gap-1
                      z-[2]
                      border border-slate-700
                      rounded-xl
                      bg-gray-900
                      shadow-2xl
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {list.map((item, index) => {
                      if (
                        item.label === "Edit" &&
                          (
                            msg.senderId !== auth.currentUser?.uid || 
                            msg.deleted
                          )
                      ) {
                        return null;
                      }

                      if ( item.label === 'Delete' && 
                        (
                          msg.senderId !== auth.currentUser?.uid
                        )
                      ) { 
                        return null;
                      }

                      const Icon = item.icon;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (item.label === "Reply") handleReply(msg);
                            if (item.label === "Edit") handleEdit(msg);
                            if (item.label === "Copy") handleCopy(msg);
                            if (item.label === "Delete") handleDelete(msg);
                          }}
                          className="
                            flex items-center gap-2
                            w-full px-3 py-1
                            rounded-lg
                            text-gray-300
                            hover:bg-slate-700
                            hover:text-white
                            cursor-pointer
                          "
                        >
                          <Icon size={16} />
                          {item.label}
                        </button>
                      );
                    })}                    
                  </div>
                )}

                {msg.replyTo && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    
                      const originalMessage =
                        messageRefs.current[msg.replyTo.messageId];

                      if (originalMessage) {
                        originalMessage.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }

                      setHighlightedMessage(msg.replyTo.messageId);

                      setTimeout(() => {
                        setHighlightedMessage(null);
                      }, 1500);

                    }}
                    className="
                      mb-2
                      px-3
                      py-2
                      rounded-lg
                      border-l-4
                      border-purple-500
                      bg-black/30
                      text-sm
                      cursor-pointer
                      hover:bg-black/50
                      transition
                    "
                  >
                    <p className="text-purple-400 font-semibold">
                      {userProfiles[msg.replyTo.senderId]?.username || "User"}
                    </p>

                    <p className="text-slate-400 truncate">
                      {msg.replyTo.text}
                    </p>
                  </div>
                )}

                {msg.originalText && (
                  <div
                    className="
                      mb-2
                      px-3
                      py-2
                      rounded-lg
                      border-l-4
                      border-slate-500
                      bg-black/20
                      text-sm
                    "
                  >
                    <p className="text-xs text-slate-500 mb-1">
                      Original message
                    </p>

                    <p className="text-slate-400 line-through">
                      {msg.originalText}
                    </p>
                  </div>
                )}

                <div>
                  {msg.deleted ? (
                    <span className="italic text-slate-400 flex">
                      <Trash2 /> This message was deleted
                    </span>
                  ) : (
                    <>
                      {msg.text}

                      {msg.originalText && (
                        <span className="ml-2 text-xs text-slate-400 italic">
                          (edited)
                        </span>
                      )}
                    </>
                  )}
                </div>                

              </div>

              {/* YOU — RIGHT */}
              {!chater && (
                <>
                  {sender?.avatar !== null && sender?.avatar !== undefined ? (
                    <img
                      src={raccoonAvatars[sender.avatar]}
                      alt="Profile"
                      className="w-10 h-10 shrink-0 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white">
                      {sender?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />

        {/* Send Message */}
        <div
          className="
            fixed bottom-4
            lg:w-[50%] z-[3]
            w-[calc(100%-6rem)]
          "
        >
          {edit && (
            <div
              className="
                absolute
                bottom-full
                left-0
                right-0
                mb-2
                px-4
                py-2
                rounded-xl
                border border-purple-500/40
                bg-slate-900
                text-sm
              "
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-purple-400 font-semibold">
                    Editing message
                  </p>

                  <p className="truncate text-slate-400">
                    {edit.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEdit(null);
                    setMessage("");
                  }}
                  className="
                    ml-3
                    px-2
                    text-slate-400
                    hover:text-white
                    cursor-pointer
                  "
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {replyTo && (
            <div className="
              absolute
              bottom-full
              left-0
              right-0
              mb-2
              px-4
              py-2
              rounded-xl
              border border-slate-700
              bg-slate-900
              text-sm
            ">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-purple-400 font-semibold">
                    Replying to message
                  </p>

                  <p className="truncate text-slate-400">
                    {replyTo.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="
                    ml-3
                    px-2
                    text-slate-400
                    hover:text-white
                    cursor-pointer
                  "
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div
            className="
              relative
              flex items-end  
              rounded-2xl left-10
              border border-slate-800
              bg-slate-900/80
              backdrop-blur-xl
              shadow-[0_8px_30px_rgba(0,0,0,0.45)]
              transition-all duration-200
              
              focus-within:border-purple-500/70
              focus-within:ring-2
              focus-within:ring-purple-500/20
            "
          >

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="text-2xl relative bottom-3 left-2"
              >
                <Smile />
              </button>

            {showEmojis && (
              <div
                className="
                  absolute bottom-12 left-0
                  bg-black
                  border border-slate-700
                  rounded-xl
                  p-2
                  w-64
                  max-h-60
                  overflow-y-auto
                  shadow-xl
                  z-50 thin-scrollbar
                "
              >
                <div className="grid grid-cols-6 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setMessage((prev) => prev + emoji);
                      }}
                      className="
                        text-xl
                        hover:bg-slate-700
                        rounded-lg
                        p-1 
                        transition
                      "
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            </div>
            
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);

                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              placeholder={`Message ${displayName}...`}
              rows={1}
              className="
                w-full
                min-h-15
                max-h-50
                resize-none
                overflow-y-auto

                bg-transparent
                px-5 py-5

                text-sm text-white
                placeholder:text-slate-500

                outline-none thin-scrollbar
              "
            />

            <button
              disabled={!message.trim()}
              onClick={() => {
                handleSend();
              }}
              className="
                absolute
                right-2
                bottom-2
                
                flex h-10 w-10
                items-center justify-center
                
                rounded-xl
                
                bg-gradient-to-r
                from-purple-500
                to-pink-500
                
                text-white
                
                transition-all duration-200
                
                hover:scale-105
                hover:shadow-lg
                hover:shadow-purple-500/20
                
                disabled:cursor-not-allowed
                disabled:opacity-30
                disabled:hover:scale-100
              "
            >
              ➤
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}