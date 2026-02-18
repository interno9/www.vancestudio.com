"use client";
import React, { useState } from "react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="text-xs text-center font-bold p-2 top-2 left-1/2 -translate-x-1/2 backdrop-blur-xl bg-white/5 fixed z-30 flex flex-col rounded-lg origin-top transition-transform duration-300">
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="hover:cursor-pointer"
      >
        About
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? "max-h-[1200px] opacity-100 scale-100 mt-1"
            : "max-h-0 opacity-0 scale-95"
        }`}
      >
        <p className="px-2 origin-top">
          <br />
          SHB <br />
          Packaging <br />
          Campaign <br />
          Instore buildouts <br />
          Animation
          <br /> <br />
          VS <br />
          Innersect <br />
          Fruity Booty <br />
          One Drop <br />
          Noah shooting <br />
          Editorial <br />
          Task of Genuine Love pop up <br />
          <br /> <br />
          Rosie x Puma <br />
          Realization Par <br />
          Claudia <br />
          Raph <br />
          Yzy - dove <br />
          <br />
          SH Party <br />
          Creative Direction for events hosted by SH <br />
          Focus on animation from Amber + build out images videos <br />
          Terminal 27 <br />
          XO after parties
          <br /> <br />
          <a
            href="https://interno9.ch"
            target="_blank"
            className="hover:underline"
          >
            Developed by interno9
          </a>
        </p>
      </div>
    </nav>
  );
}
