"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { FaUsers, FaUserGraduate, FaFileInvoiceDollar, FaChartBar } from "react-icons/fa";
import { fetchActiveStudents, fetchReceiptsByMonth, fetchScholarshipStudents } from "./firebase/firebaseFirestoreService";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext"; 

export default function Home() {
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [paymentsThisMonthCount, setPaymentsThisMonthCount] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const router = useRouter();
  const { isInstructorUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const activeStudents = await fetchActiveStudents();
      const scholarshipStudents = await fetchScholarshipStudents();
      const scholarshipStudentIds = new Set(scholarshipStudents.map(student => student.studentId));
      const nonScholarshipStudents = activeStudents.filter(student => !scholarshipStudentIds.has(student.id));
      setActiveStudentsCount(nonScholarshipStudents.length);

      const currentDate = new Date();
      const month = currentDate.toLocaleString('es-ES', { month: 'long' });
      const year = currentDate.getFullYear();
      const monthYear = `${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
      const receipts = await fetchReceiptsByMonth(monthYear);

      const paymentsThisMonth = receipts.filter(receipt => 
        nonScholarshipStudents.some(student => student.id === receipt.studentId)
      );
      setPaymentsThisMonthCount(paymentsThisMonth.length);

      const pendingPayments = nonScholarshipStudents.length - paymentsThisMonth.length;
      setPendingPaymentsCount(pendingPayments);
    };

    fetchData();
  }, []);

  const handleLinkClick = (path) => {
    router.push(path);
  };

  return (
    <Wrapper>
      <Title>Merecumbé San Ramón</Title>
      <ButtonSection>
        <StyledButton onClick={() => handleLinkClick("/GroupList")}>
          <FaUsers /> Grupos
        </StyledButton>
        {!isInstructorUser && (
          <>
            <StyledButton onClick={() => handleLinkClick("/StudentList")}>
              <FaUserGraduate /> Alumnos
            </StyledButton>
            <StyledButton onClick={() => handleLinkClick("/MakePayment")}>
              <FaFileInvoiceDollar /> Facturar
            </StyledButton>
            <StyledButton onClick={() => handleLinkClick("/Reports")}>
              <FaChartBar /> Reportes
            </StyledButton>
          </>
        )}
      </ButtonSection>
      {!isInstructorUser && (
        <DashboardSection>
          <DashboardTitle>Panel de Control</DashboardTitle>
          <DashboardItem>
            <DashboardLabel>Alumnos Activos:</DashboardLabel>
            <DashboardValue>{activeStudentsCount}</DashboardValue>
          </DashboardItem>
          <DashboardItem>
            <DashboardLabel>Pagos Realizados Este Mes:</DashboardLabel>
            <DashboardValue>{paymentsThisMonthCount}</DashboardValue>
          </DashboardItem>
          <DashboardItem>
            <DashboardLabel>Pagos Faltantes Este Mes:</DashboardLabel>
            <DashboardValue>{pendingPaymentsCount}</DashboardValue>
          </DashboardItem>
        </DashboardSection>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 30px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 50px;
  text-transform: uppercase;
  font-weight: 700;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const StyledButton = styled.button`
  background-color: #0b0f8b;
  color: #dddddd;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, transform 0.3s;
  text-transform: uppercase;
  font-weight: bold;

  &:hover {
    background-color: #081075;
    transform: scale(1.05);
  }

  svg {
    margin-right: 10px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 10px 20px;
    width: 100%;
  }
`;

const DashboardSection = styled.section`
  width: 100%;
  max-width: 800px;
  background: #dddddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin: 10px 0;
  }
`;

const DashboardTitle = styled.h2`
  font-size: 20px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const DashboardItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;

  &:last-child {
    border-bottom: none;
  }
`;

const DashboardLabel = styled.span`
  font-size: 18px;
  color: #333;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const DashboardValue = styled.span`
  font-size: 18px;
  color: #0b0f8b;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;