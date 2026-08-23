"use client";

import { useEffect, useId, useMemo, useState } from "react";

function mapEaseToCSS(ease: any): string {
    if (Array.isArray(ease) && ease.length === 4) {
        return `cubic-bezier(${ease.join(",")})`;
    }

    switch (ease) {
        case "linear":
            return "linear";
        case "easeIn":
            return "ease-in";
        case "easeOut":
            return "ease-out";
        case "easeInOut":
            return "ease-in-out";
        case "circIn":
            return "cubic-bezier(0.6, 0.04, 0.98, 0.335)";
        case "circOut":
            return "cubic-bezier(0.075, 0.82, 0.165, 1)";
        case "circInOut":
            return "cubic-bezier(0.785, 0.135, 0.15, 0.86)";
        case "backIn":
            return "cubic-bezier(0.6, -0.28, 0.735, 0.045)";
        case "backOut":
            return "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        case "backInOut":
            return "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        default:
            return "ease-in-out";
    }
}

function __OriginkitBase_TextMorph(props: any) {
    props = { ...COMPONENT_DEFAULTS, ...props };

    const {
        words,
        color,
        font,
        transition,
        tag,
        play,
    } = props;

    const morph = Math.max(
        0.1,
        transition?.duration ?? 1
    );

    const easeCSS = mapEaseToCSS(
        transition?.ease ?? "easeInOut"
    );

    const Tag = (tag ?? "div") as any;

    const wordList = useMemo<string[]>(
        () =>
            (words as string)
                .split(/\r?\n|,/)
                .map((w) => w.trim())
                .filter(Boolean),
        [words]
    );

    const rawId = useId();
    const safeId = rawId.replace(/[:]/g, "");

    const filterId = `tm-thr-${safeId}`;
    const animName = `tm-once-${safeId}`;

    const typeface = font ?? {};

    const textAlign =
        (typeface as any)?.textAlign ?? "center";

    const fontStyle = Object.fromEntries(
        Object.entries(typeface).filter(
            ([k]) => k !== "textAlign"
        )
    );

    const longest = wordList.reduce(
        (acc, w) =>
            w.length > acc.length ? w : acc,
        ""
    );

    /*
     * Animation starts hidden and ends visible.
     *
     * There is NO infinite loop.
     */
    const keyframes = `
        @keyframes ${animName} {

            0% {
                opacity: 0;
                filter: blur(20px);
                transform:
                    translate(-50%, -50%)
                    scale(0.8);
            }

            60% {
                opacity: 1;
                filter: blur(0px);
                transform:
                    translate(-50%, -50%)
                    scale(1);
            }

            100% {
                opacity: 1;
                filter: blur(0px);
                transform:
                    translate(-50%, -50%)
                    scale(1);
            }
        }
    `;

    return (
        <Tag
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                userSelect: "none",
            }}
        >
            <style>{keyframes}</style>

            <svg
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
                aria-hidden
            >
                <defs>
                    <filter id={filterId}>
                        <feColorMatrix
                            in="SourceGraphic"
                            type="matrix"
                            values="
                                1 0 0 0 0
                                0 1 0 0 0
                                0 0 1 0 0
                                0 0 0 25 -9
                            "
                            result="goo"
                        />

                        <feComposite
                            in="SourceGraphic"
                            in2="goo"
                            operator="atop"
                        />
                    </filter>
                </defs>
            </svg>

            <div
                style={{
                    position: "relative",
                    filter: `url(#${filterId})`,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: textAlign as any,
                    ...fontStyle,
                }}
            >
                <div
                    style={{
                        position: "relative",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        lineHeight: 1.2,
                        minHeight: "1.2em",
                    }}
                >
                    <span
                        style={{
                            visibility: "hidden",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                        }}
                    >
                        {longest || " "}
                    </span>

                    {wordList.map((word, i) => (
                        <span
                            key={`${word}-${i}`}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform:
                                    "translate(-50%, -50%)",

                                opacity: play ? undefined : 0,

                                color,
                                whiteSpace: "nowrap",

                                animation: `${animName} ${morph}s ${easeCSS} forwards`,

                                animationPlayState: play
                                    ? "running"
                                    : "paused",

                                willChange:
                                    "opacity, filter, transform",
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        </Tag>
    );
}

const COMPONENT_DEFAULTS = {
    words: "TEXT",

    play: true,

    transition: {
        type: "tween",
        duration: 1,
        delay: 0,
        ease: "easeInOut",
    },

    color: "#FFFFFF",

    font: {
        fontFamily: "Inter",
        variant: "Bold",
        fontSize: 120,
        lineHeight: "1.2em",
        letterSpacing: "0em",
        textAlign: "center",
    },

    tag: "div",
};

export default function TextMorph(
    props: Record<string, unknown>
) {
    return (
        <__OriginkitBase_TextMorph
            {...COMPONENT_DEFAULTS}
            {...props}
        />
    );
}