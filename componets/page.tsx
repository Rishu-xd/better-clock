
"use client";

import { useEffect, useRef, useState } from "react";

type TextMorphProps = {
  words: string;
  color?: string;
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
    lineHeight?: number;
  };
  transition?: {
    duration?: number;
    ease?: string;
  };
};

export default function TextMorph({
  words,
  color = "#fff",
  font = {},
  transition = {},
}: TextMorphProps) {
  const [current, setCurrent] = useState(words);
  const [previous, setPrevious] = useState(words);

  const previousRef = useRef(words);

  useEffect(() => {
    if (words === previousRef.current) return;

    setPrevious(previousRef.current);
    setCurrent(words);

    previousRef.current = words;
  }, [words]);

  const duration = transition.duration ?? 0.5;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        fontFamily: font.fontFamily,
        fontSize: font.fontSize,
        fontWeight: font.fontWeight,
        lineHeight: font.lineHeight,
        width: "0.7em",
        height: "1em",
        color,
      }}
    >
      {/* Previous character */}
      <span
        key={`old-${previous}-${current}`}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `morphOut ${duration}s ease-out forwards`,
        }}
      >
        {previous}
      </span>

      {/* Current character */}
      <span
        key={`new-${current}-${previous}`}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `morphIn ${duration}s ease-out forwards`,
        }}
      >
        {current}
      </span>

      <style jsx>{`
        @keyframes morphOut {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }

          50% {
            opacity: 0.5;
            transform: scale(1.15);
            filter: blur(5px);
          }

          100% {
            opacity: 0;
            transform: scale(0.9);
            filter: blur(10px);
          }
        }

        @keyframes morphIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
            filter: blur(10px);
          }

          50% {
            opacity: 0.5;
            transform: scale(1.15);
            filter: blur(5px);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }
      `}</style>
    </div>
  );
}

