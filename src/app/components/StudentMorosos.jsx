import styled from 'styled-components';
import Loading from "./Loading"; 
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchStudents, fetchAttendancesByStudent,fetchReceiptsByStudentAndMonth } from "../conf/firebaseService";

const StudentMoroso = ({onBack}) => {
    const [StudentMorosos, setStudentMorosos] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [MonthMorosos, setMonth] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const getSpanishMonthName = (monthNumber) => {
      const months = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      return months[monthNumber - 1];
    };
  const getCurrentMonthYear = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth(-1);
    const year = currentDate.getFullYear();
    const monthName = getSpanishMonthName(month);
    setMonth(monthName);
    const monthYear = `${monthName} de ${year}`;
    return monthYear;
  };
    useEffect(() => {
        const loadPayments = async () => {
          setLoading(true); 
          try {
            const mesConsulta = getCurrentMonthYear();
            const allStudents = await fetchStudents();
            const studentsWithVerification = await Promise.all(allStudents.map(async (student) => {
              const studentAsistencia = await fetchAttendancesByStudent(student.id, mesConsulta);
              const hasAssis = Object.keys(studentAsistencia).length > 0;
              return {
                ...student,
                hasAssis,
              };
            }));
          const allStudentConAsistencia = studentsWithVerification.filter(student => student.hasAssis);
          const CheckPaidStudents= await Promise.all(allStudentConAsistencia.map(async (student) => {
            const studentPayments = await fetchReceiptsByStudentAndMonth(student.id, mesConsulta);
            const hasPaid = Object.keys(studentPayments).length > 0;
            return {
              ...student,
              hasPaid,
            };
            }));
          const StudentPendientePago = CheckPaidStudents.filter(student => !student.hasPaid);
          setStudentMorosos(StudentPendientePago);
          } catch (error) {
            console.error("Error al cargar: ", error);
          } finally {
            setLoading(false); 
          }
        };
        loadPayments();
      }, []);

    if (loading) {
        return <Loading />;
      }
      const filteredStudents = StudentMorosos.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return (
        <Wrapper>
          <Title>Lista de alumnos pendientes de pago</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Filtrar por nombre de alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon />
          </SearchContainer>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Celular</th>
                  <th>Mes</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.phone}</td>
                    <td>{MonthMorosos}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
          <BackButton onClick={onBack}>Volver</BackButton>
        </Wrapper>
      );
}
export default StudentMoroso;
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;
  
  @media (max-width: 480px) {
    padding: 30px;
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
const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
  background-color: rgba(221, 221, 221, 1);

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;
const Table = styled.table`
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
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  margin-bottom: 20px;
`;
const SearchInput = styled.input`
  width: 95%;
  padding: 10px 15px;
  font-size: 14px;
  border: 2px solid #0b0f8b;
  border-radius: 5px;
  outline: none;
  background-color: transparent;

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;
const SearchIcon = styled(FaSearch)`
  margin-left: -35px;
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;

  @media (max-width: 480px) {
    font-size: 16px;
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