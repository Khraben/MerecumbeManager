"use client";

import styled from "styled-components";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const students = [
    {
      name: "Kevin Jiménez",
      phone: "1234-5678",
    },
    {
      name: "Leiner Alvarado",
      phone: "1234-5678",
    },
    {
      name: "Walter Lazo",
      phone: "1234-5678",
    },
    {
      name: "Justin Martinez",
      phone: "1234-5678",
    },
    {
      name: "Kevin Jiménez",
      phone: "1234-5678",
    },
    {
      name: "Leiner Alvarado",
      phone: "1234-5678",
    },
    {
      name: "Walter Lazo",
      phone: "1234-5678",
    },
    {
      name: "Justin Martinez",
      phone: "1234-5678",
    },
    {
      name: "Kevin Jiménez",
      phone: "1234-5678",
    },
    {
      name: "Leiner Alvarado",
      phone: "1234-5678",
    },
    {
      name: "Walter Lazo",
      phone: "1234-5678",
    },
    {
      name: "Justin Martinez",
      phone: "1234-5678",
    },
    {
      name: "Kevin Jiménez",
      phone: "1234-5678",
    },
    {
      name: "Leiner Alvarado",
      phone: "1234-5678",
    },
    {
      name: "Walter Lazo",
      phone: "1234-5678",
    },
    {
      name: "Justin Martinez",
      phone: "1234-5678",
    },
    
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Wrapper>
      <Title>Lista General de Alumnos</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Filtrar por nombre de alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchContainer>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Grupo Principal</th>
              <th>+</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.phone}</td>
                <td> </td>
                <td> </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <AddButton>Agregar Alumno</AddButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #0b0f8b;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 700;
  text-align: center;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
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
`;

const TableContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
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
    color: white;
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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 95%;
  padding: 10px 15px;
  font-size: 14px;
  border: 2px solid #0b0f8b;
  border-radius: 5px;
  outline: none;
  background-color: transparent;
`;

const SearchIcon = styled(FaSearch)`
  margin-left: -35px;
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;
`;