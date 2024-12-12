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
    document.title = "Merecumbé San Ramón - Manager";
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
                    <WatermarkImage
                      src="/logo.svg"
                      alt="Marca de Agua"
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
  width: calc(100% - 65px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
  pointer-events: none;
`;

const WatermarkImage = styled(Image).attrs({
  width: 750,
  height: 750,
})`
  opacity: 0.3;
  pointer-events: none;
`;

const Content = styled.div`
  z-index: 1;
`;
