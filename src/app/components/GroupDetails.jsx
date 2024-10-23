import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaCheckCircle, FaTimesCircle, FaInfo } from "react-icons/fa";
import { fetchGroupDetails, fetchAttendancesByGroup, addAttendance, findAttendance, deleteAttendance, fetchGroupsByIds } from "../conf/firebaseService";
import Loading from "./Loading";

const GroupDetails = ({ isOpen, onClose, groupId }) => {
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [attendance, setAttendance] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [groupDetails, setGroupDetails] = useState({});

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
      setStudents([]);
      setAttendance({});
      setLoading(true);
      setAttendanceLoading(true);
      fetchAttendancesData();
      fetchGroupDetailsData();
      setCurrentMonth();
    }
  }, [isOpen, groupId, refresh]);

  const setCurrentMonth = () => {
    const currentDate = new Date();
    const monthName = monthTranslations[currentDate.toLocaleString('default', { month: 'long' })];
    const year = currentDate.getFullYear();
    setSelectedMonth(`${monthName} ${year}`);
  };

  const fetchGroupDetailsData = async () => {
    if (initialLoad) setLoading(true);
    try {
      const { groupData, studentsData } = await fetchGroupDetails(groupId);
      setGroup(groupData);
      setStudents(studentsData.map(student => ({
        ...student,
        isPrimaryGroup: student.groups[0] === groupId
      })));

      setLoading(false);
      setInitialLoad(false);

      const otherGroupIds = studentsData.reduce((acc, student) => {
        return acc.concat(student.groups.filter(id => id !== groupId));
      }, []);
      const groupDetailsArray = await fetchGroupsByIds(otherGroupIds);
      const groupDetailsMap = groupDetailsArray.reduce((acc, group) => {
        acc[group.id] = group;
        return acc;
      }, {});
      setGroupDetails(groupDetailsMap);

    } catch (error) {
      console.error("Error al obtener detalles del grupo:", error);
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchAttendancesData = async () => {
    if (initialLoad) setAttendanceLoading(true);
    try {
      const attendances = await fetchAttendancesByGroup(groupId);
      setAttendance(attendances);
      setOriginalAttendance(attendances);
      setAttendanceLoading(false);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching attendances: ", error);
      setAttendanceLoading(false);
      setInitialLoad(false);
    }
  };

  const handleAttendanceClick = (studentId, date) => {
    if (!isEditing) return;

    const attendanceId = Object.keys(attendance).find(
      (id) => attendance[id].studentId === studentId && attendance[id].date.getTime() === date.getTime()
    );

    const tempId = `temp-${studentId}-${date.getTime()}`;

    setPendingChanges((prevChanges) => {
      const updatedChanges = { ...prevChanges };

      if (attendanceId) {
        if (updatedChanges[attendanceId]?.action === 'delete') {
          delete updatedChanges[attendanceId];  
        } else {
          updatedChanges[attendanceId] = { action: 'delete' }; 
        }
      } 
      else {
        if (updatedChanges[tempId]?.action === 'add') {
          delete updatedChanges[tempId];
        } else {
          updatedChanges[tempId] = { action: 'add', groupId, studentId, date };  
        }
      }

      return updatedChanges;
    });

  };

  const handleSave = async () => {
    setIsEditing(false);
    const newAttendance = { ...attendance };

    for (const [id, change] of Object.entries(pendingChanges)) {
      if (change.action === 'delete') {
        delete newAttendance[id];
        await deleteAttendance(id);
      } else if (change.action === 'add') {
        const { date, groupId, studentId } = change;
        await addAttendance(date, groupId, studentId);
        const newAttendanceId = await findAttendance(groupId, studentId, date);
        if (newAttendanceId) {
          newAttendance[newAttendanceId] = { groupId, studentId, date };
        }
      }
    }

    setAttendance(newAttendance);
    setOriginalAttendance(newAttendance);
    setPendingChanges({});
    setRefresh(!refresh);
  };

  const handleCancel = () => {
    setAttendance({ ...originalAttendance });
    setPendingChanges({});
    setIsEditing(false);
  };

  const getAttendanceCellComponent = (studentId, date) => {
    const attendanceId = Object.keys(attendance).find(
      (id) => attendance[id].studentId === studentId && attendance[id].date.getTime() === date.getTime()
    );

    const tempId = `temp-${studentId}-${date.getTime()}`;

    const pendingAdd = pendingChanges[tempId]?.action === 'add';
    const pendingDelete = pendingChanges[attendanceId]?.action === 'delete';

    if (pendingAdd) {
      return <PresentIcon className="pending-change" />;  
    }
    if (pendingDelete) {
      return <AbsentIcon className="pending-change" />; 
    }
    if (attendanceId) {
      return <PresentIcon />;  
    }

    return isEditing ? <AbsentIcon /> : null;
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isOpen) return null;

  if (loading || attendanceLoading) return <Loading />;

  const femaleStudents = students
    .filter(student => student.gender === "Mujer")
    .sort((a, b) => b.isPrimaryGroup - a.isPrimaryGroup);

  const maleStudents = students
    .filter(student => student.gender === "Hombre")
    .sort((a, b) => b.isPrimaryGroup - a.isPrimaryGroup);

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <CloseButton onClick={() => !isEditing && onClose()}><FaTimes /></CloseButton>
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
                    <th>D. Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {femaleStudents.map((student) => (
                    <tr key={student.id} style={{ color: student.isPrimaryGroup ? "#0b0f8b" : "#323232" }}>
                      <StudentName isPrimaryGroup={student.isPrimaryGroup}>
                        {student.name}
                        {student.groups.length > 1 && (
                          <>
                            <BulletPoint isPrimaryGroup={student.isPrimaryGroup} />
                            <Tooltip>
                              <strong>OTROS GRUPOS:</strong>
                              <ul>
                                {student.groups.filter(id => id !== groupId).map((id, index) => (
                                  <li key={index}>
                                    {groupDetails[id] ? `${groupDetails[id].level} - ${groupDetails[id].name}` : id}
                                  </li>
                                ))}
                              </ul>
                            </Tooltip>
                          </>
                        )}
                      </StudentName>
                      {getAttendanceDates(selectedMonth, group.day).map((date) => {
                        const attendanceId = Object.keys(attendance).find(
                          (id) => attendance[id].studentId === student.id && attendance[id].date.getTime() === date.getTime()
                        );
                        const tempId = `temp-${student.id}-${date.getTime()}`;
                        return (
                          <AttendanceCell
                            key={date.toString()}
                            onClick={() => handleAttendanceClick(student.id, date)}
                            className={pendingChanges[attendanceId] || pendingChanges[tempId] ? "pending-change" : ""}
                            isPrimaryGroup={student.isPrimaryGroup}
                          >
                            {getAttendanceCellComponent(student.id, date)}
                          </AttendanceCell>
                        );
                      })}
                      <PaymentStatus>
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
                    <tr key={student.id} style={{ color: student.isPrimaryGroup ? "#0b0f8b" : "#323232" }}>
                      <StudentName isPrimaryGroup={student.isPrimaryGroup}>
                        {student.name}
                        {student.groups.length > 1 && (
                          <>
                            <BulletPoint isPrimaryGroup={student.isPrimaryGroup} />
                            <Tooltip>
                              <strong>OTROS GRUPOS:</strong>
                              <ul>
                                {student.groups.filter(id => id !== groupId).map((id, index) => (
                                  <li key={index}>
                                    {groupDetails[id] ? `${groupDetails[id].level} - ${groupDetails[id].name}` : id}
                                  </li>
                                ))}
                              </ul>
                            </Tooltip>
                          </>
                        )}
                      </StudentName>
                      {getAttendanceDates(selectedMonth, group.day).map((date) => {
                        const attendanceId = Object.keys(attendance).find(
                          (id) => attendance[id].studentId === student.id && attendance[id].date.getTime() === date.getTime()
                        );
                        const tempId = `temp-${student.id}-${date.getTime()}`;
                        return (
                          <AttendanceCell
                            key={date.toString()}
                            onClick={() => handleAttendanceClick(student.id, date)}
                            className={pendingChanges[attendanceId] || pendingChanges[tempId] ? "pending-change" : ""}
                            isPrimaryGroup={student.isPrimaryGroup}
                          >
                            {getAttendanceCellComponent(student.id, date)}
                          </AttendanceCell>
                        );
                      })}
                      <PaymentStatus >
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
              {isEditing ? (
                <CancelButton onClick={handleCancel}>
                  Cancelar
                </CancelButton>
              ) : (
                <ActionButton onClick={null}>
                  Recordar Clase
                </ActionButton>
              )}
              <ActionButton onClick={isEditing ? handleSave : handleEdit}>
                {isEditing ? 'Guardar Asistencia' : 'Pasar Asistencia'}
              </ActionButton>
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
  justify-content: flex-end;
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
    background-color: #b8b8b8;
    text-align: left;
  }

  .divider-row td {
    background-color: transparent;
    border: none;
  }
`;

const StudentName = styled.td`
  font-weight: bold;
  position: relative;
  color: ${({ isPrimaryGroup }) => (isPrimaryGroup ? "#0b0f8b" : "#323232")};
`;

const BulletPoint = styled(FaInfo)`
  font-size: 12px;
  color: ${({ isPrimaryGroup }) => (isPrimaryGroup ? "#0b0f8b" : "#323232")};
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;

  @media (max-width: 480px) {
    font-size: 10px;
  }

  &:hover + div {
    display: block;
  }
`;

const Tooltip = styled.div`
  display: none;
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background-color: #dddddd; 
  color: #000;
  padding: 10px; 
  border-radius: 5px;
  font-size: 14px; 
  white-space: nowrap;
  z-index: 1004;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  max-width: 200px; 
  overflow-wrap: break-word; 

  @media (max-width: 768px) {
    font-size: 12px; 
    padding: 8px; 
    max-width: 150px; 
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 5px; 
    }
  }
`;

const AttendanceCell = styled.td`
  width: 20px;
  cursor: pointer;
  position: relative;

  &.pending-change::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-top: 10px solid #0b0f8b;
  }
`;

const PresentIcon = styled(FaCheckCircle)`
  color: #0b0f8b;
  font-size: 20px;
`;

const AbsentIcon = styled(FaTimesCircle)`
  color: #999;
  font-size: 20px;
`;

const PaymentStatus = styled.td`
  font-weight: bold;
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

const CancelButton = styled(ActionButton)`
  background-color: #999;
  color: #dddddd;

  &:hover {
    background-color: #6b6b6b;
  }
`;

export default GroupDetails;