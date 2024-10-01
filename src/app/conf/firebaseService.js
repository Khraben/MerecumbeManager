import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch} from "firebase/firestore";
import { db } from "./firebase";

//ADD
export const addStudent = async (student) => {
  try {
    const docRef = await addDoc(collection(db, "students"), student);
    console.log("Estudiante agregado con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error al agregar estudiante: ", e);
    throw e;
  }
};

export const addGroup = async (newGroup) => {
  await addDoc(collection(db, "groups"), newGroup);
 };

 //FETCH
export const fetchInstructors = async () => {
  const querySnapshot = await getDocs(collection(db, "instructors"));
  const instructorsData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }));
  return instructorsData;
};

export const fetchStudents = async () => {
  const querySnapshot = await getDocs(collection(db, "students"));
  const studentsData = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    };
  });
  studentsData.sort((a, b) => a.name.localeCompare(b.name));
  return studentsData;
};

export const fetchStudentDetails = async (studentId) => {
  const studentDoc = await getDoc(doc(db, "students", studentId));
  if (!studentDoc.exists()) {
    throw new Error("Estudiante no encontrado.");
  }

  const studentData = studentDoc.data();
  const groupNamesPromises = studentData.groups.map(async (groupId, index) => {
    if (index === 0 && groupId === "INACTIVO") {
      return "INACTIVO";
    }
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    return groupDoc.exists() ? groupDoc.data().name : "Desconocido";
  });

  const groupNames = await Promise.all(groupNamesPromises);
  return { studentData, groupNames };
};

export const fetchStudentById = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      return studentSnap.data();
    } else {
      throw new Error("No such student!");
    }
  } catch (e) {
    console.error("Error fetching student by ID: ", e);
    throw e;
  }
};

export const fetchGroups = async () => {
  const instructorsSnapshot = await getDocs(collection(db, "instructors"));
  const instructorsMap = {};
  instructorsSnapshot.docs.forEach(doc => {
    instructorsMap[doc.id] = doc.data().name;
  });

  const groupsSnapshot = await getDocs(collection(db, "groups"));
  const groupsData = groupsSnapshot.docs.map(doc => {
    const group = doc.data();
    return {
      id: doc.id,
      ...group,
      instructor: instructorsMap[group.instructor] || "Instructor no encontrado"
    };
  });
  groupsData.sort((a, b) => {
    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayComparison = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    if (dayComparison !== 0) return dayComparison;

    const convertTo24HourFormat = (time) => {
      const [hours, minutes, period] = time.match(/(\d+):(\d+)(\w+)/).slice(1);
      let hours24 = parseInt(hours);
      if (period.toLowerCase() === "pm" && hours !== "12") {
        hours24 += 12;
      }
      if (period.toLowerCase() === "am" && hours === "12") {
        hours24 = 0;
      }
      return `${hours24.toString().padStart(2, '0')}:${minutes}`;
    };

    const startTimeA = convertTo24HourFormat(a.startTime);
    const startTimeB = convertTo24HourFormat(b.startTime);
    return startTimeA.localeCompare(startTimeB);
  });

  return groupsData;
};

export const fetchGroupsByIds = async (groupIds) => {
  const groupPromises = groupIds.map(async (groupId) => {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    return groupDoc.exists() ? { id: groupId, ...groupDoc.data() } : { id: groupId, name: "Grupo no encontrado", level: "" };
  });
  const groupData = await Promise.all(groupPromises);
  return groupData;
};

export const fetchGroupsByDay = async (day) => {
  const querySnapshot = await getDocs(collection(db, "groups"));
  const groupsData = querySnapshot.docs
    .map(doc => doc.data())
    .filter(group => group.day && group.day.toLowerCase() === day.toLowerCase());

  groupsData.sort((a, b) => {
    const convertTo24HourFormat = (time) => {
      const [hours, minutes, period] = time.match(/(\d+):(\d+)(\w+)/).slice(1);
      let hours24 = parseInt(hours);
      if (period.toLowerCase() === "pm" && hours !== "12") {
        hours24 += 12;
      }
      if (period.toLowerCase() === "am" && hours === "12") {
        hours24 = 0;
      }
      return `${hours24.toString().padStart(2, '0')}:${minutes}`;
    };

    const startTimeA = convertTo24HourFormat(a.startTime);
    const startTimeB = convertTo24HourFormat(b.startTime);
    return startTimeA.localeCompare(startTimeB);
  });

  return groupsData;
};

export const fetchGroupDetails = async (groupId) => {
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    throw new Error("Grupo no encontrado.");
  }

  const groupData = groupDoc.data();
  const instructorDoc = await getDoc(doc(db, "instructors", groupData.instructor));
  groupData.instructor = instructorDoc.exists() ? instructorDoc.data().name : "Instructor no encontrado";

  const studentsSnapshot = await getDocs(collection(db, "students"));
  const studentsData = studentsSnapshot.docs
    .map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))
    .filter((student) => student.groups.includes(groupId));

  return { groupData, studentsData };
};

export const fetchExistingGroups = async () => {
 const querySnapshot = await getDocs(collection(db, "groups"));
 const groupsData = querySnapshot.docs.map(doc => doc.data());
 return groupsData;
};

//UPDATE
export const updateStudent = async (studentId, studentData) => {
  try {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, studentData);
    console.log("Estudiante actualizado con ID: ", studentId);
  } catch (e) {
    console.error("Error al actualizar estudiante: ", e);
    throw e;
  }
};

export const updateGroup = async (groupId, updatedGroup) => {
  const groupRef = doc(db, "groups", groupId);
  await updateDoc(groupRef, updatedGroup);
};

//DELETE
export const deleteStudent = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    await deleteDoc(studentRef);
    console.log("Estudiante eliminado con ID: ", studentId);
  } catch (e) {
    console.error("Error al eliminar estudiante: ", e);
    throw e;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId);

    const studentsQuery = query(collection(db, "students"), where("groups", "array-contains", groupId));
    const studentsSnapshot = await getDocs(studentsQuery);

    const batch = writeBatch(db);
    studentsSnapshot.forEach((studentDoc) => {
      const studentData = studentDoc.data();
      const updatedGroups = studentData.groups.filter((group) => group !== groupId);

      if (updatedGroups.length === 0) {
        updatedGroups.push("INACTIVO");
      }

      batch.update(studentDoc.ref, { groups: updatedGroups });
    });

    await batch.commit();
    await deleteDoc(groupRef);
    console.log("Grupo eliminado con ID: ", groupId);
  } catch (e) {
    console.error("Error al eliminar grupo: ", e);
    throw e;
  }
};