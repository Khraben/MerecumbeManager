import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaVenusMars, FaUsers, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import { fetchStudentDetails } from "../conf/firebaseService";
import Loading from "./Loading";

const StudentDetails = ({ isOpen, onClose, studentId }) => {
  const [student, setStudent] = useState(null);
  const [groupDetails, setGroupDetails] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchStudent = async () => {
        try {
          const { studentData, groupDetails } = await fetchStudentDetails(studentId);
          setStudent(studentData);
          setGroupDetails(groupDetails);
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
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </ModalHeader>
        <ModalBody>
          <Title>INFORMACIÓN DE ALUMNO</Title>
          <Card>
            <FaUser />
            <DetailItem><strong>Nombre:</strong> {student.name}</DetailItem>
          </Card>
          <Card>
            <FaPhone />
            <DetailItem><strong>Celular:</strong> {student.phone}</DetailItem>
          </Card>
          <Card>
            <FaEnvelope />
            <DetailItem><strong>Correo:</strong> {student.email}</DetailItem>
          </Card>
          <Card>
            <FaVenusMars />
            <DetailItem><strong>Género:</strong> {student.gender}</DetailItem>
          </Card>
          <Card>
            <FaExclamationTriangle />
            <DetailItem><strong>Contacto de Emergencia:</strong></DetailItem>
            <DetailItem>{student.emergencyName}</DetailItem>
            <DetailItem>{student.emergencyPhone}</DetailItem>
          </Card>
          <Card>
            <FaUsers />
            <DetailItem><strong>Grupos:</strong></DetailItem>
            <GroupList>
              {groupDetails.map((group, index) => (
                <li key={index}>{group.name} ({group.level})</li>
              ))}
            </GroupList>
          </Card>
          <Card>
            <FaCalendarAlt />
            <DetailItem><strong>Fecha de Pago:</strong> {student.paymentDate}</DetailItem>
          </Card>
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
  width: 600px;
  height: 730px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto; 
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  justify-content: right;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
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
  gap: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 10px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Card = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    font-size: 24px;
    color: #0b0f8b;
  }
`;

const DetailItem = styled.p`
  margin: 0;
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