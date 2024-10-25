import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { addSecretary, fetchSecretaryById, updateSecretary, isEmailRegistered, isUsernameRegistered } from "../conf/firebaseService";
import { TextInput } from './Input';
import { createSecretaryUser } from "../conf/firebase";

export default function SecretaryModal({ isOpen, onClose, onSecretaryAdded, secretaryId }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
      if (secretaryId) {
        fetchSecretaryData(secretaryId);
      }
    } else {
      document.body.classList.remove("no-scroll");
      resetFields();
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen, secretaryId]);

  const fetchSecretaryData = async (id) => {
    try {
      const secretaryData = await fetchSecretaryById(id);
      setName(secretaryData.name);
      setPhone(secretaryData.phone);
      setUsername(secretaryData.username);
      setEmail(secretaryData.email);
    } catch (error) {
      console.error("Error fetching secretary data:", error);
    }
  };

  const handleSave = async () => {
   if (!name || !phone || !username || !email) {
     setError("Todos los campos son requeridos.");
     return;
   }
   if (phone.length !== 9) {
     setError("Formato del teléfono inválido");
     return;
   }
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   if (email.includes(' ')) {
     setError("El correo electrónico no debe contener espacios.");
     return;
   }
   if (!emailRegex.test(email)) {
     setError("Por favor ingresa un correo electrónico válido.");
     return;
   }
 
   const emailExists = await isEmailRegistered(email);
   if (emailExists) {
     setError("El correo electrónico ya está registrado.");
     return;
   }
 
   const usernameExists = await isUsernameRegistered(username);
   if (usernameExists) {
     setError("El nombre de usuario ya está registrado.");
     return;
   }
 
   setError("");
 
   const secretaryData = {
     name,
     phone,
     username,
     email,
   };
 
   try {
     if (secretaryId) {
       await updateSecretary(secretaryId, secretaryData);
     } else {
       await addSecretary(secretaryData);
       await createSecretaryUser(email);
     }
     resetFields();
     onClose();
     if (onSecretaryAdded) {
       onSecretaryAdded(secretaryData);
     }
   } catch (error) {
     setError("Error al guardar secretaria.");
   }
 };

  const resetFields = () => {
    setName("");
    setPhone("");
    setUsername("");
    setEmail("");
    setError("");
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const formatPhoneNumber = (value) => {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  const handlePhoneChange = (setter) => (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setter(formattedValue);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <h2>{secretaryId ? "Editar Secretaria" : "Agregar Nueva Secretaria"}</h2>
        </ModalHeader>
        <ModalBody>
          <Form>
            <label>Información de Secretaria</label>
            <TextInput
              id="name"
              placeholder="Nombre y Apellido"
              value={name}
              onChange={handleInputChange(setName)}
            />
            <TextInput
              id="phone"
              placeholder="Celular"
              value={phone}
              onChange={handlePhoneChange(setPhone)}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              maxLength="9"
            />
            <TextInput
              id="username"
              placeholder="Usuario"
              value={username}
              onChange={handleInputChange(setUsername)}
            />
            <TextInput
              id="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={handleInputChange(setEmail)}
            />
          </Form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={() => { resetFields(); onClose(); }}>Cancelar</CancelButton>
          <SaveButton onClick={handleSave}>Guardar</SaveButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
`;

const ModalContainer = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  background-color: #dddddd;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto; 
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1003;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
  }
`;

const ModalHeader = styled.div`
  h2 {
    font-size: 20px;
    font-weight: bold;
    color: #0b0f8b;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const CancelButton = styled.button`
  background-color: #999;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #6b6b6b;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }
`;

const SaveButton = styled.button`
  background-color: #0b0f8b;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #073e8a;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;