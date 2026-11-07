import Image from "next/image";
import type { JSX } from "react";

interface LogoProps {
  size?: number | string;
}

export function Logo({ size = 400 }: LogoProps): JSX.Element {
  return (
    <Image
      alt="Logo"
      height={Number(size)}
      src="/images/logo.svg"
      width={Number(size)}
    />
  );
}
