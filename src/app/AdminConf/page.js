"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import SecretaryModal from "../components/SecretaryModal";
import InstructorModal from "../components/InstructorModal";
import InstructorDetails from "../components/InstructorDetails";
import ConfirmationModal from "../components/ConfirmationModal";
import Loading from "../components/Loading";
import {
  fetchSecretaries,
  fetchInstructors,
  deleteSecretary,
  deleteInstructor,
  fetchCountGroupsByInstructor,
} from "../firebase/firebaseFirestoreService";
import SecretaryDetails from "../components/SecretaryDetails";
import ScholarshipModal from "../components/ScholarshipModal";

export default function AdminConf() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [secretaries, setSecretaries] = useState([]);

  const [isSecretaryModalOpen, setIsSecretaryModalOpen] = useState(false);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isInstructorDetailsOpen, setIsInstructorDetailsOpen] = useState(false);

  const [editingSecretaryId, setEditingSecretaryId] = useState(null);
  const [editingInstructorId, setEditingInstructorId] = useState(null);
  const [viewingInstructorId, setViewingInstructorId] = useState(null);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [secretaryToDelete, setSecretaryToDelete] = useState(null);
  const [instructorToDelete, setInstructorToDelete] = useState(null);

  const [isSecretaryDetailsOpen, setIsSecretaryDetailsOpen] = useState(false);
  const [viewingSecretaryId, setViewingSecretaryId] = useState(null);

  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);

  useEffect(() => {
    const loadSecretaries = async () => {
      try {
        const secretariesData = await fetchSecretaries();
        setSecretaries(secretariesData);
      } catch (error) {
        console.error("Error fetching secretaries:", error);
      }
    };

    const loadInstructors = async () => {
      try {
        const instructorsData = await fetchInstructors();
        const instructorsWithGroupCount = await Promise.all(
          instructorsData.map(async (instructor) => {
            const groupCount =
              (await fetchCountGroupsByInstructor(instructor.id)) || 0;
            return { ...instructor, groupCount };
          })
        );
        setInstructors(instructorsWithGroupCount);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadSecretaries(), loadInstructors()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleOpenSecretaryModal = (secretaryId = null) => {
    setEditingSecretaryId(secretaryId);
    setIsSecretaryModalOpen(true);
  };

  const handleCloseSecretaryModal = () => {
    setIsSecretaryModalOpen(false);
    fetchSecretariesData();
  };

  const handleOpenInstructorModal = (instructorId = null) => {
    setEditingInstructorId(instructorId);
    setIsInstructorModalOpen(true);
  };

  const handleCloseInstructorModal = () => {
    setIsInstructorModalOpen(false);
    fetchInstructorsData();
  };

  const handleOpenInstructorDetails = (instructorId) => {
    if (instructorId) {
      setViewingInstructorId(instructorId);
      setIsInstructorDetailsOpen(true);
    } else {
      console.error("Instructor ID no válido");
    }
  };

  const handleOpenSecretaryDetails = (secretaryId) => {
    if (secretaryId) {
      setViewingSecretaryId(secretaryId);
      setIsSecretaryDetailsOpen(true);
    } else {
      console.error("Secretary ID no válido");
    }
  };

  const handleCloseSecretaryDetails = () => {
    setIsSecretaryDetailsOpen(false);
    setViewingSecretaryId(null);
  };
  const handleCloseInstructorDetails = () => {
    setIsInstructorDetailsOpen(false);
    setViewingInstructorId(null);
  };

  const handleOpenScholarshipModal = () => {
    setIsScholarshipModalOpen(true);
  };

  const handleCloseScholarshipModal = () => {
    setIsScholarshipModalOpen(false);
  };

  const handleOpenConfirmation = (type, item) => {
    if (type === "secretary") {
      setSecretaryToDelete(item);
    } else if (type === "instructor") {
      setInstructorToDelete(item);
    }
    setIsConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setSecretaryToDelete(null);
    setInstructorToDelete(null);
  };

  const handleDeleteSecretary = async () => {
    try {
      await deleteSecretary(secretaryToDelete.id);
      fetchSecretariesData();
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting secretary: ", error);
    }
  };

  const handleDeleteInstructor = async () => {
    try {
      await deleteInstructor(instructorToDelete.id);
      fetchInstructorsData();
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting instructor: ", error);
    }
  };

  const fetchSecretariesData = async () => {
    try {
      const secretariesData = await fetchSecretaries();
      setSecretaries(secretariesData);
    } catch (error) {
      console.error("Error fetching secretaries: ", error);
    }
  };

  const fetchInstructorsData = async () => {
    try {
      const instructorsData = await fetchInstructors();
      const instructorsWithGroupCount = await Promise.all(
        instructorsData.map(async (instructor) => {
          const groupCount =
            (await fetchCountGroupsByInstructor(instructor.id)) || 0;
          return { ...instructor, groupCount };
        })
      );
      setInstructors(instructorsWithGroupCount);
    } catch (error) {
      console.error("Error fetching instructors: ", error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredSecretaries = secretaries.filter((secretary) =>
    secretary.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        {searchTerm && (
          <ClearButton onClick={handleClearSearch}>
            <FaTimes />
          </ClearButton>
        )}
        <SearchIcon />
      </SearchContainer>
      <SectionTitle>Instructores</SectionTitle>
      <TableContainer>
        {filteredInstructors.length === 0 ? (
          <NoDataMessage>
            No hay instructores registrados en el sistema
          </NoDataMessage>
        ) : (
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
                  <td>{instructor.groupCount}</td>
                  <td>
                    <InfoIcon
                      onClick={() => handleOpenInstructorDetails(instructor.id)}
                    />
                    <EditIcon
                      onClick={() => handleOpenInstructorModal(instructor.id)}
                    />
                    <DeleteIcon
                      onClick={() =>
                        handleOpenConfirmation("instructor", instructor)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
      <SectionTitle>Secretarias</SectionTitle>
      <TableContainer>
        {filteredSecretaries.length === 0 ? (
          <NoDataMessage>
            No hay secretarias registradas en el sistema
          </NoDataMessage>
        ) : (
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
                    <InfoIcon
                      onClick={() => handleOpenSecretaryDetails(secretary.id)}
                    />
                    <EditIcon
                      onClick={() => handleOpenSecretaryModal(secretary.id)}
                    />
                    <DeleteIcon
                      onClick={() =>
                        handleOpenConfirmation("secretary", secretary)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
      <ButtonContainer>
        <ActionButton onClick={() => handleOpenInstructorModal()}>
          Agregar Instructor
        </ActionButton>
        <ActionButton onClick={() => handleOpenSecretaryModal()}>
          Agregar Secretaria
        </ActionButton>
      </ButtonContainer>
      <ButtonContainer>
        <ActionButton onClick={handleOpenScholarshipModal}>
          Administrar Alumnos Becados
        </ActionButton>
      </ButtonContainer>
      <InstructorModal
        isOpen={isInstructorModalOpen}
        onClose={handleCloseInstructorModal}
        instructorId={editingInstructorId}
      />
      <SecretaryDetails
        isOpen={isSecretaryDetailsOpen}
        onClose={handleCloseSecretaryDetails}
        secretaryId={viewingSecretaryId}
      />
      <SecretaryModal
        isOpen={isSecretaryModalOpen}
        onClose={handleCloseSecretaryModal}
        secretaryId={editingSecretaryId}
      />
      <InstructorDetails
        isOpen={isInstructorDetailsOpen}
        onClose={handleCloseInstructorDetails}
        instructorId={viewingInstructorId}
      />
      <ScholarshipModal
        isOpen={isScholarshipModalOpen}
        onClose={handleCloseScholarshipModal}
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        onConfirm={
          instructorToDelete ? handleDeleteInstructor : handleDeleteSecretary
        }
        message={`¿Estás seguro de que deseas eliminar a ${
          instructorToDelete ? "el instructor" : "la secretaria"
        } "${
          instructorToDelete ? instructorToDelete.name : secretaryToDelete?.name
        }"?`}
      />
    </Wrapper>
  );
}

const NoDataMessage = styled.p`
  font-size: 18px;
  color: #333;
  text-align: center;
  margin-top: 20px;
`;

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
  position: relative;

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

  th,
  td {
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
    th,
    td {
      font-size: 12px;
      padding: 12px 15px;
    }
  }

  @media (max-width: 480px) {
    th,
    td {
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
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  margin: 10px 10px;
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

const ClearButton = styled.button`
  position: absolute;
  right: 50px;
  top: 10px;
  background: none;
  border: none;
  color: #0b0f8b;
  font-size: 18px;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 480px) {
    right: 45px;
    font-size: 16px;
  }
`;
