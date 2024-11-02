import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { addInstructor, fetchInstructorById, updateInstructor } from "../firebase/firebaseFirestoreService";
import { TextInput } from './Input';

export default function InstructorModal({ isOpen, onClose, onInstructorAdded, instructorId }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && instructorId) {
      const fetchInstructor = async () => {
        try {
          const instructorData = await fetchInstructorById(instructorId);
          setName(instructorData.name);
          setPhone(instructorData.phone);
        } catch (error) {
          setError("Error al cargar datos del instructor.");
        }
      };
      fetchInstructor();
    } else if (!isOpen) {
      resetFields(); // Limpia los campos si el modal está cerrado
    }
  }, [isOpen, instructorId]);

  const handleSave = async () => {
    if (!name || !phone) {
      setError("Todos los campos son requeridos.");
      return;
    }
    if (phone.length !== 9) {
      setError("Formato del teléfono inválido");
      return;
    }

    setError("");

    const instructorData = { name, phone };

    try {
      if (instructorId) {
        await updateInstructor(instructorId, instructorData);
      } else {
        await addInstructor(instructorData);
      }
      resetFields();
      onClose(); // Llama a onClose después de guardar
      if (onInstructorAdded) {
        onInstructorAdded(instructorData);
      }
    } catch (error) {
      setError("Error al guardar instructor.");
    }
  };

  const resetFields = () => {
    setName("");
    setPhone("");
    setError("");
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remueve caracteres no numéricos
    if (value.length > 4) {
      value = `${value.slice(0, 4)}-${value.slice(4, 8)}`; // Agrega un guion después de 4 dígitos
    }
    setPhone(value.slice(0, 9)); // Limita el formato
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <h2>{instructorId ? "Editar Instructor" : "Agregar Nuevo Instructor"}</h2>
        </ModalHeader>
        <ModalBody>
          <Form>
            <label>Información de Instructor</label>
            <TextInput
              id="name"
              placeholder="Nombre y Apellido"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextInput
              id="phone"
              placeholder="0000-0000"
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              maxLength="9"
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

// Estilos
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
