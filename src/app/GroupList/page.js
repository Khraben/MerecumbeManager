"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { FaSearch, FaInfoCircle } from "react-icons/fa";
import AddGroupModal from "../components/AddGroupModal";
import Loading from "../components/Loading"; // Asegúrate de que la ruta sea correcta
import { collection, getDocs } from "firebase/firestore";
import { db } from "../conf/firebase";

export default function GroupList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true); // Iniciar carga
    const querySnapshot = await getDocs(collection(db, "groups"));
    const groupsData = querySnapshot.docs.map(doc => doc.data());
    groupsData.sort((a, b) => {
      const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const dayComparison = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      return a.startTime.localeCompare(b.startTime);
    });
    setGroups(groupsData);
    setLoading(false); // Finalizar carga
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchGroups();
  };

  const handleViewGroupDetails = (group) => {
    console.log("Ver detalles del grupo:", group);
  };

  const filteredGroups = groups.filter(group =>
    group.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.startTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <Title>Lista de Grupos</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Filtrar por día o hora de inicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchContainer>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Instructor</th>
              <th>Nivel</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group, index) => (
              <tr key={index}>
                <td>{group.day} {group.startTime}</td>
                <td>{group.instructor}</td>
                <td>{group.level}</td>
                <td>
                  <InfoIcon onClick={() => handleViewGroupDetails(group)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <AddButton onClick={handleOpenModal}>Agregar Grupo</AddButton>
      <AddGroupModal isOpen={isModalOpen} onClose={handleCloseModal} />
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

  @media (max-width: 480px) {
    font-size: 20px;
  }
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

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
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

  @media (max-width: 768px) {
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    padding: 0 5px;
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

  @media (max-width: 768px) {
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    padding: 0 5px;
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