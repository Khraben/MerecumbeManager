import styled from 'styled-components';
import Loading from "./Loading"; 
import DatePicker from "react-datepicker";
import React, { useState, useEffect } from 'react';
import { FaSearch,FaCalendarAlt} from 'react-icons/fa';
import { es } from "date-fns/locale/es"; 
import { fetchReceipts} from "../firebase/firebaseFirestoreService";

const FinancialIncome= ({onBack}) => {
    const [loading, setLoading] = useState(true); 
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isEndDateDisabled, setIsEndDateDisabled] = useState(true);
    const [payments, setPayments] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [mensualidadTotal, setMensualidadTotal] = useState(0);
    const [tallerTotal, setTallerTotal] = useState(0);
    const [clasePrivadaTotal, setClasePrivadaTotal] = useState(0);
    const [monthFilter, setMonthFilter] = useState("");
    const monthNameToNumber = (monthName) => {
        const months = {
          "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
          "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
        };
        return months[monthName.toLowerCase()] || null;
      };
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
      }else if (monthFilter) {
        const [filterMonthName, filterYear] = monthFilter.split("/");
        const filterMonth = monthNameToNumber(filterMonthName);
        if (filterMonth && !isNaN(filterYear)) {
          filtered = filtered.filter(payment => {
            const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
            const month = paymentDate.getMonth() + 1;
            const year = paymentDate.getFullYear();
            return month === filterMonth && year === Number(filterYear);
          });
        }
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

    }, [startDate, endDate,monthFilter, payments]);
  
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
    const handleMonthFilterChange = (e) => {
        setMonthFilter(e.target.value);
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
            <SearchInput
            type="text"
            value={monthFilter}
            onChange={(e) => handleMonthFilterChange(e)} 
            placeholder="MM/YYYY"
            />
             <SearchIcon />
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
                    />
                    <CalendarIcon />
                </SearchContainer>
                )}
            </FilterSection>
            <TableContainer>
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
            </TableContainer>
        <BackButton onClick={onBack}>Volver</BackButton>   
    </Wrapper>
    );
  };
export default FinancialIncome;
const Wrapper = styled.div`
  width: 100%;
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
`;const BackButton = styled.button`
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
  z-index: 5;
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
const SearchIcon = styled(FaSearch)`
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
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  font-size: 14px;
  border: 2px solid #0b0f8b;
  border-radius: 5px;
  outline: none;
  background-color: transparent;

  @media (max-width: 480px) {
    padding: 8px 35px 8px 12px; 
    font-size: 12px;
  }
`;
const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: rgba(221, 221, 221, 1);

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
    margin-left: 160px;
    
    th, td {
      font-size: 10px;
      padding: 10px 12px;
    }
  }
`;