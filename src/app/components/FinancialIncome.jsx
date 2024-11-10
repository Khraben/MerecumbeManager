import styled from 'styled-components';
import Loading from "./Loading"; 
import DatePicker from "react-datepicker";
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { es } from "date-fns/locale/es"; 
import { fetchReceipts } from "../firebase/firebaseFirestoreService";

const FinancialIncome = ({ onBack }) => {
  const [loading, setLoading] = useState(true); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEndDateDisabled, setIsEndDateDisabled] = useState(true);
  const [payments, setPayments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [mensualidadTotal, setMensualidadTotal] = useState(0);
  const [tallerTotal, setTallerTotal] = useState(0);
  const [clasePrivadaTotal, setClasePrivadaTotal] = useState(0);
  const [monthFilter, setMonthFilter] = useState(new Date());
  
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const allPayments = await fetchReceipts();
        setPayments(allPayments);
      } catch (error) {
        console.error("Error al capturar la información de pagos. ", error);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (startDate) {
      filtered = filtered.filter(payment => {
        const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
        return paymentDate >= startDate && (!endDate || paymentDate <= new Date(endDate).setHours(23, 59, 59, 999));
      });
    } else if (monthFilter) {
      const filterMonth = monthFilter.getMonth() + 1;
      const filterYear = monthFilter.getFullYear();
      filtered = filtered.filter(payment => {
        const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
        const month = paymentDate.getMonth() + 1;
        const year = paymentDate.getFullYear();
        return month === filterMonth && year === filterYear;
      });
    }

    const mensualidadTotal = filtered
      .filter(payment => payment.concept === "Mensualidad")
      .reduce((sum, payment) => {
        const amountString = payment.amount.replace(/[₡,.]/g, '');
        const amount = parseFloat(amountString);
        return sum + amount;
      }, 0);

    const tallerTotal = filtered
      .filter(payment => payment.concept === "Taller")
      .reduce((sum, payment) => {
        const amountString = payment.amount.replace(/[₡,.]/g, '');
        const amount = parseFloat(amountString);
        return sum + amount;
      }, 0);

    const clasePrivadaTotal = filtered
      .filter(payment => payment.concept === "Clases Privadas")
      .reduce((sum, payment) => {
        const amountString = payment.amount.replace(/[₡,.]/g, '');
        const amount = parseFloat(amountString);
        return sum + amount;
      }, 0);

    const total = mensualidadTotal + tallerTotal + clasePrivadaTotal;
    setMensualidadTotal(mensualidadTotal);
    setTallerTotal(tallerTotal);
    setClasePrivadaTotal(clasePrivadaTotal);
    setTotalAmount(total);

  }, [startDate, endDate, monthFilter, payments]);

  const formatAmount = (value) => {
    return `₡${value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setIsEndDateDisabled(!date);
    if (!date) {
      setEndDate(null);
    }
  };
  const handleMonthFilterChange = (date) => {
    setMonthFilter(date);
    setStartDate(null);
    setEndDate(null);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <Wrapper>
      <Title>Ingresos</Title>
      <FilterSection>
        <SearchContainer>
          <StyledDatePicker
            selected={monthFilter}
            onChange={handleMonthFilterChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            locale={es}
            placeholderText="Filtro por mes"
          />
          <MonthCalendarIcon />
        </SearchContainer>
        <SearchContainer>
          <StyledDatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            dateFormat="dd/MM/yyyy"
            locale={es}
            placeholderText="Fecha de inicio"
          />
          <CalendarIcon />
        </SearchContainer>
        {startDate && (
          <SearchContainer>
            <StyledDatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={es}
              placeholderText="Fecha de fin"
              disabled={isEndDateDisabled}
              minDate={startDate}
            />
            <CalendarIcon />
          </SearchContainer>
        )}
      </FilterSection>
      <TableContainer>
      {totalAmount === 0 ? (
          <NoDataMessage>No hay ingresos registrados en el sistema</NoDataMessage>
        ) : (
        <PaymentTable>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mensualidad</td>
              <td>{formatAmount(Number(mensualidadTotal).toFixed(0))}</td>
            </tr>
            <tr>
              <td>Taller</td>
              <td>{formatAmount(Number(tallerTotal).toFixed(0))}</td>
            </tr>
            <tr>
              <td>Clase Privada</td>
              <td>{formatAmount(Number(clasePrivadaTotal).toFixed(0))}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{formatAmount(Number(totalAmount).toFixed(0))}</strong></td>
            </tr>
          </tbody>
        </PaymentTable>
        )}
      </TableContainer>
      <BackButton onClick={onBack}>Volver</BackButton>   
    </Wrapper>
  );
};
export default FinancialIncome;

const NoDataMessage = styled.p`
  font-size: 18px;
  color: #333;
  text-align: center;
  margin-top: 20px;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-left: -40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;

  @media (max-width: 480px) {
    padding: 1px;
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
    margin-bottom: 10px;
  }
`;

const BackButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  font-size: 14px;
  font-weight: bold;
  color: #dddddd;
  background-color: #0b0f8b;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #073e8a;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
    margin-top: 10px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px 15px;
  font-size: 14px;
  border: 2px solid #0b0f8b;
  border-radius: 5px;
  background-color: transparent;
  position: relative; 
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 220px;
  padding: 0 20px;
  margin-bottom: 20px;
  position: relative;

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: center;
    padding: 0 10px;
    margin-bottom: 10px;
  }
`;

const CalendarIcon = styled(FaCalendarAlt)`
  position: absolute;
  right: 30px; 
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;

  @media (max-width: 480px) {
    right: 25px; 
    font-size: 16px;
  }
`;

const MonthCalendarIcon = styled(FaRegCalendarAlt)`
  position: absolute;
  right: 30px; 
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;

  @media (max-width: 480px) {
    right: 25px; 
    font-size: 16px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: rgba(221, 221, 221, 1);
  margin: 0 auto;

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const PaymentTable = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background-color: transparent;
  border-radius: 8px;
  text-align: center;
  thead {
    position: sticky;
    top: 0;
    background-color: #0b0f8b;
    color: #dddddd;
  }
  th, td {
    padding: 16px 20px;
    text-align: center; 
    vertical-align: middle;
    border-bottom: 1px solid #ddd;
  }
  th {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.1em;
  }
  td {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
  tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  @media (max-width: 768px) {
    th, td {
      font-size: 12px;
      padding: 12px 15px;
    }
  }
  @media (max-width: 480px) {
    th, td {
      font-size: 10px;
      padding: 10px 12px;
    }
  }
`;