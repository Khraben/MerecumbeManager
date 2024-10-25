"use client";

import { useEffect, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import Image from "next/image";
import { auth } from "../conf/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { fetchEmailByUsername } from "../conf/firebaseService";
import { UserInput, PasswordInput } from './Input';

export default function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const loginButtonRef = useRef(null); 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Por favor, ingrese usuario y contraseña.");
      return;
    }
    try {
      const email = await fetchEmailByUsername(username);
      if (!email) {
        setError("Usuario no encontrado. Por favor, verifica si el usuario existe.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("Contraseña incorrecta. Por favor, verifica tu contraseña.");
      } else {
        setError("Error al iniciar sesión: " + error.message);
      }
    }
  };
  
  return (
    <Background>
      {isLoading ? (
        <AnimationContainer>
          <Logo src="/logo.svg" alt="Loading Logo" width={180} height={180} />
        </AnimationContainer>
      ) : (
        <LoginContainer>
          <StyledLogo src="/logo.svg" alt="Logo" width={120} height={120} />
          <Form onSubmit={handleLogin}>
            <UserInput
              id="username"
              placeholder="Usuario"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              style={{ marginBottom: '10px', color: "#dddddd" }}
              labelStyle={{ color: "#dddddd" }}
            />
            <PasswordInput
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null); 
              }}
              style={{ color: "#dddddd" }}
              labelStyle={{ color: "#dddddd" }}
              loginButtonRef={loginButtonRef}
            />
            <Button ref={loginButtonRef} type="submit">Ingresar</Button> {/* Attach the ref to the button */}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
        </LoginContainer>
      )}
    </Background>
  );
}

const Background = styled.div`
  background-color: #0b0f8b;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  color: #dddddd;
  margin: 0;
  padding: 0;
  font-family: 'Quicksand', sans-serif;
  overflow: hidden;
  position: fixed; 
  top: 0;
  left: 0;
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const Logo = styled(Image).attrs({
  draggable: false,
})`
  animation: ${spin} 1.5s linear;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  padding: 20px;
`;

const StyledLogo = styled(Image).attrs({
  draggable: false,
})`
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  padding: 20px;
  border-radius: 10px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #dddddd;
  color: #0b0f8b;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  margin-top: 10px;
  font-weight: bold;
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;
`;