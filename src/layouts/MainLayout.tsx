import { ReactNode } from "react";
import { BottomNav, ProfileSidebar } from "../components";

interface MainLayoutProps {
  children: ReactNode;
}

const picolHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  background: "#1a1a2e",
  color: "#fff",
  fontSize: "14px",
  position: "sticky",
  top: 0,
  zIndex: 1200,
};

const picolFooterStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "12px",
  color: "#888",
  padding: "12px 16px 80px",
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <div style={picolHeaderStyle}>
        <span style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>TodoApp</span>
        <a
          href="https://picolab.kr"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            background: "rgba(255,255,255,0.12)",
            padding: "4px 12px",
            borderRadius: "20px",
          }}
        >
          🧪 피코랩
        </a>
      </div>
      <ProfileSidebar />
      {children}
      <div style={{ marginTop: "128px" }} />
      <div style={picolFooterStyle}>
        원작자: <a href="https://github.com/maciekt07" target="_blank" rel="noreferrer" style={{ color: "#888" }}>maciekt07</a> | MIT License &nbsp;|&nbsp;
        한국어 버전: <a href="https://picolab.kr" target="_blank" rel="noreferrer" style={{ color: "#888" }}>피코랩 (picolab.kr)</a>
      </div>
      <BottomNav />
    </>
  );
};

export default MainLayout;
