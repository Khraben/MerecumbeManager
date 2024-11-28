import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { fetchEligibleStudentsForGroup } from "../firebase/firebaseFirestoreService";
import Loading from "./Loading";

const HelpModal = ({ groupId, onClose }) => {
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEligibleStudents = async () => {
      try {
        const students = await fetchEligibleStudentsForGroup(groupId);
        setEligibleStudents(students);
      } catch (error) {
        console.error("Error fetching eligible students:", error);
        setError("Error al cargar los estudiantes elegibles.");
      } finally {
        setLoading(false);
      }
    };

    loadEligibleStudents();
  }, [groupId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  const femaleStudents = eligibleStudents.filter(
    (student) => student.gender === "Mujer"
  );
  const maleStudents = eligibleStudents.filter(
    (student) => student.gender === "Hombre"
  );

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <Title>Alumnos Ayuda</Title>
          <SectionTitle>Mujeres</SectionTitle>
          {femaleStudents.length === 0 ? (
            <NoDataMessage>No hay mujeres que puedan ayudar</NoDataMessage>
          ) : (
            <StudentList>
              {femaleStudents.map((student) => (
                <StudentItem key={student.id}>
                  {student.name} - {student.phone}
                </StudentItem>
              ))}
            </StudentList>
          )}
          <SectionTitle>Hombres</SectionTitle>
          {maleStudents.length === 0 ? (
            <NoDataMessage>No hay hombres que puedan ayudar</NoDataMessage>
          ) : (
            <StudentList>
              {maleStudents.map((student) => (
                <StudentItem key={student.id}>
                  {student.name} - {student.phone}
                </StudentItem>
              ))}
            </StudentList>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const NoDataMessage = styled.p`
  font-size: 16px;
  color: #333;
  text-align: center;
  margin-top: 20px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
`;

const ModalContent = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;

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
  font-size: 20px;
  cursor: pointer;
  color: #333333;

  &:hover {
    color: #242424;
  }

  &:focus {
    outline: none;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 10px;
`;

const StudentList = styled.ul`
  list-style: none;
  padding: 0;
  color: #000;
`;

const StudentItem = styled.li`
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;

export default HelpModal;
