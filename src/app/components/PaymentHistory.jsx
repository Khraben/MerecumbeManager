import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchReceipts, fetchStudentById } from "../conf/firebaseService";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es"; 
import "react-datepicker/dist/react-datepicker.css";
import Loading from "./Loading"; 
import { FaArrowLeft, FaArrowRight, FaSearch, FaCalendarAlt} from 'react-icons/fa';

const PaymentHistory = ({ onBack }) => {
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEndDateDisabled, setIsEndDateDisabled] = useState(true);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;
  const maxPageButtons = 4;

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true); 
      try {
        const allPayments = await fetchReceipts();
        const paymentsWithStudentNames = await Promise.all(allPayments.map(async (payment) => {
          const studentData = await fetchStudentById(payment.studentId);
          return {
            ...payment,
            studentName: studentData.name
          };
        }));
        setPayments(paymentsWithStudentNames);
        setFilteredPayments(paymentsWithStudentNames);
      } catch (error) {
        console.error("Error al cargar los pagos: ", error);
      } finally {
        setLoading(false); 
      }
    };

    loadPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (selectedStudent) {
      filtered = filtered.filter(payment => 
        payment.studentName && payment.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
      );
    }
    if (selectedConcept) {
      filtered = filtered.filter(payment => 
        payment.concept && payment.concept.toLowerCase().includes(selectedConcept.toLowerCase())
      );
    }
    if (startDate) {
      filtered = filtered.filter(payment => {
        const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
        return paymentDate >= startDate && (!endDate || paymentDate <= endDate);
      });
    }
    setFilteredPayments(filtered);
  }, [selectedStudent, selectedConcept, startDate, endDate, payments]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setIsEndDateDisabled(!date);
    if (!date) {
      setEndDate(null);
    }
  };
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <Wrapper>
      <Title>Historial de Pagos</Title>
      <FilterSection>
        <SearchContainer>
          <SearchInput
            type="text"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            placeholder="Filtrar por nombre..."
          />
          <SearchIcon />
        </SearchContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            placeholder="Filtrar por concepto..."
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
              <th># Recibo</th>
              <th>Alumno</th>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Detalle</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.map((payment, index) => (
              <tr key={index}>
                <td>{payment.receiptNumber}</td>
                <td>{payment.studentName}</td>
                <td>{payment.paymentDate && payment.paymentDate.toDate
                      ? payment.paymentDate.toDate().toLocaleDateString("es-CR")
                      : new Date(payment.paymentDate).toLocaleDateString("es-CR")}
                </td>
                <td>{payment.concept}</td>
                <td>{payment.specification ? payment.specification : "Sin detalles"}</td>
                <td>{payment.amount}</td>
              </tr>
            ))}
          </tbody>
        </PaymentTable>
      </TableContainer>
      <Pagination>
        {currentPage > 1 && (
          <PageIcon onClick={() => paginate(currentPage - 1)}>
            <FaArrowLeft />
          </PageIcon>
        )}
        {getPageNumbers().map((page) => (
          <PageButton key={page} onClick={() => paginate(page)} active={page === currentPage}>
            {page}
          </PageButton>
        ))}
        {currentPage < totalPages && (
          <PageIcon onClick={() => paginate(currentPage + 1)}>
            <FaArrowRight />
          </PageIcon>
        )}
      </Pagination>
      <BackButton onClick={onBack}>Volver</BackButton>
    </Wrapper>
  );
}
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
const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: rgba(221, 221, 221, 1);
`;
const PaymentTable = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background-color: transparent;
  border-radius: 8px;
 
  thead {
    position: sticky;
    top: 0;
    background-color: #0b0f8b;
    color: #dddddd;
  }

  th, td {
    padding: 16px 20px;
    text-align: left;
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
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;
const PageButton = styled.button`
  padding: 10px 15px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
  color: #dddddd;
  background-color: ${props => props.active ? '#073e8a' : '#0b0f8b'};
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
    padding: 8px 12px;
    font-size: 12px;
  }
`;
const PageIcon = styled.div`
  padding: 10px 15px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
  color: #0b0f8b;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #073e8a;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
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
  position: relative;  /* Asegura que el input tenga control sobre el calendario */
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
  }
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px; /
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
export default PaymentHistory;