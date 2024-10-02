"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import styled from "styled-components";
import { FaBars, FaTimes, FaHome, FaUsers, FaUserGraduate, FaFileInvoiceDollar, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function SideNavbar({ onLogout: propOnLogout, toggleSideNavbar }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); 
  const { user, logout } = useAuth();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleSideNavbar(); 
  };

  const handleLogout_Hidden = () => {
    router.push("/");
    logout()
    propOnLogout(); 
  };

  const handleLogout_Show = () => {
    setIsOpen(false);
    toggleSideNavbar(); 
    setTimeout(() => {
      router.push("/");
      logout();
      propOnLogout();
    }, 300);
  };

  const handleLinkClick_Show = (path) => {
    router.push(path);
    setIsOpen(false);
    toggleSideNavbar(); 
  };

  const handleLinkClick_Hidden = (path) => {
    router.push(path);
  };

  return (
    <>
      <ToggleButton onClick={handleToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </ToggleButton>
      {!isOpen && (
        <>
          <HiddenLinks>
            <HiddenLinkContainer>
              <HiddenLink onClick={() => handleLinkClick_Hidden("/")}>
                <FaHome />
                <Tooltip>Inicio</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
            <HiddenLinkContainer>
              <HiddenLink onClick={() => handleLinkClick_Hidden("/GroupList")}>
                <FaUsers />
                <Tooltip>Grupos</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
            <HiddenLinkContainer>
              <HiddenLink onClick={() => handleLinkClick_Hidden("/StudentList")}>
                <FaUserGraduate />
                <Tooltip>Alumnos</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
            <HiddenLinkContainer>
              <HiddenLink onClick={() => handleLinkClick_Hidden("/MakePayment")}>
                <FaFileInvoiceDollar />
                <Tooltip>Facturar</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
            <HiddenLinkContainer>
              <HiddenLink onClick={() => handleLinkClick_Hidden("/Reports")}>
                <FaChartBar />
                <Tooltip>Reportes</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
            <HiddenLinkContainer>
              <HiddenLink onClick={handleLogout_Hidden}>
                <FaSignOutAlt style={{ color: "red" }} />
                <Tooltip>Salir</Tooltip>
              </HiddenLink>
            </HiddenLinkContainer>
          </HiddenLinks>
        </>
      )}
      <SideNav isOpen={isOpen}>
        <NavList isOpen={isOpen}>
        <NavItem>
            <StyledLink onClick={() => handleLinkClick_Show("/")}>
              <FaHome /> Inicio
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick_Show("/GroupList")}>
              <FaUsers /> Grupos
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick_Show("/StudentList")}>
              <FaUserGraduate /> Alumnos  
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick_Show("/MakePayment")}>
              <FaFileInvoiceDollar /> Facturar
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink onClick={() => handleLinkClick_Show("/Reports")}>
              <FaChartBar /> Reportes
            </StyledLink>
          </NavItem>
          <NavItem>
            <LogoutButton onClick={handleLogout_Show}>
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
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;

  &:hover {
    background-color: #081075;
  }
`;

const Tooltip = styled.span`
  visibility: hidden;
  width: 100px;
  background-color: #0b0f8b;
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: 50%; 
  left: 105%; 
  margin-top: -15px; 
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #0b0f8b;
  }
`;

const HiddenLinks = styled.div`
  position: fixed;
  top: 70px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1001;
`;

const HiddenLinkContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &:hover ${Tooltip} {
    visibility: visible;
    opacity: 1;
  }
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
  z-index: 1001; 

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
  z-index: 1000; 
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
  margin-top: 40px;
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
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
  z-index: 1000; 

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