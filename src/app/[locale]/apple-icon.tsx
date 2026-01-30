import { ImageResponse } from "next/og";
import { Logo } from "@/components/logo";
import { BRAND_SHORT_NAME } from "@/globals/constants";

export const runtime = "edge";

export const alt = BRAND_SHORT_NAME;
export const size = {
  width: 180,
  height: 180,
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
        borderRadius: "40px",
      }}
    >
      <Logo size={140} showBackground={false} />
    </div>,
    {
      ...size,
    },
  );
}
