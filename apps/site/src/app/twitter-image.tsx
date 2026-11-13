import { ImageResponse } from "next/og";
import { Logo } from "@/components/logo";
import { BRAND_NAME } from "@/globals/constants";

export const runtime = "edge";

export const alt = `${BRAND_NAME}`;
export const size = {
  height: 600,
  width: 1200,
};
export const contentType = "image/png";

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#fff",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Logo size={400} />
    </div>,
    {
      ...size,
    }
  );
}
