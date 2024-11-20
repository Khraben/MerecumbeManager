import React, { useState } from "react";
import styled from "styled-components";
import Loading from "./Loading";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Overlay>
      {loading ? (
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      ) : (
        <ModalContainer>
          <ModalHeader>
            <h2>Confirmación</h2>
          </ModalHeader>
          <ModalBody>
            <Message>{message}</Message>
          </ModalBody>
          <ModalFooter>
            <CancelButton onClick={onClose}>Cancelar</CancelButton>
            <ConfirmButton onClick={handleConfirm}>Confirmar</ConfirmButton>
          </ModalFooter>
        </ModalContainer>
      )}
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const ModalContainer = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  background-color: #dddddd;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

const Message = styled.p`
  font-size: 16px;
  color: #333;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 14px;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;

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

const ConfirmButton = styled.button`
  background-color: #0b0f8b;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

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

export default ConfirmationModal;
