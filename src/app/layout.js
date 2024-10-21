"use client";

import "@/styles/globals.css";
import { useState } from "react";
import { AuthProvider } from "../app/context/AuthContext";
import SideNavbar from "../app/components/SideNavbar";
import Login from "../app/components/Login";

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
        <AuthProvider>
          {isLoggedIn ? (
            <>
              <SideNavbar onLogout={handleLogout} toggleSideNavbar={toggleSideNavbar} />
              <main
                id="content"
                style={{
                  position: "relative",
                  paddingLeft: "40px",
                  transition: "padding-left 0.3s",
                  marginTop: "70px",
                  paddingTop: "20px",
                  marginLeft: "20px",
                  display: "flex",
                  justifyContent: "center",
                  minHeight: "calc(100vh - 70px)",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50px",
                    width: "calc(100% - 45px)",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 0,
                    opacity: 0.3,
                  }}
                >
                  <img
                    src="/logo.svg"
                    alt="Marca de Agua"
                    style={{
                      width: "auto",
                      height: "80vh",
                    }}
                    draggable="false"
                  />
                </div>
                <div style={{ zIndex: 1 }}>{children}</div>
              </main>
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </AuthProvider>
      </body>
    </html>
  );
}