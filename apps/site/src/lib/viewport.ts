import merge from "lodash.merge";
import type { Viewport } from "next";

export const createViewport = (viewport?: Viewport): Viewport => {
  const defaultViewport: Viewport = {
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#000",
    width: "device-width",
  };

  return merge(defaultViewport, viewport);
};
