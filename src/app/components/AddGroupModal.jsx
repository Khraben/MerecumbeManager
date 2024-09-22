import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../conf/firebase";

const AddGroupModal = ({ isOpen, onClose }) => {
  const [instructor, setInstructor] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [level, setLevel] = useState("Nivel I");
  const [instructors, setInstructors] = useState([]);
  const [existingGroups, setExistingGroups] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
      fetchInstructors();
      fetchExistingGroups();
    } else {
      document.body.classList.remove("no-scroll");
      resetFields();
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  const fetchInstructors = async () => {
    const querySnapshot = await getDocs(collection(db, "instructors"));
    const instructorsData = querySnapshot.docs.map(doc => doc.data().name);
    setInstructors(instructorsData);
  };

  const fetchExistingGroups = async () => {
    const querySnapshot = await getDocs(collection(db, "groups"));
    const groupsData = querySnapshot.docs.map(doc => doc.data());
    setExistingGroups(groupsData);
  };

  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    setStartTime(selectedTime);
    const [hours, minutes, period] = selectedTime.match(/(\d+):(\d+)(\w+)/).slice(1);
    let endHours = parseInt(hours) + (period === "PM" && hours !== "12" ? 12 : 0);
    endHours += 1;
    let endMinutes = parseInt(minutes) + 30;
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }
    const endPeriod = endHours >= 12 ? "PM" : "AM";
    endHours = endHours > 12 ? endHours - 12 : endHours;
    setEndTime(`${endHours}:${endMinutes < 10 ? "0" : ""}${endMinutes}${endPeriod}`);
  };

  const handleDayChange = (e) => {
    setDay(e.target.value);
    setStartTime(""); // Reiniciar la selección de la hora de inicio
    setEndTime(""); // Reiniciar la selección de la hora de fin
  };

  const handleSave = async () => {
    if (!instructor || !day || !startTime) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");

    const newGroup = {
      instructor,
      day,
      startTime,
      endTime,
      level,
    };

    try {
      await addDoc(collection(db, "groups"), newGroup);
      resetFields();
      onClose();
    } catch (error) {
      setError("Error al agregar el grupo");
    }
  };

  const resetFields = () => {
    setInstructor("");
    setDay("");
    setStartTime("");
    setEndTime("");
    setLevel("Nivel I");
    setError("");
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const generateTimeOptions = () => {
    const times = [];
    const startHour = 9;
    const endHour = 19;
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const time = `${displayHour}:${minute === 0 ? "00" : minute}${period}`;
        times.push(time);
      }
    }
    return times;
  };

  const convertTo24HourFormat = (time) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)(\w+)/).slice(1);
    let hours24 = parseInt(hours);
    if (period === "PM" && hours !== "12") {
      hours24 += 12;
    }
    if (period === "AM" && hours === "12") {
      hours24 = 0;
    }
    return `${hours24}:${minutes}`;
  };

  const isTimeDisabled = (time) => {
    const selectedTime24 = convertTo24HourFormat(time);
    const [selectedHours, selectedMinutes] = selectedTime24.split(":").map(Number);

    return existingGroups.some(group => {
      if (group.day !== day) return false;

      const groupStart24 = convertTo24HourFormat(group.startTime);
      const groupEnd24 = convertTo24HourFormat(group.endTime);
      const [groupStartHours, groupStartMinutes] = groupStart24.split(":").map(Number);
      const [groupEndHours, groupEndMinutes] = groupEnd24.split(":").map(Number);

      const selectedTimeInMinutes = selectedHours * 60 + selectedMinutes;
      const groupStartTimeInMinutes = groupStartHours * 60 + groupStartMinutes;
      const groupEndTimeInMinutes = groupEndHours * 60 + groupEndMinutes;

      return selectedTimeInMinutes >= groupStartTimeInMinutes && selectedTimeInMinutes < groupEndTimeInMinutes;
    });
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <h2>Agregar Nuevo Grupo</h2>
        </ModalHeader>
        <ModalBody>
          <Form>
            <label>Instructor</label>
            <Select value={instructor} onChange={handleInputChange(setInstructor)}>
              <option value="">Seleccione un instructor</option>
              {instructors.map((inst, index) => (
                <option key={index} value={inst}>{inst}</option>
              ))}
            </Select>
            <label>Día y Horario</label>
            <Select value={day} onChange={handleDayChange}>
              <option value="">Seleccione un día</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </Select>
            <Select value={startTime} onChange={handleStartTimeChange} disabled={!day}>
              <option value="">Seleccione una hora</option>
              {generateTimeOptions().map((time, index) => (
                <option key={index} value={time} disabled={isTimeDisabled(time)}>{time}</option>
              ))}
            </Select>
            <Input type="text" value={endTime} readOnly />
            <label>Nivel</label>
            <Select value={level} onChange={handleInputChange(setLevel)}>
              <option value="Nivel I">Nivel I</option>
              <option value="Nivel II">Nivel II</option>
              <option value="Nivel III">Nivel III</option>
              <option value="Nivel IV">Nivel IV</option>
            </Select>
          </Form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={() => { resetFields(); onClose(); }}>Cancelar</CancelButton>
          <SaveButton onClick={handleSave}>Guardar</SaveButton>
        </ModalFooter>
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
  max-height: 60vh; /* Tamaño máximo del modal */
  overflow-y: auto; /* Scrollbar cuando el contenido excede el tamaño */
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

const Select = styled.select`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  outline: none;

  &:focus {
    border-color: #0b0f8b;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
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
  color: #fff;
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
  color: #fff;
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

export default AddGroupModal;