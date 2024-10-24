"use client";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { toPng } from "html-to-image";
import Image from "next/image";
import Loading from "../components/Loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es"; 
import { fetchStudents, fetchStudentEmail, fetchGroupsByIds, fetchLastReceiptNumber, addReceipt, fetchReceiptsByStudentAndConcept } from "../conf/firebaseService";
import axios from 'axios'; 

registerLocale("es", es);
setDefaultLocale("es");

export default function MakePayment() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("es-CR"));
  const [groups, setGroups] = useState([]);
  const [tallerGroups, setTallerGroups] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedConcept, setselectedConcept] = useState("");
  const [selectedTaller, setSelectedTaller] = useState("");
  const [specifiedMonth, setSpecifiedMonth] = useState(null); 
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [paidMonths, setPaidMonths] = useState([]);
  const receiptRef = useRef(null);

  const loadInitialData = async () => {
    setLoading(true);
    const studentsData = await fetchStudents();
    setStudents(studentsData);
    const lastReceiptNumber = await fetchLastReceiptNumber();
    setReceiptNumber(lastReceiptNumber + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const student = students.find(s => s.name === selectedStudent);
      if (student) {
        loadGroups(student.groups);
      }
    } else {
      setGroups([]);
      setTallerGroups([]);
      setAmount("");
    }
  }, [selectedStudent, selectedConcept]);

  const loadGroups = async (groupIds) => {
    const groupData = await fetchGroupsByIds(groupIds);
    const validGroups = groupData.filter(group => group.level !== "Taller");
    const tallerGroups = groupData.filter(group => group.level === "Taller");
    setGroups(validGroups.map(group => group.name));
    setTallerGroups(tallerGroups.map(group => group.name));

    const student = students.find(s => s.name === selectedStudent);
    if (student) {
      const receipts = await fetchReceiptsByStudentAndConcept(student.id, "Mensualidad");
      const paidMonths = receipts.map(receipt => {
        const date = new Date(receipt.specification);
        return { month: date.getMonth(), year: date.getFullYear() };
      });
      setPaidMonths(paidMonths);
    }
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
    setselectedConcept("");
    setSpecifiedMonth(null);
    setSelectedTaller("");
    setAmount("");
    setPaymentMethod("");
    handleInputChange();
  };

  const handleGenerateImage = async () => {
    if (!selectedStudent || !paymentMethod || !selectedConcept || !amount) {
      setErrorMessage("Por favor complete todos los campos.");
      return;
    }
    if (selectedConcept === "Mensualidad" && !specifiedMonth) {
      setErrorMessage("Por favor complete todos los campos.");
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmReceipt = async () => {
    try {
      if (receiptRef.current) {
        const dataUrl = await toPng(receiptRef.current);
        
        const student = students.find(s => s.name === selectedStudent);
        if (!student) {
          setErrorMessage("No se pudo encontrar el alumno.");
          return;
        }

        const studentEmail = await fetchStudentEmail(student.id); 
        if (!studentEmail) {
          setErrorMessage("No se pudo obtener el correo del alumno.");
          return;
        }

        const studentName = student.name.replace(/\s+/g, '');

        setLoading(true);
        await axios.post('/api/send-email', {
          email: studentEmail, 
          image: dataUrl.split(',')[1],
          studentName: studentName,
          receiptNumber: receiptNumber,
        });

        console.log('Correo enviado con éxito');
      }

      const receiptData = {
        studentId: students.find(s => s.name === selectedStudent).id,
        paymentDate: new Date(),
        specification: specifiedMonth ? specifiedMonth.toLocaleDateString("es-CR", { month: "long", year: "numeric" }) : selectedTaller,
        concept: selectedConcept,
        amount: `₡${amount}`,
        receiptNumber,
      };

      await addReceipt(receiptData);
      setLoading(false);
      setShowPreview(false);
      loadInitialData();
      setSelectedStudent("");
      setselectedConcept("");
      setSpecifiedMonth(null);
      setSelectedTaller("");
      setAmount("");
      setPaymentMethod("");
    } catch (error) {
      console.error('Error al confirmar y enviar el recibo:', error);
    }
  };

  const handleCancelReceipt = () => {
    setShowPreview(false);
  };

  const handleInputChange = () => {
    setErrorMessage("");
  };

  const formatAmount = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 5) {
      setAmount(formatAmount(value));
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setselectedConcept(value);
    handleInputChange();
    if (value === "Clases Privadas" || value === "Taller" || value === "") {
      setGroups([]);
      setAmount("");
    }
  };

  const isMonthDisabled = (date) => {
    return paidMonths.some(paidMonth => 
      paidMonth.month === date.getMonth() && paidMonth.year === date.getFullYear()
    );
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
    <Wrapper>
      <Title>Registrar Pago</Title>
      <Receipt ref={receiptRef}>
        <ReceiptHeader>
          <LogoContainer>
            <Image src={"/logo.svg"} alt="Logo" width={100} height={100} draggable= "false"/>
          </LogoContainer>
          <h2>Recibo de Pago Provisional  #{receiptNumber}</h2>
          <p>Fecha: {date}</p>
        </ReceiptHeader>
        <ReceiptBody>
          <Label>Alumno</Label>
          <Select value={selectedStudent} onChange={handleStudentChange}>
            <option value="">Seleccione un alumno</option>
            {students.map((student, index) => (
              <option key={index} value={student.name}>{student.name}</option>
            ))}
          </Select>
          <Label>Por concepto de</Label>
          <Select value={selectedConcept} onChange={handleMonthChange} disabled={!selectedStudent}>
            <option value="">Seleccione una opción...</option>
            {groups.length > 0 && groups[0] !== "Grupo no encontrado" && <option value="Mensualidad">Mensualidad</option>}
            <option value="Clases Privadas">Clases Privadas</option>
            {tallerGroups.length > 0 && <option value="Taller">Taller</option>}
          </Select>

          {selectedConcept === "Mensualidad" && (
            <>
              <Label>Grupos</Label>
              <GroupList>
                {groups.map((group, index) => (
                  <GroupItem key={index}>{group}</GroupItem>
                ))}
              </GroupList>
              <Label>Detalle</Label>
              <StyledDatePicker
                selected={specifiedMonth}
                onChange={(date) => setSpecifiedMonth(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="es"
                placeholderText="Seleccionar mes y año"
                filterDate={(date) => !isMonthDisabled(date)}
              />
            </>
          )}

          {selectedConcept === "Taller" && (
            <>
              <Label>Detalle</Label>
              <Select value={selectedTaller} onChange={(e) => setSelectedTaller(e.target.value)}>
                <option value="">Seleccione un taller...</option>
                {tallerGroups.map((taller, index) => (
                  <option key={index} value={taller}>{taller}</option>
                ))}
              </Select>
            </>
          )}

          <Label>Monto</Label>
          <Input 
            type="text" 
            value={`₡${amount}`} 
            onChange={handleAmountChange} 
          />

          <Label>Forma de Pago</Label>
          <Select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); handleInputChange(); }}>
            <option value="">Seleccione una forma de pago</option>
            <option value="SINPE">SINPE</option>
            <option value="Efectivo">Efectivo</option>
          </Select>
        </ReceiptBody>
        <Description>
          ❖ La factura electronica será enviado luego a su Email o WhatsApp
        </Description>
      </Receipt>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <ButtonContainer>
        <GenerateButton onClick={handleGenerateImage}>Generar Recibo</GenerateButton>
      </ButtonContainer>

      {showPreview && (
          <Modal>
            <ModalContent>
              <Receipt ref={receiptRef}>
                <ReceiptHeader>
                  <LogoContainer>
                    <Image src={"/logo.svg"} alt="Logo" width={100} height={100} draggable= "false"/>
                  </LogoContainer>
                  <h2>Recibo de Pago Provisional  #{receiptNumber}</h2>
                  <p>Fecha: {date}</p>
                </ReceiptHeader>
                <ReceiptBody>
                  <Label>Alumno</Label>
                  <p>{selectedStudent}</p>

                  <Label>Por concepto de</Label>
                  <p>{selectedConcept}</p>

                  {selectedConcept === "Mensualidad" && (
                    <>
                      <Label>Grupos</Label>
                      <GroupList>
                        {groups.map((group, index) => (
                          <GroupItem key={index}>{group}</GroupItem>
                        ))}
                      </GroupList>
                      <Label>Detalle</Label>
                      <p>{specifiedMonth ? capitalizeFirstLetter(specifiedMonth.toLocaleDateString("es-CR", { month: "long", year: "numeric" })) : ""}</p>
                    </>
                  )}

                  {selectedConcept === "Taller" && (
                    <>
                      <Label>Detalle</Label>
                      <p>{selectedTaller}</p>
                    </>
                  )}

                  <Label>Monto</Label>
                  <p>{`₡${amount}`}</p>

                  <Label>Forma de Pago</Label>
                  <p>{paymentMethod}</p>
                </ReceiptBody>
                <Description>
                  ❖ La factura electronica será enviado luego a su Email o WhatsApp
                </Description>
              </Receipt>
              <ButtonContainer>
                <CancelButton onClick={handleCancelReceipt}>Cancelar</CancelButton>
                <GenerateButton onClick={handleConfirmReceipt}>Confirmar</GenerateButton>
              </ButtonContainer>
            </ModalContent>
          </Modal>
      )}
    </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  @media (max-width: 480px) {
    padding: 30px;
  }
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

const Receipt = styled.div`
  width: 100%;
  max-width: 305px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  background-color: #dddddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 20px; 
`;

const ReceiptHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
    color: #0b0f8b;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #333;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0;

  img {
    filter: invert(24%) sepia(100%) saturate(7472%) hue-rotate(223deg) brightness(91%) contrast(101%);
  }
`;

const ReceiptBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  padding: 5px;
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
    padding: 4px;
    font-size: 12px;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 93%;

  &:focus {
    border-color: #0b0f8b;
  }

  &:hover {
    border-color: #ff5733;
  }

  .react-datepicker__day--selected {
    background-color: #33c1ff;
    color: #dddddd;
  }

  @media (max-width: 480px) {
    padding: 4px;
    font-size: 12px;
  }
`;

const Select = styled.select`
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: ${props => props.halfWidth ? '50%' : '100%'};
  outline: none;

  &:focus {
    border-color: #0b0f8b;
  }

  @media (max-width: 480px) {
    padding: 4px;
    font-size: 12px;
  }
`;

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const GroupItem = styled.li`
  flex: 1 1 calc(50% - 10px);
  padding: 5px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-sizing: border-box;

  &:nth-child(2n)::after {
    display: none;
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;
    padding: 4px;
    font-size: 12px;
  }
`;

const Description = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: #333;
  text-align: justify;
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const GenerateButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #dddddd;
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

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  background-color: #999;
  color: #dddddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #6b6b6b;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  background: #dddddd;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto; 
  display: flex;
  flex-direction: column;
  align-items: center;
`;