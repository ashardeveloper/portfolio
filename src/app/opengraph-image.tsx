import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { profile } = await getContent();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "#f2f4fa",
          backgroundColor: "#07080d",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(139,92,246,0.45), transparent 45%), radial-gradient(circle at 10% 95%, rgba(34,211,238,0.3), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#22d3ee" }}>{profile.location}</div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, marginTop: 16, letterSpacing: -3 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 46, marginTop: 8, color: "#c4b5fd" }}>{profile.role}</div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 36, color: "#9aa3b8" }}>
          {`${profile.tagline} — ${profile.focus}`}
        </div>
      </div>
    ),
    size,
  );
}
