import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { fetchSecretaryById } from "../firebase/firebaseFirestoreService";
import Loading from "./Loading";

const SecretaryDetails = ({ isOpen, onClose, secretaryId }) => {
  const [secretary, setSecretary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && secretaryId) {
      const fetchSecretary = async () => {
        try {
          const secretaryData = await fetchSecretaryById(secretaryId);
          setSecretary(secretaryData);
        } catch (error) {
          console.error("Error fetching secretary details:", error);
          setError("No se pudo cargar la información de la secretaria.");
        }
      };
      fetchSecretary();
    }
  }, [isOpen, secretaryId]);

  if (!isOpen) return null;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!secretary) return <Loading />;

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <Title>INFORMACIÓN DE LA SECRETARIA</Title>
          <Card>
            <FaUser />
            <DetailItem><strong>Nombre:</strong> {secretary.name}</DetailItem>
          </Card>
          <Card>
            <FaPhone />
            <DetailItem><strong>Celular:</strong> {secretary.phone}</DetailItem>
          </Card>
          <Card>
            <FaUser />
            <DetailItem><strong>Usuario:</strong> {secretary.username}</DetailItem>
          </Card>
          {secretary.email && (
            <Card>
              <FaEnvelope />
              <DetailItem><strong>Correo:</strong> {secretary.email}</DetailItem>
            </Card>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

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
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1003;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
    margin-left: 20px;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
    margin-left: 45px;
    margin-right: 5px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #0b0f8b;

  &:hover {
    color: #073e8a;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 10px;
  text-align: center;
`;

const Card = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DetailItem = styled.p`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;
`;

export default SecretaryDetails;
