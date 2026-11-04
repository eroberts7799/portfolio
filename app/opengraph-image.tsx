import { ImageResponse } from "next/og";
import { site } from "./site";

// Link-preview card in the site's palette: name and one-line bio on white.

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 160px",
          background: "#ffffff",
          color: "#171717",
          fontFamily: "Inter, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 9999,
            background: "#f5f5f5",
            border: "1px solid rgba(0,0,0,0.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 600,
            color: "#737373",
            marginBottom: 48,
          }}
        >
          ER
        </div>
        <div style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.2 }}>{site.name}</div>
        <div
          style={{
            marginTop: 20,
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.25,
            color: "#525252",
          }}
        >
          {site.bio}
        </div>
      </div>
    ),
    size,
  );
}
