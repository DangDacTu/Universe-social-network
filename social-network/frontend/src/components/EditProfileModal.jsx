import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import uploadApi from '../api/uploadApi';
import { FiX, FiCamera } from 'react-icons/fi';
import './EditProfileModal.css';

const EditProfileModal = ({ user, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        gender: user?.gender || 'other',
        profilePicture: user?.profilePicture || '',
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API update profile
            const { data } = await axiosClient.put(`/users/${user._id}`, formData);
            
            if (onUpdateSuccess) {
                onUpdateSuccess(data);
            }
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            // Upload ảnh lên server/cloudinary
            const res = await uploadApi.uploadFile(file);
            setFormData(prev => ({ ...prev, profilePicture: res.data.url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Lỗi tải ảnh: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="edit-modal-overlay" onClick={onClose}>
            <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="edit-modal-header">
                    <h3 className="edit-modal-title">Chỉnh sửa trang cá nhân</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="edit-modal-body">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Avatar Upload */}
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <div className="edit-avatar-wrapper">
                                <img 
                                    src={formData.profilePicture || "https://via.placeholder.com/150"} 
                                    alt="Avatar" 
                                    className="edit-avatar-preview" 
                                />
                                <label htmlFor="avatar-upload" className="edit-avatar-overlay">
                                    {uploading ? <div className="loader-small"></div> : <FiCamera size={24} />}
                                </label>
                                <input 
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    hidden 
                                    onChange={handleImageChange} 
                                />
                            </div>
                            <label htmlFor="avatar-upload" className="edit-avatar-label">Đổi ảnh đại diện</label>
                        </div>

                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">Tên người dùng</label>
                            <input 
                                type="text" 
                                name="username"
                                className="form-input"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên người dùng"
                            />
                        </div>

                        {/* Bio */}
                        <div className="form-group">
                            <label className="form-label">Tiểu sử</label>
                            <textarea 
                                name="bio"
                                className="form-textarea"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Viết gì đó về bạn..."
                            />
                        </div>

                        {/* Gender */}
                        <div className="form-group">
                            <label className="form-label">Giới tính</label>
                            <select 
                                name="gender" 
                                className="form-select"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <button type="submit" className="save-btn" disabled={loading || uploading}>
                            {loading ? "Đang lưu..." : "Xong"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;