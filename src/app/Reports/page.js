"use client";
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PaymentHistory from "../components/PaymentHistory";
const Reports = () => {
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  // Función para manejar el clic en el apartado "Registro de Pagos"
  const handleShowPaymentHistory = () => {
    setShowPaymentHistory(true);
  };

 
  return (
    <Wrapper>
      
      {showPaymentHistory ? (
        // Si el estado es true, muestra el historial de pagos
        <PaymentHistory />
      ) : (
        
        <>
          <Title>Reportes</Title>
          <Description>Generación de reportes sobre asistencias, pagos y demás.</Description>
          <ReportTypeSection onClick={handleShowPaymentHistory}>
            <Subtitle>Registro de Pagos</Subtitle>
            <p>Genera un reporte detallado de los pagos.</p>
          </ReportTypeSection>
          <ReportTypeSection>
            <Subtitle>Morosos</Subtitle>
            <p>Genera un reporte de los alumnos morosos.</p>
          </ReportTypeSection>
          <ReportTypeSection>
            <Subtitle>Asistencia</Subtitle>
            <p>Genera un reporte de la asistencia de los alumnos.</p>
          </ReportTypeSection>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 700;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ReportTypeSection = styled.section`
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
  transition: background-color 0.3s, transform 0.3s;
  cursor: pointer;

  p {
    text-align: center;
  }

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin: 10px 0;
  }
`;

const Subtitle = styled.h2`
  font-size: 20px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export default Reports;