import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import App from "./App";

/**
 * @param {string} _url
 * @param {import('react-dom/server').RenderToPipeableStreamOptions} [options]
 */
export function render(_url, options) {
  return renderToPipeableStream(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    options
  );
}
