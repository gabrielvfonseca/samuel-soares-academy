import { ImageResponse } from "next/og";
import { BRAND_SHORT_NAME } from "@/globals/constants";
import { Logo } from "@/components/logo";

export const runtime = "edge";

export const alt = BRAND_SHORT_NAME;
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        borderRadius: "20%",
      }}
    >
      <Logo size={24} showBackground={false} />
    </div>,
    {
      ...size,
    },
  );
}
