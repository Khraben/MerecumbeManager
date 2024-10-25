"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaInfoCircle, FaEdit, FaTrash } from "react-icons/fa";
import { fetchInstructors, fetchCountGroupsByInstructor, deleteInstructor } from "../conf/firebaseService";
import Loading from "../components/Loading";

export default function AdminConf() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [secretaries, setSecretaries] = useState([]);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const instructorsData = await fetchInstructors();
        const instructorsWithGroupsCount = await Promise.all(
          instructorsData.map(async (instructor) => {
            const groupsCount = await fetchCountGroupsByInstructor(instructor.id);
            return { ...instructor, groupsCount };
          })
        );
        setInstructors(instructorsWithGroupsCount);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInstructors();
  }, []);

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSecretaries = secretaries.filter(secretary =>
    secretary.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <Title>Administrar Instructores y Secretarias</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Filtrar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchContainer>
      <SectionTitle>Instructores</SectionTitle>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th># Grupos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructors.map((instructor, index) => (
              <tr key={index}>
                <td>{instructor.name}</td>
                <td>{instructor.phone}</td>
                <td>{instructor.groupsCount}</td>
                <td>
                  <InfoIcon />
                  <EditIcon />
                  <DeleteIcon />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <SectionTitle>Secretarias</SectionTitle>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Usuario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredSecretaries.map((secretary, index) => (
              <tr key={index}>
                <td>{secretary.name}</td>
                <td>{secretary.phone}</td>
                <td>{secretary.username}</td>
                <td>
                  <InfoIcon />
                  <EditIcon />
                  <DeleteIcon />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ButtonContainer>
        <ActionButton>Agregar Instructor</ActionButton>
        <ActionButton>Agregar Secretaria</ActionButton>
      </ButtonContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;

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

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #0b0f8b;
  margin: 20px 0;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const SearchInput = styled.input`
  width: 95%;
  padding: 10px 15px;
  font-size: 14px;
  border: 2px solid #0b0f8b;
  border-radius: 5px;
  outline: none;
  background-color: transparent;

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const SearchIcon = styled(FaSearch)`
  margin-left: -35px;
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 218px;
  background-color: rgba(221, 221, 221, 1);

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const Table = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background-color: transparent;
  border-radius: 8px;

  thead {
    position: sticky;
    top: 0;
    background-color: #0b0f8b;
    color: #dddddd;
    z-index: 1;
  }

  th, td {
    padding: 16px 20px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.1em;
  }

  td {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.05); 
  }

  @media (max-width: 768px) {
    th, td {
      font-size: 12px;
      padding: 12px 15px;
    }
  }

  @media (max-width: 480px) {
    th, td {
      font-size: 10px;
      padding: 10px 12px;
    }
  }
`;

const InfoIcon = styled(FaInfoCircle)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 20px;

  &:hover {
    color: #073e8a;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const EditIcon = styled(FaEdit)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 20px;
  margin-right: 10px;
  margin-left: 10px;

  &:hover {
    color: #073e8a;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const DeleteIcon = styled(FaTrash)`
  color: #0b0f8b;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    color: #ff0000;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  margin: 20px 10px;
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