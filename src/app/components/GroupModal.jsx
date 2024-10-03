import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { fetchInstructors, fetchExistingGroups, addGroup, updateGroup } from "../conf/firebaseService";

const GroupModal = ({ isOpen, onClose, group, mode, onGroupAdded }) => {
  const [instructor, setInstructor] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [level, setLevel] = useState("Nivel I");
  const [instructors, setInstructors] = useState([]);
  const [existingGroups, setExistingGroups] = useState([]);
  const [error, setError] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [startDate, setStartDate] = useState("");
 
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
      fetchInstructorsData();
      fetchExistingGroupsData();
      if (mode === "edit" && group) {
        setInstructor(group.instructor);
        setDay(group.day);
        setStartTime(group.startTime);
        setEndTime(group.endTime);
        setLevel(group.level);
        setWorkshopName(group.workshopName);
        setStartDate(group.startDate);
      }
    } else {
      document.body.classList.remove("no-scroll");
      resetFields();
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen, mode, group]);

  const fetchInstructorsData = async () => {
    const instructorsData = await fetchInstructors();
    setInstructors(instructorsData);
  };

  const fetchExistingGroupsData = async () => {
    const groupsData = await fetchExistingGroups();
    setExistingGroups(groupsData);
  };

  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    setStartTime(selectedTime);
    const [hours, minutes, period] = selectedTime.match(/(\d+):(\d+)(\w+)/).slice(1);
    let endHours = parseInt(hours) + (period === "pm" && hours !== "12" ? 12 : 0);
    endHours += 1;
    let endMinutes = parseInt(minutes) + 30;
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }
    const endPeriod = endHours >= 12 ? "pm" : "am";
    endHours = endHours > 12 ? endHours - 12 : endHours;
    setEndTime(`${endHours}:${endMinutes < 10 ? "0" : ""}${endMinutes}${endPeriod}`);
  };

  const handleDayChange = (e) => {
    setDay(e.target.value);
    setStartTime("");
    setEndTime(""); 
    setStartDate("");
  };

  const handleSave = async () => {
    if ((!instructor || instructor == "Seleccione un instructor") || !day || !startTime || !startDate || (level === "Taller" && !workshopName)) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");

    const name = level === "Taller" ? `Taller ${workshopName}` : `${day} ${startTime}`;

    const newGroup = {
      instructor,
      day,
      startTime,
      endTime,
      level,
      name,
      startDate,
    };

    try {
      if (mode === "edit") {
        await updateGroup(group.id, newGroup);
      } else {
        await addGroup(newGroup);
      }
      resetFields();
      onClose();
      if (onGroupAdded) {
        onGroupAdded();
      }
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
    setWorkshopName("");
    setError("");
    setStartDate("");
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
        const period = hour < 12 ? "am" : "pm";
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
    if (period === "pm" && hours !== "12") {
      hours24 += 12;
    }
    if (period === "am" && hours === "12") {
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

  const generateDateOptions = () => {
    if (!day) return [];
    const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return [];

    const dates = [];
    const today = new Date();
    let currentDate = new Date(today.setDate(today.getDate() + ((dayIndex - today.getDay() + 7) % 7)));

    for (let i = 0; i < 8; i++) {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      dates.push(`${day}/${month}/${year}`);
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return dates;
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <h2>{mode === "edit" ? "Editar Grupo" : "Agregar Nuevo Grupo"}</h2>
        </ModalHeader>
        <ModalBody>
          <Form>
            <label>Instructor</label>
            <Select value={instructor} onChange={handleInputChange(setInstructor)}>
              <option value="" disabled hidden>Seleccione un instructor</option>
              {instructors.map((inst, index) => (
                <option key={index} value={inst.id}>{inst.name}</option>
              ))}
            </Select>
            <label>Día y Horario</label>
            <Select value={day} onChange={handleDayChange}>
              <option value="" disabled hidden>Seleccione un día</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </Select>
            <Select value={startDate} onChange={handleInputChange(setStartDate)} disabled={!day}>
              <option value="">Fecha de inicio</option>
              {generateDateOptions().map((date, index) => (
                <option key={index} value={date}>{date}</option>
              ))}
            </Select>
            <Select value={startTime} onChange={handleStartTimeChange} disabled={!day}>
              <option value="">Hora de inicio</option>
              {generateTimeOptions().map((time, index) => (
                <option key={index} value={time} disabled={isTimeDisabled(time)}>{time}</option>
              ))}
            </Select>
            <Input type="text" value={endTime} placeholder="Hora de finalización" readOnly />
            <label>Nivel</label>
            <Select value={level} onChange={handleInputChange(setLevel)}>
              <option value="Nivel I">Nivel I</option>
              <option value="Nivel II">Nivel II</option>
              <option value="Nivel III">Nivel III</option>
              <option value="Nivel IV">Nivel IV</option>
              <option value="Taller">Taller</option>
            </Select>
            {level === "Taller" && (
              <Input
                type="text"
                placeholder="Nombre del Taller"
                value={workshopName}
                onChange={handleInputChange(setWorkshopName)}
              />
            )}
          </Form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={() => { resetFields(); onClose(); }}>Cancelar</CancelButton>
          <SaveButton onClick={handleSave}>{mode === "edit" ? "Guardar Cambios" : "Guardar"}</SaveButton>
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

export default GroupModal;