import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaAngleDown, FaAngleUp } from "react-icons/fa";
import {
  fetchCurrentCash,
  subtractFromCurrentCash,
} from "../firebase/firebaseFirestoreService";
import Loading from "./Loading";
import { NumberInput } from "./Input";
import ConfirmationModal from "./ConfirmationModal";

const CashModal = ({ isOpen, onClose }) => {
  const [currentCash, setCurrentCash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdrawSection, setShowWithdrawSection] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    const loadCurrentCash = async () => {
      try {
        const cash = await fetchCurrentCash();
        setCurrentCash(cash);
      } catch (error) {
        console.error("Error fetching current cash:", error);
        setError("Error al cargar el efectivo actual.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCurrentCash();
      setShowWithdrawSection(false);
      setWithdrawAmount("");
      setInputError("");
    }
  }, [isOpen]);

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || (Number(value) > 0 && Number(value) <= currentCash)) {
      setWithdrawAmount(value);
      setInputError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === " ") {
      e.preventDefault();
    }
  };

  const formatNumber = (value) => {
    return Number(value).toLocaleString();
  };

  const handleBlur = () => {
    setWithdrawAmount(formatNumber(withdrawAmount));
  };

  const handleWithdraw = async () => {
    try {
      await subtractFromCurrentCash(Number(withdrawAmount.replace(/,/g, "")));
      const updatedCash = await fetchCurrentCash();
      setCurrentCash(updatedCash);
      setShowWithdrawSection(false);
      setWithdrawAmount("");
      setShowConfirmationModal(false);
    } catch (error) {
      console.error("Error realizando el retiro:", error);
      setError("Error realizando el retiro.");
    }
  };

  const handleWithdrawButtonClick = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setInputError("Debe ingresar un monto válido.");
    } else {
      setShowConfirmationModal(true);
    }
  };

  if (!isOpen) return null;
  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <>
      <Overlay isOpen={isOpen}>
        <ModalContainer>
          <ModalHeader>
            <Title>Efectivo Actual En Caja</Title>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <CashAmount>₡ {currentCash.toLocaleString()}</CashAmount>
            {showWithdrawSection && (
              <WithdrawSection>
                <NumberInput
                  type="text"
                  placeholder="Monto a retirar"
                  value={withdrawAmount}
                  onChange={handleWithdrawAmountChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  min="1"
                />
                {inputError && <ErrorMessage>{inputError}</ErrorMessage>}
                <WithdrawButton onClick={handleWithdrawButtonClick}>
                  Realizar Retiro
                </WithdrawButton>
              </WithdrawSection>
            )}
            <IconButton
              onClick={() => setShowWithdrawSection(!showWithdrawSection)}
            >
              {showWithdrawSection ? <FaAngleUp /> : <FaAngleDown />}
            </IconButton>
          </ModalBody>
        </ModalContainer>
      </Overlay>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleWithdraw}
        message={`¿Está seguro de retirar ₡ ${withdrawAmount}?`}
      />
    </>
  );
};

const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333333;

  &:hover {
    color: #242424;
  }

  &:focus {
    outline: none;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
`;

const CashAmount = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333333;
  margin-top: auto;

  &:hover {
    color: #242424;
  }

  &:focus {
    outline: none;
  }
`;

const WithdrawSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const WithdrawButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #333333;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #242424;
  }

  &:focus {
    outline: none;
  }
`;

export default CashModal;
