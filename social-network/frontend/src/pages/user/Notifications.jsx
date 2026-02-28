import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiMessageCircle, FiUser } from "react-icons/fi";
import notificationApi from "../../api/notificationApi";
import "./Notifications.css";

function formatTimeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}p`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}g`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}n`;
  return d.toLocaleDateString("vi-VN");
}

function Notifications() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    notificationApi
      .getList()
      .then((res) => {
        if (!cancelled) setList(res.data?.list || []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    notificationApi.markAsRead().catch(() => {});
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <FiHeart className="notif-icon like" size={14} />;
      case "comment":
        return <FiMessageCircle className="notif-icon comment" size={14} />;
      case "follow":
        return <FiUser className="notif-icon follow" size={14} />;
      default:
        return null;
    }
  };

  const getMessage = (n) => {
    const name = n.from?.username || "Ai đó";
    switch (n.type) {
      case "like":
        return (
          <>
            <strong>{name}</strong> thích bài viết của bạn
          </>
        );
      case "comment":
        return (
          <>
            <strong>{name}</strong> đã bình luận về bài viết của bạn
          </>
        );
      case "follow":
        return (
          <>
            <strong>{name}</strong> đã bắt đầu theo dõi bạn
          </>
        );
      default:
        return name;
    }
  };

  const getLinkTo = (n) => {
    if (n.type === "follow") return `/profile/${n.from?._id}`;
    return "/";
  };

  const postThumbnail = (n) => {
    if (n.type === "follow" || !n.post) return null;
    const media = n.post?.media?.[0];
    if (!media || media.type !== "image") return <div className="notif-post-thumb placeholder" />;
    return (
      <div className="notif-post-thumb" style={{ backgroundImage: `url(${media.url})` }} />
    );
  };

  return (
    <div className="notif-wrapper-center">
      <div className="notif-container">
        <div className="notif-header">
          <div className="notif-nav">
            <button type="button" className="notif-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft size={24} />
            </button>
            <h2 className="notif-title">Thông báo</h2>
          </div>
        </div>

        <div className="notif-scroll">
          {loading && (
            <div className="notif-status">
              <div className="spinner" />
              <p>Đang tải...</p>
            </div>
          )}

          {!loading && list.length === 0 && (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <FiHeart size={40} />
              </div>
              <h3>Chưa có thông báo</h3>
              <p>Khi có người thích, bình luận hay theo dõi bạn, thông báo sẽ hiện ở đây.</p>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div className="notif-list">
              {list.map((n) => (
                <Link
                  key={n._id}
                  to={getLinkTo(n)}
                  className={`notif-item ${n.read ? "" : "unread"}`}
                >
                  <div className="notif-avatar-wrap">
                    <img
                      src={n.from?.profilePicture || "/avatar.jpg"}
                      alt=""
                      className="notif-avatar"
                    />
                    <span className="notif-type-badge">{getIcon(n.type)}</span>
                  </div>
                  <div className="notif-body">
                    <p className="notif-message">{getMessage(n)}</p>
                    <span className="notif-time">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  {postThumbnail(n)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;