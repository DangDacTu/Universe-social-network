import { useEffect, useRef, useState } from "react";
import uploadApi from "../api/uploadApi"; 
import { getSocket } from "../services/socket"; // Import socket để xóa/sửa
import "./ChatBox.css";

// Icons style Instagram + Icons chức năng
import { FiImage, FiHeart, FiSmile, FiInfo, FiMic, FiVideo, FiMoreVertical, FiTrash, FiEdit2, FiX, FiSend } from "react-icons/fi";
import { HiOutlinePhone, HiOutlineVideoCamera } from "react-icons/hi";
import { RiMessengerLine } from "react-icons/ri"; 

/* =========================================================
   COMPONENT CON: MESSAGE ITEM (Đã thêm menu Sửa/Xóa)
   ========================================================= */
const MessageItem = ({ msg, isMe, selectedUser, onPreviewImage, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);
    const menuRef = useRef(null);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSaveEdit = () => {
        if (editText.trim() !== msg.content) onEdit(msg._id, editText);
        setIsEditing(false); setShowMenu(false);
    };

    const isMedia = ["image", "video", "audio"].includes(msg.mediaType);

    return (
        <div className={`ig-message-row ${isMe ? "me" : "other"}`}>
             {!isMe && <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-small-avatar" />}
             
             {/* Group để chứa bong bóng chat và nút 3 chấm */}
             <div className="ig-message-group">
                 <div className={`ig-message-bubble ${isMedia ? "media" : ""} ${isMe ? "me" : "other"}`}>
                    {isEditing ? (
                        <div className="ig-edit-mode">
                            <input 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                            />
                            <div className="ig-edit-btns">
                                <span onClick={handleSaveEdit}>Lưu</span>
                                <span onClick={() => setIsEditing(false)}>Hủy</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {msg.mediaType === "text" && <span>{msg.content}</span>}
                            {msg.mediaType === "image" && <img src={msg.mediaUrl} className="ig-msg-img" onClick={()=>onPreviewImage(msg.mediaUrl)}/>}
                            {msg.mediaType === "video" && <video controls src={msg.mediaUrl} className="ig-msg-video"/>}
                            {msg.mediaType === "audio" && <audio controls src={msg.mediaUrl} />}
                        </>
                    )}
                 </div>

                 {/* MENU MORE (Chỉ hiện cho tin nhắn của mình) */}
                 {isMe && !isEditing && (
                    <div className="ig-more-menu" ref={menuRef}>
                        <button className="ig-more-btn" onClick={() => setShowMenu(!showMenu)}>
                            <FiMoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="ig-dropdown-menu">
                                {msg.mediaType === "text" && (
                                    <div className="ig-menu-item" onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                                        <FiEdit2 /> Sửa
                                    </div>
                                )}
                                <div className="ig-menu-item delete" onClick={() => onDelete(msg._id)}>
                                    <FiTrash /> Gỡ
                                </div>
                            </div>
                        )}
                    </div>
                 )}
             </div>
        </div>
    );
};

/* =========================================================
   COMPONENT CHÍNH: CHAT BOX
   ========================================================= */
