"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { fetchGroupsByDay } from "./conf/firebaseService";
import Loading from "./components/Loading";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [formattedDate, setFormattedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    setFormattedDate(formatDate(today));
    fetchGroups(today);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const fetchGroups = async (date) => {
    const today = date.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const groupsData = await fetchGroupsByDay(today);
    setGroups(groupsData);
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <Title>Merecumbé San Ramón</Title>
      <Section>
        <Subtitle>{formattedDate}</Subtitle>
        <GroupList>
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <GroupItem key={index}>
                {group.name}
              </GroupItem>
            ))
          ) : (
            <NoGroupsMessage>No hay grupos</NoGroupsMessage>
          )}
        </GroupList>
      </Section>
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
    padding: 10px;
  }
`;

const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin: 10px 0;
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

const Subtitle = styled.h2`
  font-size: 20px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const GroupList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GroupItem = styled.div`
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  background-color: #f9f9f9;
  border-radius: 10px;
  text-align: center;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 10px;
  }
`;

const NoGroupsMessage = styled.div`
  font-size: 18px;
  color: #333;
  text-align: center;
  margin-top: 20px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;