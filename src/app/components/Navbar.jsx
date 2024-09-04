"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import styled from "styled-components";
import Link from "next/link";
import { FaBars, FaTimes, FaHome, FaUsers, FaUserGraduate, FaFileInvoiceDollar, FaSignOutAlt } from "react-icons/fa";

export default function Navbar({ onLogout, toggleNavbar }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); 

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleNavbar(); 
  };

  const handleLogout = () => {
    onLogout();
    router.push("/");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleLinkClick = (path) => {
    router.push(path);
    setIsOpen(false);
    toggleNavbar();
  };

  return (
    <>
      <ToggleButton onClick={handleToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </ToggleButton>
      {!isOpen && (
        <>
          <HomeButton onClick={handleHomeClick}>
            <FaHome />
          </HomeButton>
          <HiddenLinks>
            <HiddenLink onClick={() => handleLinkClick("/GroupList")}>
              <FaUsers />
            </HiddenLink>
            <HiddenLink onClick={() => handleLinkClick("/StudentList")}>
              <FaUserGraduate />
            </HiddenLink>
            <HiddenLink onClick={() => handleLinkClick("/MakePayment")}>
              <FaFileInvoiceDollar />
            </HiddenLink>
            <HiddenLink onClick={handleLogout}>
              <FaSignOutAlt style={{ color: "red" }} />
            </HiddenLink>
          </HiddenLinks>
        </>
      )}
      <SideNav isOpen={isOpen}>
        <NavList isOpen={isOpen}>
        <NavItem>
            <StyledLink onClick={() => handleLinkClick("/")}>
              <FaHome /> Inicio
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick("/GroupList")}>
              <FaUsers /> Grupos
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick("/StudentList")}>
              <FaUserGraduate /> Alumnos
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick("/MakePayment")}>
              <FaFileInvoiceDollar /> Facturar
            </StyledLink>
          </NavItem>
          <NavItem>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: "10px", color: "red" }} /> Salir
            </LogoutButton>
          </NavItem>
        </NavList>
      </SideNav>
    </>
  );
}

const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #0b0f8b;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  z-index: 1000;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #081075;
  }
`;

const HomeButton = styled.button`
  position: fixed;
  top: 60px;
  left: 10px;
  background-color: #0b0f8b;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  z-index: 1000;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #081075;
  }
`;

const HiddenLinks = styled.div`
  position: fixed;
  top: 120px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`;

const HiddenLink = styled.button`
  background-color: #0b0f8b;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #081075;
  }
`;

const SideNav = styled.nav`
  background-color: #0b0f8b;
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: ${({ isOpen }) => (isOpen ? "0" : "-230px")};
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease-in-out;
  overflow: hidden; 

  @media (max-width: 480px) {
    width: 100vw;
    left: ${({ isOpen }) => (isOpen ? "0" : "-95vw")};
  }
`;

const NavList = styled.ul`
  list-style: none;
  width: 100%;
  padding: 0;
  margin: 0;
  margin-top: 20px;
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
  overflow: hidden; 
`;

const NavItem = styled.li`
  width: 100%;
  margin: 20px 0;
`;

const StyledLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  width: calc(100% - 40px); 
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 480px) {
    width: calc(100% - 80px); 
    padding: 15px 20px;
  }

  svg {
    margin-right: 10px;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
  width: calc(100%); 
  padding: 10px 20px;
  text-align: left;
  margin-top: auto;
  border-radius: 5px;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: red;
  }

  @media (max-width: 480px) {
    width: calc(100% - 40px); 
    padding: 15px 20px;
  }
`;