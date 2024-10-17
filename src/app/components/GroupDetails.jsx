import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { fetchGroupDetails, fetchAttendancesByGroup, addAttendance, findAttendance, deleteAttendance } from "../conf/firebaseService";
import Loading from "./Loading";

const GroupDetails = ({ isOpen, onClose, groupId }) => {
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [attendance, setAttendance] = useState({});
  const monthTranslations = {
    January: 'Enero',
    February: 'Febrero',
    March: 'Marzo',
    April: 'Abril',
    May: 'Mayo',
    June: 'Junio',
    July: 'Julio',
    August: 'Agosto',
    September: 'Septiembre',
    October: 'Octubre',
    November: 'Noviembre',
    December: 'Diciembre'
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttendancesData();
      fetchGroupDetailsData();
    }
  }, [isOpen, groupId]);

  const fetchGroupDetailsData = async () => {
    setLoading(true);
    try {
      const { groupData, studentsData } = await fetchGroupDetails(groupId);
      setGroup(groupData);
      setStudents(studentsData);

      const [day, month, year] = groupData.startDate.split("/");
      const startDate = new Date(`${year}-${month}-${day}`);
      const monthName = monthTranslations[startDate.toLocaleString('default', { month: 'long' })];
      setSelectedMonth(`${monthName} ${year}`);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener detalles del grupo:", error);
    }
  };

  const fetchAttendancesData = async () => {
    setAttendanceLoading(true);
    try {
      const attendances = await fetchAttendancesByGroup(groupId);
      setAttendance(attendances);
      setAttendanceLoading(false);
    } catch (error) {
      console.error("Error fetching attendances: ", error);
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceClick = async (studentId, date) => {
    try {
      const attendanceId = await findAttendance(groupId, studentId, date);
      if (attendanceId) {
        await deleteAttendance(attendanceId);
        setAttendance((prevAttendance) => {
          const updatedAttendance = { ...prevAttendance };
          if (updatedAttendance[attendanceId]) {
            delete updatedAttendance[attendanceId];
          }
          return updatedAttendance;
        });
      } else {
        await addAttendance(date, groupId, studentId);
        const newAttendanceId = await findAttendance(groupId, studentId, date);
        
        if (!newAttendanceId) {
          throw new Error("Attendance ID not found after adding attendance");
        }
        setAttendance((prevAttendance) => ({
          ...prevAttendance,
          [newAttendanceId]: {
            groupId,
            studentId,
            date: date,
          },
        }));
      }
    } catch (error) {
      console.error("Error handling attendance click: ", error);
    }
  };

  const getAttendanceCellColor = (studentId, date) => {
    for (const [docId, attendanceRecord] of Object.entries(attendance)) {
      if (attendanceRecord.studentId === studentId) {
        if (attendanceRecord.date.getTime() === date.getTime()) {
          return "green";
        }
      }
    }
    return "white";
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

  if (!isOpen) return null;

  if (loading || attendanceLoading) return <Loading />;

  const femaleStudents = students.filter(student => student.gender === "Mujer");
  const maleStudents = students.filter(student => student.gender === "Hombre");

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </ModalHeader>
        <ModalBody>
          <DetailsWrapper>
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
                <SelectMonth>{selectedMonth}</SelectMonth>

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
                    {femaleStudents.map((student) => (
                      <tr key={student.id}>
                        <StudentName>{student.name}</StudentName>
                        {getAttendanceDates(selectedMonth, group.day).map((date) => (
                          <AttendanceCell
                            key={date.toString()}
                            style={{ backgroundColor: getAttendanceCellColor(student.id, date) }}
                            onClick={() => handleAttendanceClick(student.id, date)}
                          ></AttendanceCell>
                        ))}
                        <PaymentStatus status={student.paymentStatus}>
                          {student.paymentDate}
                        </PaymentStatus>
                      </tr>
                    ))}
                    {femaleStudents.length > 0 && maleStudents.length > 0 && (
                      <tr className="divider-row">
                        <td colSpan={getAttendanceDates(selectedMonth, group.day).length + 2}></td>                  
                      </tr>
                    )}
                    {maleStudents.map((student) => (
                      <tr key={student.id}>
                        <StudentName>{student.name}</StudentName>
                        {getAttendanceDates(selectedMonth, group.day).map((date) => (
                          <AttendanceCell
                            key={date.toString()}
                            style={{ backgroundColor: getAttendanceCellColor(student.id, date) }}
                            onClick={() => handleAttendanceClick(student.id, date)}
                          ></AttendanceCell>
                        ))}
                        <PaymentStatus status={student.paymentStatus}>
                          {student.paymentDate}
                        </PaymentStatus>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Summary>
                  <p><strong>Total Mujeres:</strong> {femaleStudents.length}</p>
                  <p><strong>Total Hombres:</strong> {maleStudents.length}</p>
                </Summary>
              </AttendanceControl>
              <ButtonContainer>
                <ActionButton>Recordar Clase</ActionButton>
                <ActionButton>Pasar Asistencia</ActionButton>
              </ButtonContainer>
          </DetailsWrapper>
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
  margin-left: 80px;
  margin-right: 20px;
  background-color: #dddddd;
  padding: 20px;
  width: 600px;
  height: 730px;
  max-width: 90vw;
  max-height: 90vh;
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
  justify-content: right;
  align-items: center;
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

const DetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
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
  width: 90%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 0 20px;

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

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const SelectMonth = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #000;

  @media (max-width: 480px) {
    font-size: 14px;
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
    color: #dddddd;
  }

  td {
    background-color: #f1f1f1;
    color: #000;
    text-align: left;
  }

  .divider-row td {
    background-color: transparent;
    border: none;
  }
`;

const StudentName = styled.td`
  font-weight: bold;
`;

const AttendanceCell = styled.td`
  width: 20px;
  cursor: pointer;
`;

const PaymentStatus = styled.td`
  color: ${(props) => (props.status === "paid" ? "green" : "red")};
`;

const Summary = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #333;

  p {
    margin: 5px 0;
  }
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

export default GroupDetails;