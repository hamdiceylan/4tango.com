"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SmoothScrollLink } from "./SmoothScrollLink";
import Link from "next/link";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const menuContent = isOpen ? (
    <div
      className="fixed inset-0 top-16 bg-white"
      style={{ zIndex: 9999 }}
    >
      <div className="flex flex-col h-full bg-white">
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col justify-center px-8 space-y-2 bg-white">
          <SmoothScrollLink
            href="#features"
            className="text-gray-900 text-2xl font-semibold py-4 hover:text-rose-500 transition"
            onClick={handleLinkClick}
          >
            Features
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#how-it-works"
            className="text-gray-900 text-2xl font-semibold py-4 hover:text-rose-500 transition"
            onClick={handleLinkClick}
          >
            How it works
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#pricing"
            className="text-gray-900 text-2xl font-semibold py-4 hover:text-rose-500 transition"
            onClick={handleLinkClick}
          >
            Pricing
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#faq"
            className="text-gray-900 text-2xl font-semibold py-4 hover:text-rose-500 transition"
            onClick={handleLinkClick}
          >
            FAQ
          </SmoothScrollLink>
          <Link
            href="/contact"
            className="text-gray-900 text-2xl font-semibold py-4 hover:text-rose-500 transition"
            onClick={handleLinkClick}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="px-8 pb-12 space-y-4 bg-white">
          <Link
            href="/signup"
            className="block w-full bg-rose-500 hover:bg-rose-600 text-white text-center py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-rose-500/25"
            onClick={handleLinkClick}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="block w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-center py-4 rounded-xl font-semibold text-lg transition"
            onClick={handleLinkClick}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Render menu via portal to escape stacking context */}
      {mounted && createPortal(menuContent, document.body)}
    </div>
  );
}
