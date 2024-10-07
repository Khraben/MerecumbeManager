import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { fetchStudentDetails } from "../conf/firebaseService";
import Loading from "./Loading";

const StudentDetails = ({ isOpen, onClose, studentId }) => {
  const [student, setStudent] = useState(null);
  const [groupNames, setGroupNames] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchStudent = async () => {
        try {
          const { studentData, groupNames } = await fetchStudentDetails(studentId);
          setStudent(studentData);
          setGroupNames(groupNames);
        } catch (error) {
          console.error("Error fetching student details: ", error);
        }
      };

      fetchStudent();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  if (!student) {
    return <Loading />;
  }

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <h2>Detalles del Estudiante</h2>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </ModalHeader>
        <ModalBody>
            <DetailItem><strong>Nombre:</strong> {student.name}</DetailItem>
            <DetailItem><strong>Celular:</strong> {student.phone}</DetailItem>
            <DetailItem><strong>Correo:</strong> {student.email}</DetailItem>
            <DetailItem><strong>Género:</strong> {student.gender}</DetailItem>
            <DetailItem><strong>Contacto de Emergencia:</strong></DetailItem>
            <DetailItem>{student.emergencyName}</DetailItem>
            <DetailItem>{student.emergencyPhone}</DetailItem>
            <DetailItem><strong>Grupos:</strong></DetailItem>
            <GroupList>
              {groupNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </GroupList>
            <DetailItem><strong>Fecha de Pago:</strong> {student.paymentDate}</DetailItem>
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
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

const ModalContainer = styled.div`
  background-color: white;
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
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 20px;
    font-weight: bold;
    color: #0b0f8b;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #0b0f8b;

  &:hover {
    color: #073e8a;
  }

  &:focus {
    outline: none;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailItem = styled.p`
  margin-bottom: 2px;
  font-size: 16px;
  color: #333;
`;

const GroupList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 5px;
    font-size: 16px;
    color: #333;
  }
`;

export default StudentDetails;