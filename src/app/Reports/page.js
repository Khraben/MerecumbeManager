"use client";

import React from 'react';
import styled from 'styled-components';

const Reports = () => {
  return (
    <Wrapper>
      <Title>Reportes</Title>
      <Description>Generación de reportes sobre asistencias, pagos y demás.</Description>
      <Section>
        <Subtitle>Ingresos</Subtitle>
        <ReportContent>
          <p>Genera un reporte detallado de los ingresos.</p>
        </ReportContent>
      </Section>
      <Section>
        <Subtitle>Morosos</Subtitle>
        <ReportContent>
          <p>Genera un reporte de los alumnos morosos.</p>
        </ReportContent>
      </Section>
      <Section>
        <Subtitle>Asistencia</Subtitle>
        <ReportContent>
          <p>Genera un reporte de la asistencia de los alumnos.</p>
        </ReportContent>
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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

const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
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

const ReportContent = styled.div`
  font-size: 16px;
  color: #333;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export default Reports;