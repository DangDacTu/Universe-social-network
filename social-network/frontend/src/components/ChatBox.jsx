import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadApi from "../api/uploadApi"; 
import { getSocket } from "../services/socket"; 
import "./ChatBox.css";
import EmojiPicker from "emoji-picker-react";

// Icons
import { FiImage, FiHeart, FiSmile, FiInfo, FiMic, FiMoreVertical, FiTrash, FiEdit2, FiX } from "react-icons/fi";
import { HiOutlinePhone, HiOutlineVideoCamera } from "react-icons/hi";
import { RiMessengerLine } from "react-icons/ri"; 

/* =========================================================
   COMPONENT CON: MESSAGE ITEM (Đã sửa lỗi thu hồi media)
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

    // Toggle Menu (quan trọng: dùng stopPropagation để ko kích hoạt xem ảnh)
    const toggleMenu = (e) => {
        e.stopPropagation(); 
        setShowMenu(!showMenu);
    }

    const isMedia = ["image", "video", "audio"].includes(msg.mediaType);

    return (
        <div className={`ig-message-row ${isMe ? "me" : "other"}`}>
             {!isMe && <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-small-avatar" alt="avatar" />}
             
             {/* Group chứa nội dung + nút 3 chấm */}
             <div className="ig-message-group">
                 
                 {/* Khối hiển thị nội dung */}
                 <div className={`ig-message-bubble ${isMedia ? "media" : ""} ${isMe ? "me" : "other"}`}>
                    {isEditing ? (
                        <div className="ig-edit-mode">
                            <input 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                                onClick={(e) => e.stopPropagation()} // Chặn click lan ra ngoài
                            />
                            <div className="ig-edit-btns">
                                <span onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}>Lưu</span>
                                <span onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>Hủy</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {msg.mediaType === "text" && <span>{msg.content}</span>}
                            
                            {/* ẢNH: Click vào thì xem full */}
                            {msg.mediaType === "image" && (
                                <img 
                                    src={msg.mediaUrl} 
                                    className="ig-msg-img" 
                                    alt="content" 
                                    onClick={(e) => { e.stopPropagation(); onPreviewImage(msg.mediaUrl); }}
                                />
                            )}
                            
                            {/* VIDEO */}
                            {msg.mediaType === "video" && (
                                <video controls src={msg.mediaUrl} className="ig-msg-video" onClick={(e) => e.stopPropagation()} />
                            )}
                            
                            {/* AUDIO */}
                            {msg.mediaType === "audio" && (
                                <audio controls src={msg.mediaUrl} onClick={(e) => e.stopPropagation()} />
                            )}
                        </>
                    )}
                 </div>

                 {/* NÚT 3 CHẤM (Hiện cho TẤT CẢ loại tin nhắn của mình) */}
                 {isMe && !isEditing && (
                    <div className="ig-more-menu-wrapper" ref={menuRef}>
                        <button className="ig-more-btn" onClick={toggleMenu}>
                            <FiMoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <div className="ig-dropdown-menu">
                                {/* Chỉ hiện nút Sửa nếu là Text */}
                                {msg.mediaType === "text" && (
                                    <div className="ig-menu-item" onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}>
                                        <FiEdit2 /> Sửa
                                    </div>
                                )}
                                {/* Luôn hiện nút Gỡ */}
                                <div className="ig-menu-item delete" onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}>
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
export default function ChatBox({ messages, currentUserId, selectedUser, onSendMessage, isOnline }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [text, setText] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [fullImage, setFullImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, previewUrl, isRecording]);

  // Xử lý khi chọn Emoji
  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  /* LOGIC XÓA TIN NHẮN */
  const handleDeleteMessage = (msgId) => {
      if(window.confirm("Bạn muốn thu hồi tin nhắn này?")) {
          // Gửi sự kiện xóa lên server
          getSocket().emit("delete-message", { messageId: msgId, receiverId: selectedUser._id });
      }
  };

  const handleEditMessage = (msgId, newContent) => {
      getSocket().emit("edit-message", { messageId: msgId, receiverId: selectedUser._id, newContent });
  };

  /* UPLOAD & SEND */
  const handleSelectFile = (e) => {
      const file = e.target.files[0];
      if(file){
          setPreviewFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          const type = file.type.startsWith('video') ? 'video' : 'image';
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

  /* RECORDING */
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
    } catch (err) { alert("Lỗi Micro! Hãy cấp quyền."); }
  };
  
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  if (!selectedUser) {
    return (
      <div className="ig-empty-state">
        <div className="ig-empty-icon-circle"><RiMessengerLine size={50} /></div>
        <h2>Tin nhắn của bạn</h2>
        <p>Gửi tin nhắn để bắt đầu trò chuyện.</p>
      </div>
    );
  }

  return (
    <div className="ig-chatbox">
      {/* HEADER */}
      <div className="ig-chat-header">
        <div className="ig-header-user">
            <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-header-avatar" alt="header avatar"/>
            <div className="ig-header-info">
                <span className="ig-header-name">{selectedUser.username}</span>
                <span className="ig-header-status" style={{ color: isOnline ? "#0095f6" : "#8e8e8e", fontWeight: isOnline ? "600" : "400" }}>
                    {isOnline ? "Online" : "Offline"}
                </span>
            </div>
        </div>
        <div className="ig-header-actions">
            <HiOutlinePhone size={26} />
            <HiOutlineVideoCamera size={26} />
            <FiInfo size={26} />
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div className="ig-messages-list">
        <div className="ig-profile-intro">
            <img src={selectedUser.profilePicture || "/avatar.jpg"} className="ig-intro-avatar" alt="intro"/>
            <h3>{selectedUser.username}</h3>
            <p>{selectedUser.username} • Universe</p>
            <button className="ig-view-profile-btn" onClick={() => navigate(`/profile/${selectedUser._id}`)}>
                Xem trang cá nhân
            </button>
        </div>

        {messages.map((msg) => (
            <MessageItem 
                key={msg._id} msg={msg} isMe={msg.senderId === currentUserId} selectedUser={selectedUser}
                onPreviewImage={setFullImage} onDelete={handleDeleteMessage} onEdit={handleEditMessage}
            />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* PREVIEW UPLOAD */}
      {previewUrl && (
          <div className="ig-preview-area">
              {fileType === 'video' ? <video src={previewUrl} style={{height:100}}/> : <img src={previewUrl} style={{height: 100}} alt="preview"/>}
              <button onClick={()=>{setPreviewUrl(null); setPreviewFile(null)}}><FiX/></button>
          </div>
      )}

      {/* INPUT */}
      <div className="ig-input-area">
        {/* BẢNG EMOJI PICKER */}
        {showEmoji && (
            <div className="emoji-picker-container">
                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
            </div>
        )}

        {isRecording ? (
            <div className="ig-recording-ui">
                <span className="ig-rec-dot">Đang ghi âm...</span>
                <button onClick={stopRecording} className="ig-send-text-btn">Gửi Voice</button>
            </div>
        ) : (
            <div className="ig-input-wrapper">
                <FiSmile 
                    size={24} 
                    className="ig-input-icon left" 
                    onClick={() => setShowEmoji(!showEmoji)} 
                />
                <input 
                    placeholder="Nhắn tin..." className="ig-input-field" value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendTextOrMedia()}
                />
                {text.trim() || previewFile ? (
                     <button className="ig-send-text-btn" onClick={handleSendTextOrMedia}>Gửi</button>
                ) : (
                    <div className="ig-right-icons">
                        <FiMic size={24} onClick={startRecording} />
                        <label><FiImage size={24} /><input type="file" hidden accept="image/*,video/*" onChange={handleSelectFile} /></label>
                        <FiHeart size={24} onClick={() => onSendMessage({ content: "❤️", mediaType: "text" })} />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* FULLSCREEN IMAGE */}
      {fullImage && <div className="image-overlay" onClick={()=>setFullImage(null)}><img src={fullImage} onClick={e=>e.stopPropagation()} alt="full"/></div>}
    </div>
  );
}