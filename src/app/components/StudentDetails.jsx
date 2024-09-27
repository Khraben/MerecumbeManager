import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../conf/firebase";
import Loading from "./Loading";
import updateStudent  from "../StudentList/StudentEdit";

const StudentDetails = ({ studentId, onBack, isEditing}) => {
  const [student, setStudent] = useState(null);
  const [groupNames, setGroupNames] = useState([]);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState(""); 
  useEffect(() => {
    const fetchStudent = async () => {
      const docRef = doc(db, "students", studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const studentData = docSnap.data();
        setStudent(studentData);
        if (isEditing === true) {
          setEditData(studentData);
        } // Se inicializa con los datos del estudiante
        fetchGroupNames(studentData.groups);
      } else {
        console.log("No such document!");
      }
    };
    const fetchGroupNames = async (groupKeys) => {
      const groupNamesPromises = groupKeys.map(async (key) => {
        const groupDocRef = doc(db, "groups", key);
        const groupDocSnap = await getDoc(groupDocRef);
        return groupDocSnap.exists() ? groupDocSnap.data().name : "Desconocido";
      });

      const names = await Promise.all(groupNamesPromises);
      setGroupNames(names);
    };

    fetchStudent();
  }, [studentId]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name ==='phone'){
        const formattedValue = formatPhoneNumber(value);
        setEditData({
          ...editData,
          [name]: formattedValue,
        });
    }else{
        setEditData({
          ...editData,
          [name]: value,
     })
  };
  };
  const formatPhoneNumber = (value) => {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  const handleSave = async () => {
    if (!editData.name || !editData.phone || !editData.email) {
      setError("Todos los campos son requeridos.");
      return;
    }
    if (editData.phone.length  !== 9){
      setError("Formato del teléfono inválido");
      return;
    }
    // Validación de formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Verificar si hay espacios en la entrada
    if (editData.email.includes(' ')) {
      setError("El correo electrónico no debe contener espacios.");
      return;
    }

    if (!emailRegex.test(editData.email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
     // Llamar a la función de actualización en Firebase
     const success = await updateStudent(editData, studentId);
     setError(success ? "" : "Ocurrió un error al guardar los cambios.");
  };
  if (!student) {
    return <Loading />;
  }
  return (
    <DetailsWrapper>
      <BackButton onClick={onBack}>
        <FaArrowLeft /> Volver
      </BackButton>
      <DetailsContainer>
        <h2>{isEditing ? "Editar Estudiante" : "Detalles del Estudiante"}</h2>
        <p>
          <strong>Nombre:</strong>{" "}
          {isEditing ? (
            <Input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleInputChange}
            />
          ) : (
            student.name
          )}
        </p>
        <p>
          <strong>Celular:</strong>{" "}
          {isEditing ? (
            <Input
              type="text"
              name="phone"
              value={editData.phone}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              maxLength="9"
            />
          ) : (
            student.phone
          )}
        </p>
        <p>
          <strong>Correo:</strong>{" "}
          {isEditing ? (
            <Input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleInputChange}
            />
          ) : (
            student.email
          )}
        </p>
       
        <p><strong>Grupos:</strong></p>
        <GroupList>
          {groupNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </GroupList>
  
        {isEditing && (
           <>
          <AddButton onClick= {handleSave}>Guardar Cambios</AddButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
        )}
      </DetailsContainer>
    </DetailsWrapper>
  );
};
const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;
const Input = styled.input`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #0b0f8b;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
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