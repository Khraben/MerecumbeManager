"use client";

import "@/styles/globals.css";
import { useState } from "react";
import { AuthProvider } from "@/app/context/AuthContext";
import SideNavbar from "@/app/components/SideNavBar";
import Login from "@/app/components/Login";

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
                  position: "relative", // Necesario para centrar la imagen
                  paddingLeft: isSideNavbarOpen ? "250px" : "50px",
                  transition: "padding-left 0.3s",
                  marginTop: "70px",
                  paddingTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  minHeight: "calc(100vh - 70px)",
                  zIndex: 1, // Asegura que el contenido esté sobre la marca de agua
                }}
              >
                {/* Contenedor para la marca de agua */}
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: "57.5%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0, 
                    opacity: 0.1, 
                  }}
                >
                  <img
                    src="/logo.svg"
                    alt="Marca de Agua"
                    style={{
                      width: "75vh",
                      height: "auto",
                    }}
                    draggable="false"
                  />
                </div>

                {/* El contenido principal */}
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
