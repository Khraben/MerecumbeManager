import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { fetchStudentDetails } from "../conf/firebaseService";
import Loading from "./Loading";

const StudentDetails = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null);
  const [groupNames, setGroupNames] = useState([]);

  useEffect(() => {
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
  }, [studentId]);

  if (!student) {
    return <Loading />;
  }

  return (
    <DetailsWrapper>
      <BackButton onClick={onBack}>
        <FaArrowLeft /> Volver
      </BackButton>
      <DetailsContainer>
        <h2>Detalles del Estudiante</h2>
        <p><strong>Nombre:</strong> {student.name}</p>
        <p><strong>Celular:</strong> {student.phone}</p>
        <p><strong>Correo:</strong> {student.email}</p>
        <p><strong>Contacto de Emergencia:</strong> {student.emergencyName}</p>
        <p><strong>Teléfono de Emergencia:</strong> {student.emergencyPhone}</p>
        <p><strong>Grupos:</strong></p>
        <GroupList>
          {groupNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </GroupList>
      </DetailsContainer>
    </DetailsWrapper>
  );
};

const DetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
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

const DetailsContainer = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 20px;
    color: #0b0f8b;
  }

  p {
    margin-bottom: 10px;
    font-size: 16px;
    color: #333;
  }
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