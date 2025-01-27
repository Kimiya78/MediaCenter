"use client";  // Mark this file as a client-side component

import React, { useState, useEffect } from "react";

export function DirectionToggle() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    // Ensure code only runs in the browser
    if (typeof document !== "undefined") {
      setDir(document.documentElement.dir || "ltr");
    }
  }, []); // Runs once after the component mounts

  const toggleDirection = React.useCallback(() => {
    const newDir = dir === "ltr" ? "rtl" : "ltr";
    setDir(newDir);
    // Update the document's direction when toggled
    if (typeof document !== "undefined") {
      document.documentElement.dir = newDir;
    }
  }, [dir]);

  return (
    <button onClick={toggleDirection}>
      Switch to {dir === "ltr" ? "Right-to-Left" : "Left-to-Right"}
    </button>
  );
}
