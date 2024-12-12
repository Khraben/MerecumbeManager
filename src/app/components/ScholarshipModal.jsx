import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  fetchStudents,
  fetchStudentById,
  fetchScholarshipStudents,
  addScholarshipStudent,
  deleteScholarshipStudent,
} from "../firebase/firebaseFirestoreService";
import { TextInput } from "./Input";
import { FaUserPlus, FaUserTimes, FaTimes } from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";
import Loading from "./Loading";

const ScholarshipModal = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState([]);
  const [scholarshipStudents, setScholarshipStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      const studentsData = await fetchStudents();
      setStudents(studentsData);
      setIsLoading(false);
    };

    const loadScholarshipStudents = async () => {
      setIsLoading(true);
      const scholarshipStudentsData = await fetchScholarshipStudents();
      const detailedScholarshipStudentsData = await Promise.all(
        scholarshipStudentsData.map(async ({ studentId, dateAdded }) => {
          const student = await fetchStudentById(studentId);
          return { id: studentId, name: student.name, dateAdded };
        })
      );
      setScholarshipStudents(detailedScholarshipStudentsData);
      setIsLoading(false);
    };

    if (isOpen) {
      loadStudents();
      loadScholarshipStudents();
      setSelectedStudentId("");
    }
  }, [isOpen]);

  const handleAddScholarshipStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Por favor, seleccione un alumno.");
      return;
    }
    try {
      setIsLoading(true);
      await addScholarshipStudent(selectedStudentId);
      const student = await fetchStudentById(selectedStudentId);
      const currentDate = new Date();
      const formattedDate = `${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${currentDate.getFullYear()}`;
      setScholarshipStudents([
        ...scholarshipStudents,
        { id: selectedStudentId, name: student.name, dateAdded: formattedDate },
      ]);
      setSelectedStudentId("");
      setError("");
    } catch (error) {
      setError("Error al agregar alumno a la lista de becados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScholarshipStudent = async () => {
    try {
      await deleteScholarshipStudent(studentToDelete.id);
      setScholarshipStudents(
        scholarshipStudents.filter(
          (student) => student.id !== studentToDelete.id
        )
      );
      setStudentToDelete(null);
      setIsConfirmModalOpen(false);
    } catch (error) {
      setError("Error al eliminar alumno de la lista de becados.");
    }
  };

  const handleInputChange = (e) => {
    setSelectedStudentId(e.target.value);
    setError("");
  };

  const availableStudents = students.filter(
    (student) =>
      !scholarshipStudents.some(
        (scholarshipStudent) => scholarshipStudent.id === student.id
      )
  );

  if (!isOpen) return null;

  return (
    <>
      {isLoading && <Loading />} {/* Conditionally render Loading component */}
      <Overlay isOpen={isOpen}>
        <ModalContainer>
          <ModalHeader>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <Title>Administrar Alumnos Becados</Title>
            <Form onSubmit={handleAddScholarshipStudent}>
              <TextInput
                as="select"
                value={selectedStudentId}
                onChange={handleInputChange}
                placeholder="Seleccionar Alumno"
              >
                <option value="">Seleccionar Alumno</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </TextInput>
              <AddButton type="submit">
                <FaUserPlus />
              </AddButton>
            </Form>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ScholarshipList>
              {scholarshipStudents.map((student) => (
                <ScholarshipItem key={student.id}>
                  {student.name} (Desde: {student.dateAdded})
                  <DeleteButton
                    onClick={() => {
                      setStudentToDelete(student);
                      setIsConfirmModalOpen(true);
                    }}
                  >
                    <FaUserTimes />
                  </DeleteButton>
                </ScholarshipItem>
              ))}
            </ScholarshipList>
          </ModalBody>
        </ModalContainer>
      </Overlay>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteScholarshipStudent}
        message={`¿Estás seguro de que deseas eliminar a "${studentToDelete?.name}" como alumno becado?`}
      />
    </>
  );
};

const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1002;
`;

const ModalContainer = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  background-color: #dddddd;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1003;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
    margin-left: 20px;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
    margin-left: 45px;
    margin-right: 5px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333333;

  &:hover {
    color: #242424;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333333;
  margin-bottom: 40px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #333333;
  cursor: pointer;
  font-size: 20px;

  &:hover {
    color: #242424;
  }

  &:focus {
    outline: none;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 20px;

  &:hover {
    color: #cc0000;
  }

  &:focus {
    outline: none;
  }
`;

const ScholarshipList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ScholarshipItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 6px;
    font-size: 12px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export default ScholarshipModal;