export default function ChatBox({ messages, currentUserId, selectedUser, onSendMessage }) {
  const messagesEndRef = useRef(null);
  const [text, setText] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [fullImage, setFullImage] = useState(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, previewUrl, isRecording]);

  /* --- LOGIC XÓA / SỬA --- */
  const handleDeleteMessage = (msgId) => {
      if(window.confirm("Gỡ tin nhắn này?")) {
          getSocket().emit("delete-message", { messageId: msgId, receiverId: selectedUser._id });
      }
  };
  const handleEditMessage = (msgId, newContent) => {
      getSocket().emit("edit-message", { messageId: msgId, receiverId: selectedUser._id, newContent });
  };

  /* --- LOGIC UPLOAD & GỬI --- */
  const handleSelectFile = (e, type) => {
      const file = e.target.files[0];
      if(file){
          setPreviewFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setFileType(type);
      }
      e.target.value = "";
  }

  const uploadAndSend = async (file, type) => {
    try {
      const res = await uploadApi.uploadFile(file);
      onSendMessage({ content: "", mediaUrl: res.data.url, mediaType: type });
    } catch (err) { alert("Lỗi gửi file!"); }
  };

  const handleSendTextOrMedia = async () => {
       if(text.trim()) { onSendMessage({content: text, mediaType: 'text'}); setText(""); }
       if(previewFile) { 
           await uploadAndSend(previewFile, fileType); 
           setPreviewFile(null); setPreviewUrl(null); 
       }
  }

  /* --- LOGIC GHI ÂM --- */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioFile = new File([new Blob(audioChunksRef.current, { type: "audio/webm" })], "voice.webm", { type: "audio/webm" });
        await uploadAndSend(audioFile, "audio");
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(); setIsRecording(true);
    } catch (err) { alert("Lỗi Micro!"); }
  };
  
  const stopRecording = () => { 
      mediaRecorderRef.current?.stop(); 
      setIsRecording(false); 
  };


  // --- UI EMPTY STATE ---
  if (!selectedUser) {
    return (
      <div className="ig-empty-state">
        <div className="ig-empty-icon-circle"><RiMessengerLine size={50} /></div>
        <h2>Your messages</h2>
        <p>Send a message to start a chat.</p>
        <button className="ig-send-msg-btn">Send message</button>
      </div>
    );
  }

  // --- UI MAIN CHAT ---
  return (
    <div className="ig-chatbox">
      {/* HEADER */}
      <div className="ig-chat-header">
        <div className="ig-header-user">
            <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-header-avatar" />
            <div className="ig-header-info">
                <span className="ig-header-name">{selectedUser.username}</span>
                <span className="ig-header-status">Active now</span>
            </div>
        </div>
        <div className="ig-header-actions">
            <HiOutlinePhone size={26} />
            <HiOutlineVideoCamera size={26} />
            <FiInfo size={26} />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="ig-messages-list">
        <div className="ig-profile-intro">
            <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-intro-avatar" />
            <h3>{selectedUser.username}</h3>
            <p>{selectedUser.username} • Universe</p>
            <button className="ig-view-profile-btn">View profile</button>
        </div>

        {messages.map((msg) => (
            <MessageItem 
                key={msg._id} msg={msg} isMe={msg.senderId === currentUserId} selectedUser={selectedUser}
                onPreviewImage={setFullImage} onDelete={handleDeleteMessage} onEdit={handleEditMessage}
            />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* PREVIEW */}
      {previewUrl && (
          <div className="ig-preview-area">
              {fileType === 'video' ? <video src={previewUrl} style={{height:100}}/> : <img src={previewUrl} style={{height: 100}} />}
              <button onClick={()=>{setPreviewUrl(null); setPreviewFile(null)}}><FiX/></button>
          </div>
      )}

      {/* INPUT AREA */}
      <div className="ig-input-area">
        {isRecording ? (
            // Giao diện khi đang ghi âm
            <div className="ig-recording-ui">
                <span className="ig-rec-dot">Recording...</span>
                <button onClick={stopRecording} className="ig-send-text-btn">Send Voice</button>
            </div>
        ) : (
            // Giao diện nhập liệu bình thường (Pill shape)
            <div className="ig-input-wrapper">
                <FiSmile size={24} className="ig-input-icon left" />
                
                <input 
                    placeholder="Message..." 
                    className="ig-input-field"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendTextOrMedia()}
                />

                {/* Logic hiển thị nút bấm */}
                {text.trim() || previewFile ? (
                     <button className="ig-send-text-btn" onClick={handleSendTextOrMedia}>Send</button>
                ) : (
                    <div className="ig-right-icons">
                        {/* Nút Mic */}
                        <FiMic size={24} onClick={startRecording} />

                        {/* Nút Ảnh */}
                        <label><FiImage size={24} /><input type="file" hidden accept="image/*" onChange={e => handleSelectFile(e, 'image')} /></label>
                        
                        {/* Nút Video (Mới thêm) */}
                        <label><FiVideo size={24} /><input type="file" hidden accept="video/*" onChange={e => handleSelectFile(e, 'video')} /></label>
                        
                        <FiHeart size={24} />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Fullscreen Image View */}
      {fullImage && <div className="image-overlay" onClick={()=>setFullImage(null)}><img src={fullImage} onClick={e=>e.stopPropagation()}/></div>}
    </div>
  );
}