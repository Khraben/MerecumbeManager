"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Image from "next/image";

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Background>
      {isLoading ? (
        <AnimationContainer>
          <Logo src="/logo.svg" alt="Loading Logo" width={180} height={180} />
        </AnimationContainer>
      ) : (
        <LoginContainer>
          <StyledLogo src="/logo.svg" alt="Logo" width={120} height={120} />
          <Form>
            <Input type="text" placeholder="Usuario" />
            <Input type="password" placeholder="Contraseña" />
            <Button type="submit">Ingresar</Button>
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
  color: white;
  margin: 0;
  padding: 0;
  font-family: 'Quicksand', sans-serif;
  overflow: hidden;
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

const Logo = styled(Image)`
  animation: ${spin} 1.5s linear infinite; /* Añadimos infinite para que gire continuamente */
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

const StyledLogo = styled(Image)`
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

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  width: 100%;
  border: none;
  border-radius: 5px;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #fff;
  color: #0b0f8b;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  margin-top: 10px;
  font-weight: bold;
`;