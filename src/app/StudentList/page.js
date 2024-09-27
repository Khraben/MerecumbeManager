"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaInfoCircle, FaEdit, FaTrash} from "react-icons/fa";
import StudentModal from "../components/StudentModal";
import StudentDetails from "../components/StudentDetails";
import Loading from "../components/Loading"; 
import { collection, getDocs } from "firebase/firestore";
import { db } from "../conf/firebase";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentEdit, setSelectStudentEdit] = useState(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "students"));
    const studentsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
    studentsData.sort((a, b) => a.name.localeCompare(b.name));
    setStudents(studentsData);
    setLoading(false); 
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchStudents();
  };

  const handleViewStudentDetails = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleStudenEdit = (studentId) => {
    setSelectStudentEdit(studentId);
  };
  const handleBack = () => {
    setSelectedStudentId(null);
    setSelectStudentEdit(null);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  if (selectedStudentId) {
    return <StudentDetails  studentId={selectedStudentId} onBack={handleBack} isEditing={false} />;
  }
  if (selectedStudentEdit) {
    return <StudentDetails  studentId={selectedStudentEdit} onBack={handleBack} isEditing={true} />;
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
        <SearchIcon />
      </SearchContainer>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.phone}</td>
                <td>
                  <InfoIcon onClick={() => handleViewStudentDetails(student.id)} />
                  <EditIcon onClick={()  => handleStudenEdit(student.id)}/>
                  <DeleteIcon />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <AddButton onClick={handleOpenModal}>Agregar Alumno</AddButton>
      <StudentModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
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
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
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