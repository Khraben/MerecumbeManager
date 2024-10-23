import { collection, getDocs, getDoc, setDoc, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const cache = {};

// ADD
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

export const addReceipt = async (receiptData) => {
  const receiptsCollection = collection(db, 'receipts');
  await addDoc(receiptsCollection, receiptData);

  const metadataDoc = doc(db, 'metadata', 'receiptNumber');
  const lastReceiptNumber = receiptData.receiptNumber;
  await setDoc(metadataDoc, { lastReceiptNumber });
};

// FETCH
export const fetchInstructors = async () => {
  if (cache.instructors) return cache.instructors;

  const querySnapshot = await getDocs(collection(db, "instructors"));
  const instructorsData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }));

  cache.instructors = instructorsData;
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
  const groupDetailsPromises = studentData.groups.map(async (groupId, index) => {
    if (index === 0 && groupId === "INACTIVO") {
      return { name: "INACTIVO", level: "" };
    }
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    return groupDoc.exists() ? { name: groupDoc.data().name, level: groupDoc.data().level } : { name: "Desconocido", level: "" };
  });

  const groupDetails = await Promise.all(groupDetailsPromises);
  return { studentData, groupDetails };
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

export const fetchStudentEmail = async (studentId) => {
  const studentRef = doc(db, 'students', studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    return studentSnap.data().email;
  } else {
    console.log("No se encontró el alumno con el ID proporcionado");
    return null;
  }
};

export const fetchGroups = async () => {
  if (cache.groups) return cache.groups;

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
    const levelsOrder = ["Nivel I", "Nivel II", "Nivel III", "Nivel IV", "Taller"];
    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    const levelComparison = levelsOrder.indexOf(a.level) - levelsOrder.indexOf(b.level);
    if (levelComparison !== 0) return levelComparison;

    const dayComparison = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    if (dayComparison !== 0) return dayComparison;

    const convertTo24Hour = (time) => {
      const [hours, minutes] = time.match(/(\d+):(\d+)/).slice(1);
      const period = time.match(/(AM|PM)/i)[1].toUpperCase();
      let hours24 = parseInt(hours, 10);
      if (period === "PM" && hours24 !== 12) hours24 += 12;
      if (period === "AM" && hours24 === 12) hours24 = 0;
      return `${hours24.toString().padStart(2, '0')}:${minutes}`;
    };

    const timeComparison = convertTo24Hour(a.startTime).localeCompare(convertTo24Hour(b.startTime));
    return timeComparison;
  });

  cache.groups = groupsData;
  return groupsData;
};

export const fetchGroupById = async (groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (groupSnap.exists()) {
      return groupSnap.data();
    } else {
      throw new Error("No such group!");
    }
  } catch (e) {
    console.error("Error fetching group by ID: ", e);
    throw e;
  }
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
  try {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      throw new Error("Grupo no encontrado.");
    }

    const groupData = groupDoc.data();

    if (!cache.instructors) {
      const instructorsSnapshot = await getDocs(collection(db, "instructors"));
      cache.instructors = instructorsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
      }, {});
    }

    groupData.instructor = cache.instructors[groupData.instructor] || "Instructor no encontrado";

    const studentsQuery = query(collection(db, "students"), where("groups", "array-contains", groupId));
    const studentsSnapshot = await getDocs(studentsQuery);
    const studentsData = studentsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return { groupData, studentsData };
  } catch (error) {
    console.error("Error fetching group details: ", error);
    throw error;
  }
};

export const fetchExistingGroups = async () => {
  const querySnapshot = await getDocs(collection(db, "groups"));
  const groupsData = querySnapshot.docs.map(doc => doc.data());
  return groupsData;
};

export const fetchLastReceiptNumber = async () => {
  const metadataDoc = doc(db, 'metadata', 'receiptNumber');
  const metadataSnapshot = await getDoc(metadataDoc);

  if (metadataSnapshot.exists()) {
    const data = metadataSnapshot.data();
    return data.lastReceiptNumber;
  } else {
    await setDoc(metadataDoc, { lastReceiptNumber: 0 });
    return 0;
  }
};

export const fetchReceipts = async () => {
  try {
    const receiptsCollection = collection(db, "receipts");
    const receiptsQuery = query(receiptsCollection, orderBy("paymentDate"));
    const querySnapshot = await getDocs(receiptsQuery);

    const receiptsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return receiptsData;
  } catch (e) {
    console.error("Error fetching receipts: ", e);
    throw e;
  }
};

export const fetchReceiptsByMonth = async (monthYear) => {
  try {
    const receiptsRef = collection(db, 'receipts');
    const receiptsQuery = query(
      receiptsRef,
      where('concept', '==', 'Mensualidad'),
      where('specification', '==', monthYear)
    );
    const querySnapshot = await getDocs(receiptsQuery);

    const receipts = [];
    querySnapshot.forEach(doc => {
      receipts.push({ id: doc.id, ...doc.data() });
    });

    return receipts;
  } catch (error) {
    console.error("Error fetching receipts by month: ", error);
    throw error;
  }
};

export const fetchReceiptsByStudentAndConcept = async (studentId, concept) => {
  try {
    const receiptsQuery = query(
      collection(db, "receipts"),
      where("studentId", "==", studentId),
      where("concept", "==", concept)
    );
    const querySnapshot = await getDocs(receiptsQuery);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("Error fetching receipts by student and concept: ", e);
    throw e;
  }
};

export const fetchPaymentsToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const paymentsQuery = query(
    collection(db, "receipts"),
    where("paymentDate", ">=", Timestamp.fromDate(today)),
    where("paymentDate", "<", Timestamp.fromDate(tomorrow))
  );

  const querySnapshot = await getDocs(paymentsQuery);
  return querySnapshot.docs.map(doc => doc.data());
};

export const fetchAttendancesByGroup = async (groupId) => {
  try {
    const q = query(collection(db, 'attendance'), where('groupId', '==', groupId));
    const querySnapshot = await getDocs(q);
    const attendances = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      attendances[doc.id] = {
        groupId: data.groupId,
        studentId: data.studentId,
        date: data.date.toDate()
      };
    });
    return attendances;
  } catch (error) {
    console.error("Error fetching attendances: ", error);
    return {};
  }
};

// BATCH UPDATE
export const batchUpdateAttendance = async (changes) => {
  const batch = writeBatch(db);
  changes.forEach(change => {
    if (change.action === 'delete') {
      const attendanceDoc = doc(db, "attendance", change.id);
      batch.delete(attendanceDoc);
    } else if (change.action === 'add') {
      const attendanceRef = doc(collection(db, 'attendance'));
      batch.set(attendanceRef, {
        date: Timestamp.fromDate(change.date),
        groupId: change.groupId,
        studentId: change.studentId,
      });
    }
  });
  await batch.commit();
};

// UPDATE
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

// DELETE
export const deleteStudent = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    const studentSnapshot = await getDoc(studentRef);
    if (!studentSnapshot.exists()) {
      throw new Error("Student not found");
    }
    const studentName = studentSnapshot.data().name;

    const attendanceQuery = query(collection(db, "attendance"), where("studentId", "==", studentId));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceUpdates = attendanceSnapshot.docs.map(doc => updateDoc(doc.ref, { studentId: studentName }));
    await Promise.all(attendanceUpdates);

    const receiptsQuery = query(collection(db, "receipts"), where("studentId", "==", studentId));
    const receiptsSnapshot = await getDocs(receiptsQuery);
    const receiptsUpdates = receiptsSnapshot.docs.map(doc => updateDoc(doc.ref, { studentId: studentName }));
    await Promise.all(receiptsUpdates);

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