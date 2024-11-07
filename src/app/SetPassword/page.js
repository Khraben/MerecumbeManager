"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import styled from "styled-components";
import { PasswordInput } from '../components/Input';
import Image from 'next/image';
import Loading from '../components/Loading';

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || password.length > maxLength) {
      return `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`;
    }
    if (!hasUpperCase) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!hasLowerCase) {
      return "La contraseña debe contener al menos una letra minúscula.";
    }
    if (!hasNumber) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!hasSpecialChar) {
      return "La contraseña debe contener al menos un carácter especial.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (error) {
      setError("Error al restablecer la contraseña: " + error.message);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError(null); 
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Background>
      <SetContainer>
        <Form onSubmit={handleSubmit}>
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
          <Title>Crear Contraseña Mere</Title>
          <PasswordRequirements>
            <p>Requisitos de la contraseña:</p>
            <ul>
              <li>Entre 8 y 12 caracteres.</li>
              <li>Al menos una letra mayúscula.</li>
              <li>Al menos una letra minúscula.</li>
              <li>Al menos un número.</li>
              <li>Al menos un carácter especial.</li>
            </ul>
          </PasswordRequirements>
          {success ? (
            <SuccessMessage>Contraseña restablecida con éxito. Ahora puedes iniciar sesión.</SuccessMessage>
          ) : (
            <>
              <PasswordInput
                id="new-password"
                placeholder="Ingresar Contraseña"
                value={password}
                onChange={handleInputChange(setPassword)}
                style={{ color: "#dddddd" }}
                labelStyle={{ color: "#dddddd" }}
              />
              <Spacer />
              <PasswordInput
                id="confirm-password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword)}
                style={{ color: "#dddddd" }}
                labelStyle={{ color: "#dddddd" }}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <Button type="submit">Crear Contraseña</Button>
            </>
          )}
        </Form>
      </SetContainer>
    </Background>
  );
};

const SetPasswordPage = () => (
  <Suspense fallback={<Loading />}>
    <SetPassword />
  </Suspense>
);

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

const SetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  padding: 20px;
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

const Title = styled.h2`
  margin-bottom: 20px;
`;

const PasswordRequirements = styled.div`
  margin-bottom: 20px;
  text-align: left;
  color: #dddddd;
  font-size: 0.9em;
  font-style: italic;

  ul {
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
    font-size: 0.85em;
    position: relative;
    padding-left: 20px;
  }

  li::before {
    content: "❖";
    position: absolute;
    left: 0;
    color: #dddddd;
  }
`;

const Spacer = styled.div`
  height: 15px;
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

const SuccessMessage = styled.p`
  color: green;
  font-weight: bold;
  text-align: center;
`;

export default SetPasswordPage;