"use client";
import React, { useState } from "react";

export default function Nav({ aboutText = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      onClick={() => {
        setIsOpen((prev) => !prev);
      }}
      className="uppercase hover:cursor-pointer text-center p-2 top-2 left-1/2 -translate-x-1/2 backdrop-blur-lg hover:bg-white/5 fixed z-30 flex flex-col rounded-md origin-top transition-transform duration-300"
    >
      Vance Studio
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="px-2 max-w-lg pt-2 whitespace-pre-wrap">
            {aboutText}
          </div>
          <a
            href="https://interno9.ch"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Developed by interno9
          </a>
        </div>
      </div>
    </nav>
  );
}
