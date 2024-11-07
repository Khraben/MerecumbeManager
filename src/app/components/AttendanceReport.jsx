import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchAttendances, fetchStudentById, fetchGroupById, fetchGroups } from "../firebase/firebaseFirestoreService";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es"; 
import "react-datepicker/dist/react-datepicker.css";
import Loading from "./Loading"; 
import { FaArrowLeft, FaArrowRight, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const AttendanceReport = ({ onBack }) => {
  const [attendances, setAttendances] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEndDateDisabled, setIsEndDateDisabled] = useState(true);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const attendancesPerPage = 10;
  const maxPageButtons = 4;

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsData = await fetchGroups();
        setGroups(groupsData);
      } catch (error) {
        console.error("Error al cargar los grupos: ", error);
      }
    };

    const loadAttendances = async () => {
      setLoading(true); 
      try {
        const allAttendances = await fetchAttendances();
        const attendancesWithDetails = await Promise.all(allAttendances.map(async (attendance) => {
          let studentName = attendance.studentId;
          let groupName = attendance.groupId;

          try {
            const studentData = await fetchStudentById(attendance.studentId);
            studentName = studentData.name;
          } catch (error) {
            console.error(`Error al cargar los detalles del estudiante: `, error);
          }

          try {
            const groupData = await fetchGroupById(attendance.groupId);
            groupName = groupData.name;
          } catch (error) {
            console.error(`Error al cargar los detalles del grupo: `, error);
          }

          return {
            ...attendance,
            studentName,
            groupName,
            date: attendance.date instanceof Date ? attendance.date : attendance.date.toDate()
          };
        }));
        attendancesWithDetails.sort((a, b) => a.date - b.date);
        setAttendances(attendancesWithDetails);
        setFilteredAttendances(attendancesWithDetails);
      } catch (error) {
        console.error("Error al cargar las asistencias: ", error);
      } finally {
        setLoading(false); 
      }
    };
  
    loadGroups();
    loadAttendances();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedStudent, selectedGroup, startDate, endDate]);

  const applyFilters = () => {
    let filtered = attendances;

    if (selectedStudent) {
      filtered = filtered.filter(attendance => 
        attendance.studentName && attendance.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
      );
    }
    if (selectedGroup) {
      filtered = filtered.filter(attendance => attendance.groupId === selectedGroup);
    }
    if (startDate) {
      filtered = filtered.filter(attendance => {
        const attendanceDate = attendance.date;
        return attendanceDate >= startDate && (!endDate || attendanceDate <= new Date(endDate).setHours(23, 59, 59, 999));
      });
    }
    setFilteredAttendances(filtered);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setIsEndDateDisabled(!date);
    if (!date) {
      setEndDate(null);
    }
  };

  const indexOfLastAttendance = currentPage * attendancesPerPage;
  const indexOfFirstAttendance = indexOfLastAttendance - attendancesPerPage;
  const currentAttendances = filteredAttendances.slice(indexOfFirstAttendance, indexOfLastAttendance);
  const totalPages = Math.ceil(filteredAttendances.length / attendancesPerPage);
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
      <Title>Informe de Asistencias</Title>
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
          <SearchSelect
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Filtrar por grupo...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </SearchSelect>
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
      {currentAttendances.length === 0 ? (
          <NoDataMessage>No hay asistencias registradas en el sistema</NoDataMessage>
        ) : (
        <AttendanceTable>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Grupo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {currentAttendances.map((attendance, index) => (
              <tr key={index}>
                <td>{attendance.studentName}</td>
                <td>{attendance.groupName}</td>
                <td>{attendance.date.toLocaleDateString("es-CR")}</td>
              </tr>
            ))}
          </tbody>
        </AttendanceTable>
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
      <BackButton onClick={onBack}>Volver</BackButton>
    </Wrapper>
  );
}

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

const AttendanceTable = styled.table`
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

const SearchSelect = styled.select`
  width: 100%;
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

export default AttendanceReport;