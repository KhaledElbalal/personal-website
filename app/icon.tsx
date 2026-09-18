import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#121420",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: 20,
            color: "#f7f7ff",
          }}
        >
          <span style={{ color: "#38b6ff" }}>[</span>
          <span style={{ display: "flex" }}>K</span>
          <span style={{ color: "#38b6ff" }}>]</span>
        </div>
      </div>
    ),
    size,
  );
}
