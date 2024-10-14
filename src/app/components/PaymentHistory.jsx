import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchReceipts, fetchStudentById } from "../conf/firebaseService";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es"; 
import "react-datepicker/dist/react-datepicker.css";
import Loading from "./Loading"; 

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [selectedMonth, setselectedMonth] = useState(null);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [paymentsPerPage] = useState(10); // Cantidad de pagos por página
  useEffect(() => {
    const loadPayments = async () => {
    setLoading(true); // Iniciar la carga
      try {
        const allPayments = await fetchReceipts();
        // Obtener los nombres de los estudiantes
        const paymentsWithStudentNames = await Promise.all(allPayments.map(async (payment) => {
          const studentData = await fetchStudentById(payment.studentId);
          return {
            ...payment,
            studentName: studentData.name
          };
        }));
        setPayments(paymentsWithStudentNames);
        setFilteredPayments(paymentsWithStudentNames); // Inicialmente mostrar todos los pagos
      } catch (error) {
        console.error("Error al cargar los pagos: ", error);
      }finally{
        setLoading(false); // Finalizar la carga
      }
    };

    loadPayments();
  }, []);
  // Filtrar pagos cuando se cambian los filtros de alumno o fecha
  useEffect(() => {
      let filtered = payments;
      // Filtro por nombre del alumno
      if (selectedStudent) {
        filtered = filtered.filter(payment => 
          payment.studentName && payment.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
        );
      }
      // Filtro por concepto
      if (selectedConcept) {
        filtered = filtered.filter(payment => 
          payment.concept && payment.concept.toLowerCase().includes(selectedConcept.toLowerCase())
        );
      }
     // Filtro por fecha seleccionada
    if (selectedMonth) {
        const selectedDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), selectedMonth.getDate());
        filtered = filtered.filter(payment => {
        const paymentDate = payment.paymentDate && payment.paymentDate.toDate ? payment.paymentDate.toDate() : new Date(payment.paymentDate);
        return paymentDate.toDateString() === selectedDate.toDateString();
    });
  }
      setFilteredPayments(filtered);
      setCurrentPage(1);
    }, [selectedStudent, selectedConcept, selectedMonth, payments]);


    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
    // Calcular el número de páginas
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
    const nextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };
    const prevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
    if (loading) {
        return <Loading />; // Mostrar el spinner mientras se carga
      }
  return (
    <Wrapper>
      <Title>Historial de Pagos</Title>
      {/* Filtros */}
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
      {/* Tabla de pagos */}
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
              <td>{payment.specification? payment.specification:"sin detalles"}</td>
              <td>{payment.concept}</td>
              <td>{payment.amount}</td>
              <td>{payment.receiptNumber}</td>
            </tr>
          ))}
        </tbody>
      </PaymentTable>
      {/* Paginación */}
      <Pagination>
        <button onClick={prevPage} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Siguiente</button>
      </Pagination>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
`;
const Pagination = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  button {
    padding: 10px;
    margin: 0 5px;
    cursor: pointer;
    &:disabled {
      background-color: #ddd;
      cursor: not-allowed;
    }
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
const PaymentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }
  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;
const Title = styled.h1`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-align: center;
`;
const StyledDatePicker = styled(DatePicker)`
  padding: 5px;
  margin-left: 5px;
`;
export default PaymentHistory;