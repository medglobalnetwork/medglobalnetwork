import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "14px",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: "26px",
          letterSpacing: "-0.5px",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        <span style={{ color: "#16804d", marginRight: "1px", fontSize: "28px", fontWeight: 900 }}>
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
