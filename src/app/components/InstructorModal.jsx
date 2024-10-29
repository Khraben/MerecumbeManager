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
    } else {
      resetFields();
    }
  }, [isOpen, instructorId]);

  const handleSave = async () => {
    // Validate required fields
    if (!name || !phone) {
      setError("Todos los campos son requeridos.");
      return;
    }
    
    // Validate phone format (assuming 9-digit phone number)
    if (phone.length !== 9) {
      setError("Formato del teléfono inválido");
      return;
    }

    setError(""); // Clear any previous errors

    const instructorData = { name, phone };

    try {
      if (instructorId) {
        // Update existing instructor
        await updateInstructor(instructorId, instructorData);
      } else {
        // Add new instructor
        await addInstructor(instructorData);
      }
      resetFields();
      onClose();
      if (onInstructorAdded) {
        onInstructorAdded(instructorData); // Callback to refresh instructor list in parent component
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
              placeholder="Celular"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

// Styled components
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
`;

const ModalHeader = styled.div`
  h2 {
    font-size: 20px;
    font-weight: bold;
    color: #0b0f8b;
    text-align: center;
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
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;
`;
