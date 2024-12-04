import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import {
  fetchGroupDetails,
  fetchGroups,
  deleteGroup,
  addStudentGroupRelation,
  fetchStudentGroupRelation,
} from "../firebase/firebaseFirestoreService";
import ConfirmationModal from "./ConfirmationModal";
import Loading from "./Loading";

const levelsOrder = [
  "Nivel I",
  "Nivel II-A",
  "Nivel II-B",
  "Nivel III-1",
  "Nivel III-2",
  "Nivel III-3",
  "Nivel IV",
];

export default function ReassignStudentsModal({ groupId, isOpen, onClose }) {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [reassignments, setReassignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { studentsData, groupData } = await fetchGroupDetails(groupId);
        const allGroups = await fetchGroups();
        const currentGroupLevelIndex = levelsOrder.indexOf(groupData.level);
        const filteredGroups = allGroups.filter(
          (group) =>
            levelsOrder.indexOf(group.level) <= currentGroupLevelIndex &&
            group.id !== groupId &&
            group.level !== "Taller"
        );
        setStudents(studentsData);
        setGroups(filteredGroups);
        setGroupToDelete(groupData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, groupId]);

  const handleReassignmentChange = (studentId, newGroupId) => {
    setReassignments((prev) => ({
      ...prev,
      [studentId]: newGroupId,
    }));
  };

  const handleCancel = () => {
    setReassignments({});
    onClose();
  };

  const handleProceed = async () => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      for (const studentId in reassignments) {
        const newGroupId = reassignments[studentId];
        if (newGroupId && newGroupId !== "") {
          const studentGroupRelation = await fetchStudentGroupRelation(
            studentId,
            groupId
          );
          const isPrimary = studentGroupRelation?.isPrimary || false;
          await addStudentGroupRelation(studentId, newGroupId, isPrimary);
        }
      }
      await deleteGroup(groupId);
      onClose();
    } catch (error) {
      console.error("Error reassigning students and deleting group:", error);
    }
  };

  if (!isOpen) return null;
  if (loading) return <Loading />;

  const femaleStudents = students
    .filter((student) => student.gender === "Mujer")
    .sort((a, b) => b.isPrimaryGroup - a.isPrimaryGroup);

  const maleStudents = students
    .filter((student) => student.gender === "Hombre")
    .sort((a, b) => b.isPrimaryGroup - a.isPrimaryGroup);

  return (
    <>
      <Overlay>
        <ModalContainer>
          <ModalHeader>
            <CloseButton onClick={handleCancel}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <Title>Reubicar Alumnos</Title>
            <Table>
              <thead>
                <tr>
                  <th>Nombre Alumno</th>
                  <th>Reubicar en Grupo</th>
                </tr>
              </thead>
              <tbody>
                {femaleStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <Select
                        value={reassignments[student.id] || ""}
                        onChange={(e) =>
                          handleReassignmentChange(student.id, e.target.value)
                        }
                      >
                        <option value="">No Reubicar</option>
                        {groups.map((group) => {
                          const isDisabled = student.groups.includes(group.id);
                          return (
                            <option
                              key={group.id}
                              value={group.id}
                              disabled={isDisabled}
                            >
                              {group.level +
                                " - " +
                                group.name +
                                " - " +
                                group.instructor}
                            </option>
                          );
                        })}
                      </Select>
                    </td>
                  </tr>
                ))}
                {maleStudents.length > 0 && femaleStudents.length > 0 && (
                  <tr className="divider-row">
                    <td colSpan="2"></td>
                  </tr>
                )}
                {maleStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <Select
                        value={reassignments[student.id] || ""}
                        onChange={(e) =>
                          handleReassignmentChange(student.id, e.target.value)
                        }
                      >
                        <option value="">No Reubicar</option>
                        {groups.map((group) => {
                          const isDisabled = student.groups.includes(group.id);
                          return (
                            <option
                              key={group.id}
                              value={group.id}
                              disabled={isDisabled}
                            >
                              {group.level +
                                " - " +
                                group.name +
                                " - " +
                                group.instructor}
                            </option>
                          );
                        })}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <ButtonContainer>
              <CancelButton onClick={handleCancel}>Cancelar</CancelButton>
              <ProceedButton onClick={handleProceed}>Proceder</ProceedButton>
            </ButtonContainer>
          </ModalBody>
        </ModalContainer>
      </Overlay>
      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirm}
          message={`¿Estás seguro que deseas eliminar el grupo "${groupToDelete?.name}", y reubicar a los alumnos según lo seleccionado?`}
        />
      )}
    </>
  );
}

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
  width: 400px;
  max-width: 90vw;
  max-height: 60vh;
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
    margin-left: 20px;
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
    margin-left: 45px;
    margin-right: 5px;
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
  color: #333333;

  &:hover {
    color: #242424;
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

const Title = styled.h2`
  font-size: 24px;
  color: #333333;
  margin-bottom: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    padding: 8px;
    border: 1px solid #ccc;
    text-align: left;
  }

  th {
    background-color: #333333;
    color: #fff;
  }

  .divider-row td {
    background-color: transparent;
    border: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  background-color: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #ccc;
  }

  &:focus {
    outline: none;
  }
`;

const ProceedButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  background-color: #333333;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #242424;
  }

  &:focus {
    outline: none;
  }
`;
