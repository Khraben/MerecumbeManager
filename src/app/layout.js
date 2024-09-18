"use client";

import { useState } from "react";
import SideNavbar from "@/app/components/SideNavBar";
import Login from "@/app/components/Login";
import "@/styles/globals.css";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSideNavbarOpen, setIsSideNavbarOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleSideNavbar = () => {
    setIsSideNavbarOpen(!isSideNavbarOpen);
  };

  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {isLoggedIn ? (
          <>
            <SideNavbar onLogout={handleLogout} toggleSideNavbar={toggleSideNavbar} />
            <main
              style={{
                paddingLeft: isSideNavbarOpen ? "250px" : "50px",
                transition: "padding-left 0.3s",
                marginTop: "70px", 
                paddingTop: "20px",
                display: "flex",
                justifyContent: "center", 
                minHeight: "calc(100vh - 70px)"
              }}
            >
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