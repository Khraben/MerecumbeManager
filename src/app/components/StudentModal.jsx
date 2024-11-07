import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaPlus, FaTimes } from "react-icons/fa";
import { fetchGroups, addStudent, fetchStudentById, updateStudent, fetchStudentGroupsByStudentId } from "../firebase/firebaseFirestoreService";
import { TextInput, ComboBox, NumberInput } from './Input';
import Loading from "./Loading";

export default function StudentModal({ isOpen, onClose, onStudentAdded, studentId }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("");
  const [additionalGroups, setAdditionalGroups] = useState([]);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [gender, setGender] = useState(""); 
  const [paymentDate, setPaymentDate] = useState(""); 
  const [error, setError] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
      fetchGroupsData();
      if (studentId) {
        fetchStudentData(studentId);
      }
    } else {
      document.body.classList.remove("no-scroll");
      resetFields();
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen, studentId]);

  const fetchGroupsData = async () => {
    try {
      const groupsData = await fetchGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchStudentData = async (id) => {
    try {
      const studentData = await fetchStudentById(id);
      const studentGroups = await fetchStudentGroupsByStudentId(id);
      setName(studentData.name);
      setPhone(studentData.phone);
      setEmail(studentData.email);
      setGroup(studentGroups[0] || "");
      setAdditionalGroups(studentGroups.slice(1));
      setEmergencyName(studentData.emergencyName);
      setEmergencyPhone(studentData.emergencyPhone);
      setGender(studentData.gender || ""); 
      setPaymentDate(studentData.paymentDate || ""); 
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const handleSave = async () => {
    if (!name || !phone || !email || !emergencyName || !emergencyPhone || !gender || !paymentDate || additionalGroups.includes("")) {
      setError("Todos los campos son requeridos.");
      return;
    }
    if (phone.length !== 9 || emergencyPhone.length !== 9) {
      setError("Formato del teléfono inválido");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.includes(' ')) {
      setError("El correo electrónico no debe contener espacios.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (isNaN(paymentDate) || paymentDate < 1 || paymentDate > 30) {
      setError("Por favor ingresa una fecha de pago válida (1-30).");
      return;
    }
    setError("");
  
    const primaryGroup = group === "" ? "INACTIVO" : group;
  
    const studentData = {
      name,
      phone,
      email,
      emergencyName,
      emergencyPhone,
      gender,
      paymentDate, 
      groups: [primaryGroup, ...additionalGroups],
    };
  
    studentData.groups = studentData.groups.filter(g => g !== "INACTIVO");
  
    studentData.groups.sort((a, b) => {
      const groupA = groups.find(g => g.id === a);
      const groupB = groups.find(g => g.id === b);
      return new Date(groupA.startDate) - new Date(groupB.startDate);
    });
  
    setLoading(true);
    try {
      if (studentId) {
        await updateStudent(studentId, studentData);
      } else {
        await addStudent(studentData);
      }
      resetFields();
      onClose();
      if (onStudentAdded) {
        onStudentAdded(studentData);
      }
    } catch (error) {
      setError("Error al guardar estudiante.");
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    setName("");
    setPhone("");
    setEmail("");
    setGroup("");
    setAdditionalGroups([]);
    setEmergencyName("");
    setEmergencyPhone("");
    setGender(""); 
    setPaymentDate(""); 
    setError("");
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const handleGroupChange = (e) => {
    const value = e.target.value;
    setGroup(value);
    setError("");
    if (value === "INACTIVO") {
      setAdditionalGroups([]);
    }
  };

  const handleAddGroup = (e) => {
    e.preventDefault();
    if (group && group !== "INACTIVO" && !additionalGroups.includes("")) {
      setAdditionalGroups([...additionalGroups, ""]);
    } else {
      setError("Debe seleccionar un grupo en todos los campos antes de agregar uno nuevo.");
    }
  };

  const handleRemoveGroup = (index) => {
    const newGroups = additionalGroups.filter((_, i) => i !== index);
    setAdditionalGroups(newGroups);
  };

  const handleAdditionalGroupChange = (index, value) => {
    const newGroups = [...additionalGroups];
    newGroups[index] = value;
    setAdditionalGroups(newGroups);
    setError("");
  };

  const isGroupSelected = (groupValue) => {
    return [group, ...additionalGroups].includes(groupValue);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  const handlePhoneChange = (setter) => (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setter(formattedValue);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        {loading ? (
          <Loading />
        ) : (
          <>
            <ModalHeader>
              <h2>{studentId ? "Editar Alumno" : "Agregar Nuevo Alumno"}</h2>
            </ModalHeader>
            <ModalBody>
              <Form>
                <label>Información de Alumno</label>
                <TextInput
                  id="name"
                  placeholder="Nombre y Apellido"
                  value={name}
                  onChange={handleInputChange(setName)}
                />
                <TextInput
                  id="phone"
                  placeholder="Celular"
                  value={phone}
                  onChange={handlePhoneChange(setPhone)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength="9"
                />
                <TextInput
                  id="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                />
                <ComboBox id="gender" placeholder="Género" value={gender} onChange={handleInputChange(setGender)}>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </ComboBox>
                <NumberInput
                  id="paymentDate"
                  placeholder="Fecha de Pago"
                  value={paymentDate}
                  onChange={handleInputChange(setPaymentDate)}
                  min="1"
                  max="30"
                />
                <label>Contacto de Emergencia</label>
                <TextInput
                  id="emergencyName"
                  placeholder="Nombre y Apellido"
                  value={emergencyName}
                  onChange={handleInputChange(setEmergencyName)}
                />
                <TextInput
                  id="emergencyPhone"
                  placeholder="Celular"
                  value={emergencyPhone}
                  onChange={handlePhoneChange(setEmergencyPhone)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength="9"
                />            
                <label>Grupos</label>
                <GroupContainer>
                  <ComboBox id="group" value={group} onChange={handleGroupChange}>
                    <option value="INACTIVO">INACTIVO</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id} disabled={isGroupSelected(group.id)}>
                        {group.level + ' - ' + group.name}
                      </option>
                    ))}
                  </ComboBox>
                  <AddGroupButton onClick={handleAddGroup} disabled={!group || group === "INACTIVO" || additionalGroups.includes("")}><FaPlus /></AddGroupButton>
                </GroupContainer>
                {additionalGroups.map((additionalGroup, index) => (
                  <GroupContainer key={index}>
                    <ComboBox id={`additionalGroup-${index}`} value={additionalGroup} onChange={(e) => handleAdditionalGroupChange(index, e.target.value)}>
                      <option value="">Seleccione un grupo</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id} disabled={isGroupSelected(group.id)}>
                          {group.level + ' - '+ group.name}
                        </option>
                      ))}
                    </ComboBox>
                    <RemoveGroupButton onClick={() => handleRemoveGroup(index)} disabled={index !== additionalGroups.length - 1}><FaTimes /></RemoveGroupButton>
                  </GroupContainer>
                ))}
              </Form>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => { resetFields(); onClose(); }}>Cancelar</CancelButton>
              <SaveButton onClick={handleSave}>Guardar</SaveButton>
            </ModalFooter>
          </>
        )}
      </ModalContainer>
    </Overlay>
  );
}

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
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
  }
`;

const ModalHeader = styled.div`
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

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const GroupContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  min-height: 40px; 

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AddGroupButton = styled.button`
  background-color: #0b0f8b;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 10px; 
  margin-top: -11px;
  height: 38px; 
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #073e8a;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
    width: 100%;
    margin-left: 0; 
  }
`;

const RemoveGroupButton = styled.button`
  background-color: #e74c3c;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: -11px;
  height: 38px; 
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #c0392b;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
    width: 100%;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const CancelButton = styled.button`
  background-color: #999;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #6b6b6b;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }
`;

const SaveButton = styled.button`
  background-color: #0b0f8b;
  color: #dddddd;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #073e8a;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px;
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