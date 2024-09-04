"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Login from "@/app/components/Login";
import "@/styles/globals.css";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {isLoggedIn ? (
          <>
            <Navbar onLogout={handleLogout} toggleNavbar={toggleNavbar} />
            <main style={{ paddingLeft: isNavbarOpen ? '250px' : '0', transition: 'padding-left 0.3s' }}>
              {children}
            </main>
          </>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </body>
    </html>
  );
}