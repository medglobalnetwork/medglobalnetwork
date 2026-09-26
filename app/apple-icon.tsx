import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f4c81 0%, #0c3c66 100%)",
          borderRadius: "38px",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: "68px",
          letterSpacing: "-1.5px",
          border: "4px solid rgba(255,255,255,0.2)",
        }}
      >
        <span style={{ color: "#16804d", marginRight: "3px", fontSize: "78px", fontWeight: 900 }}>
          +
        </span>
        <span style={{ color: "#ffffff", fontWeight: 800 }}>MGN</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
