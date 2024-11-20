"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import StudentModal from "../components/StudentModal";
import StudentDetails from "../components/StudentDetails";
import Loading from "../components/Loading";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  fetchStudents,
  deleteStudent,
  fetchGroupsByIds,
  fetchStudentGroupsByStudentId,
} from "../firebase/firebaseFirestoreService";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      const studentsData = await fetchStudents();
      const studentsWithLevels = await Promise.all(
        studentsData.map(async (student) => {
          const groupIds = await fetchStudentGroupsByStudentId(student.id);
          const groups = await fetchGroupsByIds(groupIds);
          const highestLevel = getHighestLevel(groups);
          return { ...student, highestLevel };
        })
      );
      setStudents(studentsWithLevels);
    } catch (error) {
      console.error("Error fetching students: ", error);
    }
    setLoading(false);
  };

  const handleOpenModal = (studentId = null) => {
    setEditingStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchStudentsData();
  };

  const handleViewStudentDetails = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleCloseDetailsModal = () => {
    setSelectedStudentId(null);
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(studentToDelete.id);
      fetchStudentsData();
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };

  const handleOpenConfirmation = (student) => {
    setStudentToDelete(student);
    setIsConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setStudentToDelete(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const levelsOrder = [
    "Nivel I",
    "Nivel II-A",
    "Nivel II-B",
    "Nivel III-1",
    "Nivel III-2",
    "Nivel III-3",
    "Nivel IV",
    "Taller",
  ];

  const getHighestLevel = (groups) => {
    let highestLevelIndex = -1;
    groups.forEach((group) => {
      const levelIndex = levelsOrder.indexOf(group.level);
      if (levelIndex > highestLevelIndex) {
        highestLevelIndex = levelIndex;
      }
    });
    return highestLevelIndex !== -1
      ? levelsOrder[highestLevelIndex]
      : "INACTIVO";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <Title>Lista General de Alumnos</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Filtrar por nombre de alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ClearButton onClick={handleClearSearch}>
            <FaTimes />
          </ClearButton>
        )}
        <SearchIcon />
      </SearchContainer>
      <TableContainer>
        {filteredStudents.length === 0 ? (
          <NoDataMessage>
            No hay alumnos registrados en el sistema
          </NoDataMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Celular</th>
                <th>Nivel</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.phone}</td>
                  <td>{student.highestLevel}</td>
                  <td>
                    <InfoIcon
                      onClick={() => handleViewStudentDetails(student.id)}
                    />
                    <EditIcon onClick={() => handleOpenModal(student.id)} />
                    <DeleteIcon
                      onClick={() => handleOpenConfirmation(student)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
      <AddButton onClick={() => handleOpenModal()}>Agregar Alumno</AddButton>
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        studentId={editingStudentId}
      />
      <StudentDetails
        isOpen={!!selectedStudentId}
        onClose={handleCloseDetailsModal}
        studentId={selectedStudentId}
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleDeleteStudent}
        message={`¿Estás seguro de que deseas eliminar al alumno "${studentToDelete?.name}"?`}
      />
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

const AddButton = styled.button`
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

  th,
  td {
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
    th,
    td {
      font-size: 12px;
      padding: 12px 15px;
    }
  }

  @media (max-width: 480px) {
    th,
    td {
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
  position: relative;
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

const InfoIcon = styled(FaInfoCircle)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 20px;

  &:hover {
    color: #073e8a;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const EditIcon = styled(FaEdit)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 20px;
  margin-right: 10px;
  margin-left: 10px;

  &:hover {
    color: #073e8a;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const DeleteIcon = styled(FaTrash)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    color: #ff0000;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 50px;
  top: 10px;
  background: none;
  border: none;
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 480px) {
    right: 45px;
    font-size: 16px;
  }
`;
