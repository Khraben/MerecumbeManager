"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaUsers,
  FaUserGraduate,
  FaFileInvoiceDollar,
  FaChartBar,
} from "react-icons/fa";
import {
  fetchActiveStudents,
  fetchReceiptsByMonth,
  fetchScholarshipStudents,
  fetchGroupsByInstructor,
  fetchInstructorByEmail,
  fetchNameByEmail,
} from "./firebase/firebaseFirestoreService";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Loading from "./components/Loading";

export default function Home() {
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [paymentsThisMonthCount, setPaymentsThisMonthCount] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [instructorGroups, setInstructorGroups] = useState([]);
  const [birthdaysThisWeek, setBirthdaysThisWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const router = useRouter();
  const { isInstructorUser, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setName(await fetchNameByEmail(user.email));
      if (isInstructorUser) {
        const instructor = await fetchInstructorByEmail(user.email);
        const groups = await fetchGroupsByInstructor(instructor.id);
        setInstructorGroups(groups);
      } else {
        const activeStudents = await fetchActiveStudents();
        const scholarshipStudents = await fetchScholarshipStudents();
        const scholarshipStudentIds = new Set(
          scholarshipStudents.map((student) => student.studentId)
        );
        const nonScholarshipStudents = activeStudents.filter(
          (student) => !scholarshipStudentIds.has(student.id)
        );
        setActiveStudentsCount(nonScholarshipStudents.length);

        const currentDate = new Date();
        const month = currentDate.toLocaleString("es-ES", { month: "long" });
        const year = currentDate.getFullYear();
        const monthYear = `${
          month.charAt(0).toUpperCase() + month.slice(1)
        } de ${year}`;
        const receipts = await fetchReceiptsByMonth(monthYear);

        const paymentsThisMonth = receipts.filter((receipt) =>
          nonScholarshipStudents.some(
            (student) => student.id === receipt.studentId
          )
        );
        setPaymentsThisMonthCount(paymentsThisMonth.length);

        const pendingPayments =
          nonScholarshipStudents.length - paymentsThisMonth.length;
        setPendingPaymentsCount(pendingPayments);

        const birthdays = getBirthdaysThisWeek(nonScholarshipStudents);
        setBirthdaysThisWeek(birthdays);
      }
      setLoading(false);
    };

    fetchData();
  }, [isInstructorUser, user.email]);

  const handleLinkClick = (path) => {
    router.push(path);
  };

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(/(am|pm)/);
    let [hours, minutes] = time.trim().split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "pm" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const getBirthdaysThisWeek = (students) => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDay + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const daysOfWeek = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    return students
      .map((student) => {
        const [day, month] = student.birthday.split("/").map(Number);
        const birthdayDate = new Date(
          currentDate.getFullYear(),
          month - 1,
          day
        );
        const dayOfWeek = daysOfWeek[birthdayDate.getDay()];
        return { ...student, birthdayDate, dayOfWeek };
      })
      .filter(
        (student) =>
          student.birthdayDate >= startOfWeek &&
          student.birthdayDate <= endOfWeek
      )
      .sort((a, b) => a.birthdayDate - b.birthdayDate);
  };

  const groupedByDay = instructorGroups.reduce((acc, group) => {
    if (!acc[group.day]) {
      acc[group.day] = [];
    }
    acc[group.day].push(group);
    return acc;
  }, {});

  const daysOfWeek = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <Title>Dance Manager</Title>
      <Subtitle>¡Bienvenido/a {name}!</Subtitle>
      <ButtonSection>
        <StyledButton onClick={() => handleLinkClick("/GroupList")}>
          <FaUsers /> Grupos
        </StyledButton>
        {!isInstructorUser && (
          <>
            <StyledButton onClick={() => handleLinkClick("/StudentList")}>
              <FaUserGraduate /> Alumnos
            </StyledButton>
            <StyledButton onClick={() => handleLinkClick("/MakePayment")}>
              <FaFileInvoiceDollar /> Facturar
            </StyledButton>
            <StyledButton onClick={() => handleLinkClick("/Reports")}>
              <FaChartBar /> Reportes
            </StyledButton>
          </>
        )}
      </ButtonSection>
      {!isInstructorUser && (
        <DashboardSection>
          <DashboardTitle>Panel de Control</DashboardTitle>
          <DashboardItem>
            <DashboardLabel>Alumnos Activos:</DashboardLabel>
            <DashboardValue>{activeStudentsCount}</DashboardValue>
          </DashboardItem>
          <DashboardItem>
            <DashboardLabel>Pagos Realizados Este Mes:</DashboardLabel>
            <DashboardValue>{paymentsThisMonthCount}</DashboardValue>
          </DashboardItem>
          <DashboardItem>
            <DashboardLabel>Pagos Faltantes Este Mes:</DashboardLabel>
            <DashboardValue>{pendingPaymentsCount}</DashboardValue>
          </DashboardItem>
          <DashboardItem>
            <DashboardLabel>Cumpleaños Esta Semana:</DashboardLabel>
            <DashboardValue>
              {birthdaysThisWeek.length > 0 ? (
                <ul>
                  {birthdaysThisWeek.map((student) => (
                    <li key={student.id}>
                      {student.name} - {student.dayOfWeek}
                    </li>
                  ))}
                </ul>
              ) : (
                "No hay cumpleaños esta semana"
              )}
            </DashboardValue>
          </DashboardItem>
        </DashboardSection>
      )}
      {isInstructorUser && (
        <DashboardSection>
          <DashboardTitle>Tus Grupos</DashboardTitle>
          {daysOfWeek.map(
            (day) =>
              groupedByDay[day] && (
                <DaySection key={day}>
                  <DayLabel>{day}:</DayLabel>
                  <GroupList>
                    {groupedByDay[day]
                      .sort((a, b) =>
                        parseTime(a.startTime).localeCompare(
                          parseTime(b.startTime)
                        )
                      )
                      .map((group, index) => (
                        <GroupItem
                          key={index}
                        >{`${group.name} - ${group.level}`}</GroupItem>
                      ))}
                  </GroupList>
                </DaySection>
              )
          )}
        </DashboardSection>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 30px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333333;
  margin-bottom: 50px;
  text-transform: uppercase;
  font-weight: 700;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.h2`
  font-size: 18px;
  color: #333333;
  margin-bottom: 40px;
  text-transform: uppercase;
  font-weight: 700;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const StyledButton = styled.button`
  background-color: #333333;
  color: #dddddd;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, transform 0.3s;
  text-transform: uppercase;
  font-weight: bold;

  &:hover {
    background-color: #242424;
    transform: scale(1.05);
  }

  svg {
    margin-right: 10px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 10px 20px;
    width: 100%;
  }
`;

const DashboardSection = styled.section`
  width: 100%;
  max-width: 800px;
  background: #dddddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin: 10px 0;
  }
`;

const DashboardTitle = styled.h2`
  font-size: 20px;
  color: #333333;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const DashboardItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;

  &:last-child {
    border-bottom: none;
  }
`;

const DashboardLabel = styled.span`
  font-size: 18px;
  color: #333;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const DashboardValue = styled.span`
  font-size: 18px;
  color: #333333;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const DaySection = styled.div`
  margin-bottom: 20px;
`;

const DayLabel = styled.span`
  font-size: 18px;
  color: #333333;
  font-weight: 700;
  display: block;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const GroupList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const GroupItem = styled.li`
  font-size: 16px;
  color: #333;
  margin: 5px 0;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;
