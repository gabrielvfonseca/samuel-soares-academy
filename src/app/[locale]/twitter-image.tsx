import { ImageResponse } from "next/og";
import { Logo } from "@/components/logo";
import { BRAND_NAME } from "@/globals/constants";

export const runtime = "edge";

export const alt = `${BRAND_NAME}`;
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Logo size={400} />
    </div>,
    {
      ...size,
    }
  );
}
