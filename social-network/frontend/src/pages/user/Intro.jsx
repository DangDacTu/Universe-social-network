import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

export default function Intro() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // 👉 THÊM state để kiểm soát click
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.onended = () => {
      navigate("/", { replace: true });
    };
  }, [navigate]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // 👉 CLICK LẦN 2 → SKIP
    if (hasPlayed) {
      navigate("/", { replace: true });
      return;
    }

    // 👉 CLICK LẦN 1 → PLAY VIDEO
    video.play();
    setHasPlayed(true);
  };

  return (
    <div className="intro-container" onClick={handlePlay}>
      <video
        ref={videoRef}
        src="/Intro-Universe.mp4"
        playsInline
        className="intro-video"
      />
      <div className="intro-hint">
        {hasPlayed ? "Tap to skip" : "Tap to continue"}
      </div>
    </div>
  );
}
