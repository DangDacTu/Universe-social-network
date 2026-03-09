import React from 'react';
import { FiGithub, FiGlobe, FiMail, FiInfo } from 'react-icons/fi';

export default function AboutSettings() {
    return (
        <div className="settings-form-container">
            <div className="cp-header">
                <div className="cp-avatar-wrapper" style={{ background: '#e3f2fd' }}>
                    <FiInfo size={28} color="#0095f6" style={{ margin: '14px' }} />
                </div>
                <div className="cp-header-info">
                    <h3 className="cp-username">Giới thiệu</h3>
                    <p className="cp-subtitle">Thông tin về Universe</p>
                </div>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
                <img 
                    src="/logo-universe.png" 
                    alt="Universe Logo" 
                    style={{ width: '100px', height: '100px', marginBottom: '16px', borderRadius: '20px', objectFit: 'cover' }} 
                    onError={(e) => e.target.style.display = 'none'}
                />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' , color: '#000000'}}>Universe</h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>Phiên bản 1.0.0</p>

                <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000000' }}>Về ứng dụng</h4>
                    <p style={{ color: '#444', lineHeight: '1.6', marginBottom: '24px', fontSize: '14px' }}>
                        Universe là mạng xã hội kết nối mọi người trong vũ trụ của riêng bạn. 
                        Chia sẻ khoảnh khắc, kết nối bạn bè và khám phá những điều mới mẻ mỗi ngày.
                    </p>

                    <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000000' }}>Liên hệ</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0095f6', textDecoration: 'none', fontSize: '14px' }}>
                            <FiMail /> Gửi email hỗ trợ
                        </a>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0095f6', textDecoration: 'none', fontSize: '14px' }}>
                            <FiGlobe /> Website chính thức
                        </a>
                    </div>
                </div>

                <div style={{ marginTop: '30px', color: '#888', fontSize: '12px' }}>
                    <p>&copy; {new Date().getFullYear()} Universe Social Network.</p>
                </div>
            </div>
        </div>
    );
}