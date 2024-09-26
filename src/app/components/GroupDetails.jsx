import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../conf/firebase";
import Loading from "./Loading";

export default function GroupDetails({ groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const instructorDoc = await getDoc(doc(db, "instructors", groupData.instructor));
        if (instructorDoc.exists()) {
          groupData.instructor = instructorDoc.data().name;
        } else {
          groupData.instructor = "Instructor no encontrado";
        }

        setGroup(groupData);
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const studentsData = studentsSnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((student) => student.groups.includes(groupId));

        setStudents(studentsData);

        const [day, month, year] = groupData.startDate.split("/");
        const startDate = new Date(`${year}-${month}-${day}`);
        setSelectedMonth(startDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
        setLoading(false);
      } else {
        console.error("Grupo no encontrado.");
      }
    } catch (error) {
      console.error("Error al obtener detalles del grupo:", error);
    }
  };

  const getDayOfWeekIndex = (day) => {
    const daysOfWeek = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
      Domingo: 0,
    };
    return daysOfWeek[day] ?? 1;
  };

  const getAttendanceDates = (monthYear, groupDay) => {
    const [monthName, year] = monthYear.split(" ");
    const month = new Date(`${monthName} 1, ${year}`).getMonth();
    const selectedYear = parseInt(year);
    const dayOfWeekIndex = getDayOfWeekIndex(groupDay);

    let dates = [];
    let date = new Date(selectedYear, month, 1);

  
    while (date.getDay() !== dayOfWeekIndex) {
      date.setDate(date.getDate() + 1);
    }

    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 7); 
    }

    return dates;
  };

  if (loading) return <Loading />;

  return (
    <DetailsWrapper>
      <BackButton onClick={onBack}>
        <FaArrowLeft /> Volver
      </BackButton>
      <DetailsContainer>
        <Title>CONTROL ASISTENCIA</Title>
        <GroupName>{group.name.toUpperCase()}</GroupName>
        <GroupInfo>
          <Column>
            <p><strong>Instructor:</strong> {group.instructor}</p>
            <p><strong>Nivel:</strong> {group.level}</p>
          </Column>
          <Column>
            <p><strong>Día/Hora:</strong> {group.day} {group.startTime}</p>
            <p><strong>Fecha Inicio:</strong> {group.startDate}</p>
          </Column>
        </GroupInfo>

        <AttendanceControl>
          <ControlTitle>Control de:</ControlTitle>
          <SelectMonth
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value={selectedMonth}>{selectedMonth}</option>
          </SelectMonth>

          <Table>
            <thead>
              <tr>
                <th>Nombre Alumno</th>
                {getAttendanceDates(selectedMonth, group.day).map((date) => (
                  <th key={date.toString()} style={{ width: "20px" }}>
                    {date.getDate()}
                  </th>
                ))}
                <th>Fecha Pago</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <StudentName>{student.name}</StudentName>
                  {getAttendanceDates(selectedMonth, group.day).map((date) => (
                    <AttendanceCell key={date.toString()}></AttendanceCell>
                  ))}
                  <PaymentStatus status={student.paymentStatus}>
                    {student.paymentDate}
                  </PaymentStatus>
                </tr>
              ))}
            </tbody>
          </Table>
        </AttendanceControl>

        <ButtonContainer>
          <ActionButton>Recordar Clase</ActionButton>
          <ActionButton>Pasar Asistencia</ActionButton>
        </ButtonContainer>
      </DetailsContainer>
    </DetailsWrapper>
  );
}

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
  max-width: 800px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const GroupName = styled.h3`
  font-size: 18px;
  color: #0b0f8b;
  text-transform: uppercase;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const GroupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  text-align: left;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 0 10px;

  p {
    margin-bottom: 5px;
    font-size: 16px;
    color: #333;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
`;

const AttendanceControl = styled.div`
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
`;

const ControlTitle = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #0b0f8b;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const SelectMonth = styled.select`
  padding: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #333;
  border-radius: 5px;
  border: 1px solid #ccc;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th, td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }

  th {
    background-color: #0b0f8b;
    color: #fff;
  }

  td {
    background-color: #f1f1f1;
    color: #000;
    text-align: left;
  }
`;

const StudentName = styled.td`
  font-weight: bold;
`;

const AttendanceCell = styled.td`
  width: 20px;
`;

const PaymentStatus = styled.td`
  color: ${(props) => (props.status === "paid" ? "green" : "red")};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
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
