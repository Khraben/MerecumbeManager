"use client";
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PaymentHistory from "../components/PaymentHistory";

const Reports = () => {
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const handleShowPaymentHistory = () => {
    setShowPaymentHistory(true);
  };

  const handleBackToReports = () => {
    setShowPaymentHistory(false);
  };

  return (
    <Wrapper>
      {showPaymentHistory ? (
        <PaymentHistory onBack={handleBackToReports} />
      ) : (
        <>
          <Title>Reportes</Title>
          <ReportTypeSection onClick={handleShowPaymentHistory}>
            <Subtitle>Historial de Pagos</Subtitle>
            <p>Genera un reporte detallado de los pagos.</p>
          </ReportTypeSection>
          <ReportTypeSection>
            <Subtitle>Morosos</Subtitle>
            <p>Genera un reporte de los alumnos morosos.</p>
          </ReportTypeSection>
          <ReportTypeSection>
            <Subtitle>Ingresos</Subtitle>
            <p>Genera un reporte de los ingresos.</p>
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


const ReportTypeSection = styled.section`
  width: 100%;
  max-width: 1200px;
  background: #dddddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
  transition: background-color 0.3s, transform 0.3s;
  cursor: pointer;

  p {
    text-align: center;
    word-wrap: break-word; 
  }

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 15px;
    margin: 15px 0;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin: 10px 0;
    max-width: 75%;
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