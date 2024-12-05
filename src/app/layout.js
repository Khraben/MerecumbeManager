"use client";

import "@/styles/globals.css";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider } from "./context/AuthContext";
import SideNavbar from "./components/SideNavbar";
import Login from "./components/Login";
import Image from "next/image";
import styled from "styled-components";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSideNavbarOpen, setIsSideNavbarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogin = () => {
    setIsLoggedIn(true);
    router.push("/");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleSideNavbar = () => {
    setIsSideNavbarOpen(!isSideNavbarOpen);
  };

  const noLayoutRoutes = ["/SetPassword"];

  const shouldShowLayout = !noLayoutRoutes.includes(pathname);

  useEffect(() => {
    document.title = "Dance Manager";
  }, []);

  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          {shouldShowLayout ? (
            isLoggedIn ? (
              <>
                <SideNavbar
                  onLogout={handleLogout}
                  toggleSideNavbar={toggleSideNavbar}
                />
                <MainContent>
                  <Watermark>
                    <Image
                      src="/receiptLogo.svg"
                      alt="Marca de Agua"
                      layout="fill"
                      objectFit="contain"
                      style={{ opacity: 0.3 }}
                      draggable="false"
                    />
                  </Watermark>
                  <Content>{children}</Content>
                </MainContent>
              </>
            ) : (
              <Login onLogin={handleLogin} />
            )
          ) : (
            <Content>{children}</Content>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}

const MainContent = styled.main`
  position: relative;
  padding-left: 40px;
  transition: padding-left 0.3s;
  margin-top: 70px;
  padding-top: 20px;
  margin-left: 20px;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 70px);
  z-index: 1;
`;

const Watermark = styled.div`
  position: absolute;
  top: 0;
  left: 50px;
  width: calc(100% - 45px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
`;

const Content = styled.div`
  z-index: 1;
`;
