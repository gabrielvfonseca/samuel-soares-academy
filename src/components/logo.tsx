import Image from "next/image";
import type { JSX } from "react";

interface LogoProps {
  size?: number | string;
}

export function Logo({ size = 400 }: LogoProps): JSX.Element {
  return <Image src="/images/logo.svg" alt="Logo" width={Number(size)} height={Number(size)} />;
}
