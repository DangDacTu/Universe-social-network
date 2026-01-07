import { useState } from "react";
import axios from "axios";
import userApi from "../api/userApi";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onUpdateSuccess }) => {
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || "https://via.placeholder.com/150");
    const [isLoading, setIsLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // LOG ĐỂ DEBUG
        console.log("Bắt đầu cập nhật...");

        try {
            let profilePictureUrl = user.profilePicture;

            // 1. Upload ảnh (Nếu có chọn)
            if (imageFile) {
                console.log(" Đang upload ảnh...");
                
                const formData = new FormData();
                formData.append("file", imageFile);
                
                // THÔNG TIN CHÍNH XÁC TỪ ẢNH CỦA BẠN
                const CLOUD_NAME = "dz5hsjleb"; 
                const UPLOAD_PRESET = "universe-social-network"; 
                
                formData.append("upload_preset", UPLOAD_PRESET);

                try {
                    const res = await axios.post(
                        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
                        formData
                    );
                    profilePictureUrl = res.data.secure_url;
                    console.log("Upload thành công:", profilePictureUrl);
                } catch (uploadError) {
                    // IN LỖI CHI TIẾT RA CONSOLE
                    console.error("Lỗi Cloudinary Chi Tiết:", uploadError.response?.data);
                    alert(`Lỗi Upload: ${uploadError.response?.data?.error?.message || "Kiểm tra lại Cloud Name/Preset"}`);
                    setIsLoading(false);
                    return; 
                }
            }

            // 2. Gửi về Backend
            const updatedData = {
                username,
                bio,
                profilePicture: profilePictureUrl,
            };

            await userApi.updateUser(user._id, updatedData);
            
            onUpdateSuccess(updatedData);
            onClose();

        } catch (error) {
            console.error("Lỗi Backend:", error);
            alert("Lỗi khi lưu thông tin xuống Server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Edit Profile</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload-section">
                        <img src={previewImage} alt="Avatar Preview" className="avatar-preview" />
                        <label htmlFor="file-upload" className="custom-file-upload">Change Photo</label>
                        <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="modal-input" required />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="modal-input" rows="3" placeholder="Bio..." />
                    </div>
                    <button type="submit" className="save-btn" disabled={isLoading}>{isLoading ? "Saving..." : "Done"}</button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;