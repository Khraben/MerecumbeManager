import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchStudents, fetchReceipts, fetchAttendances, fetchScholarshipStudents } from "../firebase/firebaseFirestoreService";
import Loading from "./Loading";
import { FaArrowLeft, FaArrowRight, FaSearch, FaRegCalendarAlt } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es"; 

const PendingPayments = ({ onBack }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [monthFilter, setMonthFilter] = useState(null);
  const paymentsPerPage = 8;
  const maxPageButtons = 4;

  useEffect(() => {
    const loadPendingPayments = async () => {
      setLoading(true);
      try {
        const students = await fetchStudents();
        const receipts = await fetchReceipts();
        const attendances = await fetchAttendances();
        const scholarshipStudents = await fetchScholarshipStudents();
        const scholarshipStudentIds = new Set(scholarshipStudents.map(student => student.studentId));
  
        const monthOrder = {
          'enero': 0,
          'febrero': 1,
          'marzo': 2,
          'abril': 3,
          'mayo': 4,
          'junio': 5,
          'julio': 6,
          'agosto': 7,
          'septiembre': 8,
          'octubre': 9,
          'noviembre': 10,
          'diciembre': 11
        };
  
        const pendingPayments = students
          .filter(student => !scholarshipStudentIds.has(student.id))
          .map(student => {
            const studentAttendances = attendances.filter(att => att.studentId === student.id);
            const studentReceipts = receipts.filter(rec => rec.studentId === student.id && rec.concept === "Mensualidad");
  
            const pendingMonths = studentAttendances.reduce((acc, att) => {
              const attDate = new Date(att.date.seconds * 1000);
              let monthName = attDate.toLocaleString('es-ES', { month: 'long' });
              monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
              const monthYear = `${monthName} de ${attDate.getFullYear()}`;
              const hasReceipt = studentReceipts.some(rec => rec.specification === monthYear);
              if (!hasReceipt) {
                acc.add(monthYear);
              }
              return acc;
            }, new Set());
  
            return Array.from(pendingMonths).map(month => ({
              studentName: student.name,
              studentPhone: student.phone,
              month,
              paymentDate: student.paymentDate || "Pendiente"
            }));
          }).flat();
  
        pendingPayments.sort((a, b) => {
          const [monthA, yearA] = a.month.split(' de ');
          const [monthB, yearB] = b.month.split(' de ');
          const dateA = new Date(yearA, monthOrder[monthA.toLowerCase()]);
          const dateB = new Date(yearB, monthOrder[monthB.toLowerCase()]);
          return dateA - dateB;
        });
  
        setPendingPayments(pendingPayments);
        setFilteredPayments(pendingPayments);
      } catch (error) {
        console.error("Error al cargar los pagos pendientes: ", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadPendingPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedStudent, monthFilter]);

  const applyFilters = () => {
    let filtered = pendingPayments;

    if (selectedStudent) {
      filtered = filtered.filter(payment =>
        payment.studentName && payment.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
      );
    }

    if (monthFilter) {
      const filterMonth = monthFilter.getMonth() + 1;
      const filterYear = monthFilter.getFullYear();
      filtered = filtered.filter(payment => {
        const [month, year] = payment.month.split(' de ');
        const monthNumber = new Date(Date.parse(month + " 1, 2021")).getMonth() + 1;
        return parseInt(monthNumber) === filterMonth && parseInt(year) === filterYear;
      });
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (date) => {
    setMonthFilter(date);
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
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
      <Title>Pagos Pendientes</Title>
      <FilterSection>
        <SearchContainer>
          <SearchInput
            type="text"
            value={selectedStudent}
            onChange={handleStudentChange}
            placeholder="Filtrar por nombre..."
          />
          <SearchIcon />
        </SearchContainer>
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
      </FilterSection>
      <TableContainer>
        {currentPayments.length === 0 ? (
          <NoDataMessage>No hay pagos pendientes registrados en el sistema</NoDataMessage>
        ) : (
          <PaymentTable>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Celular</th>
                <th>Mes</th>
                <th>F. Pago</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.studentName}</td>
                  <td>{payment.studentPhone}</td>
                  <td>{payment.month}</td>
                  <td>{payment.paymentDate}</td>
                </tr>
              ))}
            </tbody>
          </PaymentTable>
        )}
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
      <TotalPaymentsMessage>Total de Pagos Pendientes Encontrados: {filteredPayments.length}</TotalPaymentsMessage>
      <BackButton onClick={onBack}>Volver</BackButton>
    </Wrapper>
  );
};

const NoDataMessage = styled.p`
  font-size: 18px;
  color: #333;
  text-align: center;
  margin-top: 20px;
`;

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
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(221, 221, 221, 1);
  overflow-x: auto;

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

  @media (max-width: 480px) {
    margin-top: 10px;
  }
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

const TotalPaymentsMessage = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 20px;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-top: 10px;
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

export default PendingPayments;