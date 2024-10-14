import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchReceipts, fetchStudentById } from "../conf/firebaseService";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es"; 
import "react-datepicker/dist/react-datepicker.css";
import Loading from "./Loading"; 
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [selectedMonth, setselectedMonth] = useState(null);
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
    if (selectedMonth) {
      const selectedDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), selectedMonth.getDate());
      filtered = filtered.filter(payment => {
        const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
        return paymentDate.toDateString() === selectedDate.toDateString();
      });
    }
    setFilteredPayments(filtered);
  }, [selectedStudent, selectedConcept, selectedMonth, payments]);

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
        <label>
          Alumno:
          <input
            type="text"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            placeholder="Nombre del alumno"
          />
        </label>
        <label>
          Concepto:
          <input
            type="text"
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            placeholder="Ej. Mensualidad"
          />
        </label>
        <label>
          Fecha específica:
          <StyledDatePicker
            selected={selectedMonth}
            onChange={(date) => setselectedMonth(date)}
            dateFormat="dd/MM/yyyy"
            locale={ es }
            placeholderText="Seleccione una fecha"
          />
        </label>
      </FilterSection>
      <TableContainer>
        <PaymentTable>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Fecha de Pago</th>
              <th>Detalles</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Número de Recibo</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.map((payment, index) => (
              <tr key={index}>
                <td>{payment.studentName}</td>
                <td>{payment.paymentDate && payment.paymentDate.toDate
                      ? payment.paymentDate.toDate().toLocaleDateString("es-CR")
                      : new Date(payment.paymentDate).toLocaleDateString("es-CR")}
                </td>
                <td>{payment.specification ? payment.specification : "sin detalles"}</td>
                <td>{payment.concept}</td>
                <td>{payment.amount}</td>
                <td>{payment.receiptNumber}</td>
              </tr>
            ))}
          </tbody>
        </PaymentTable>
      </TableContainer>
      <Pagination>
        {currentPage > 1 && (
          <PageButton onClick={() => paginate(currentPage - 1)}>
            <FaArrowLeft />
          </PageButton>
        )}
        {getPageNumbers().map((page) => (
          <PageButton key={page} onClick={() => paginate(page)} active={page === currentPage}>
            {page}
          </PageButton>
        ))}
        {currentPage < totalPages && (
          <PageButton onClick={() => paginate(currentPage + 1)}>
            <FaArrowRight />
          </PageButton>
        )}
      </Pagination>
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

const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  width: 100%;
  label {
    margin-right: 10px;
  }
  input {
    padding: 5px;
    margin-left: 5px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
    color: white;
    z-index: 1;
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
  color: #fff;
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

const StyledDatePicker = styled(DatePicker)`
  padding: 5px;
  margin-left: 5px;
`;

export default PaymentHistory;