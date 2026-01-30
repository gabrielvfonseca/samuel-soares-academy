import merge from "lodash.merge";
import type { Viewport } from "next";

export const createViewport = (viewport?: Viewport): Viewport => {
  const defaultViewport: Viewport = {
    themeColor: "#000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };

  return merge(defaultViewport, viewport);
};
