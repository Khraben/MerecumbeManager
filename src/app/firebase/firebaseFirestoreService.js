import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

//ADD
export const addStudent = async (student) => {
  try {
    const { groups, ...studentData } = student;
    const docRef = await addDoc(collection(db, "students"), studentData);
    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i];
      if (groupId !== "INACTIVO") {
        await addStudentGroupRelation(docRef.id, groupId, i === 0);
      }
    }
    console.log("Estudiante agregado con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error al agregar estudiante: ", e);
    throw e;
  }
};

export const addInstructor = async (instructor) => {
  try {
    const docRef = await addDoc(collection(db, "instructors"), instructor);
    console.log("Instructor agregado con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error al agregar instructor: ", e);
    throw e;
  }
};

export const addSecretary = async (secretary) => {
  try {
    const docRef = await addDoc(collection(db, "secretaries"), secretary);
    console.log("Secretaria agregada con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error al agregar secretaria: ", e);
    throw e;
  }
};

export const addGroup = async (newGroup) => {
  await addDoc(collection(db, "groups"), newGroup);
};

export const addReceipt = async (receiptData) => {
  const receiptsCollection = collection(db, "receipts");
  await addDoc(receiptsCollection, receiptData);

  const metadataDoc = doc(db, "metadata", "receiptNumber");
  const lastReceiptNumber = receiptData.receiptNumber;
  await setDoc(metadataDoc, { lastReceiptNumber });
};

export const addAttendance = async (date, groupId, studentId) => {
  try {
    await addDoc(collection(db, "attendance"), {
      date: Timestamp.fromDate(date),
      groupId: groupId,
      studentId: studentId,
    });
  } catch (error) {
    console.error("Error adding attendance: ", error);
  }
};

export const addStudentGroupRelation = async (
  studentId,
  groupId,
  isPrimary = false
) => {
  try {
    await addDoc(collection(db, "studentGroups"), {
      studentId,
      groupId,
      isPrimary,
    });
  } catch (e) {
    console.error("Error adding student-group relation: ", e);
    throw e;
  }
};

export const addScholarshipStudent = async (studentId) => {
  try {
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${currentDate.getFullYear()}`;
    await addDoc(collection(db, "scholarshipStudents"), {
      studentId,
      dateAdded: formattedDate,
    });
    console.log("Scholarship student added with ID: ", studentId);
  } catch (e) {
    console.error("Error adding scholarship student: ", e);
    throw e;
  }
};

//FETCH
export const fetchStudents = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, "students"), orderBy("name"))
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchStudentDetails = async (studentId) => {
  const studentDoc = await getDoc(doc(db, "students", studentId));
  if (!studentDoc.exists()) {
    throw new Error("Estudiante no encontrado.");
  }

  const studentData = studentDoc.data();
  const q = query(
    collection(db, "studentGroups"),
    where("studentId", "==", studentId)
  );
  const querySnapshot = await getDocs(q);

  const groupDetailsPromises = querySnapshot.docs.map(async (docSnapshot) => {
    const { groupId, isPrimary } = docSnapshot.data();
    if (groupId === "INACTIVO") {
      return { name: "INACTIVO", level: "", isPrimary };
    }
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    return groupDoc.exists()
      ? { name: groupDoc.data().name, level: groupDoc.data().level, isPrimary }
      : { name: "Desconocido", level: "", isPrimary };
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
  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    return studentSnap.data().email;
  } else {
    console.log("No se encontró el alumno con el ID proporcionado");
    return null;
  }
};

export const fetchStudentsByGroup = async (groupId) => {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("groupId", "==", groupId));
    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return students;
  } catch (error) {
    console.error("Error fetching students by group: ", error);
    throw error;
  }
};

export const fetchActiveStudents = async () => {
  const studentGroupsSnapshot = await getDocs(collection(db, "studentGroups"));
  const activeStudentIds = new Set(
    studentGroupsSnapshot.docs.map((doc) => doc.data().studentId)
  );

  const studentsSnapshot = await getDocs(collection(db, "students"));
  const activeStudents = studentsSnapshot.docs
    .filter((doc) => activeStudentIds.has(doc.id))
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  return activeStudents;
};

export const fetchInstructors = async () => {
  const querySnapshot = await getDocs(collection(db, "instructors"));
  const instructorsData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    phone: doc.data().phone,
    user: doc.data().user,
    email: doc.data().email,
  }));
  return instructorsData;
};

export const fetchInstructorById = async (instructorId) => {
  try {
    const instructorRef = doc(db, "instructors", instructorId);
    const instructorSnap = await getDoc(instructorRef);
    if (instructorSnap.exists()) {
      return instructorSnap.data();
    } else {
      throw new Error("No se encontró el instructor!");
    }
  } catch (e) {
    console.error("Error al obtener los datos del instructor por ID: ", e);
    throw e;
  }
};

export const fetchInstructorByEmail = async (email) => {
  const instructorsQuery = query(
    collection(db, "instructors"),
    where("email", "==", email)
  );
  const instructorsSnapshot = await getDocs(instructorsQuery);
  if (!instructorsSnapshot.empty) {
    return {
      id: instructorsSnapshot.docs[0].id,
      ...instructorsSnapshot.docs[0].data(),
    };
  } else {
    throw new Error("Instructor no encontrado");
  }
};

export const fetchSecretaries = async () => {
  const querySnapshot = await getDocs(collection(db, "secretaries"));
  const secretariesData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    phone: doc.data().phone,
    username: doc.data().username,
  }));
  return secretariesData;
};

export const fetchSecretaryById = async (secretaryId) => {
  try {
    const secretaryRef = doc(db, "secretaries", secretaryId);
    const secretarySnap = await getDoc(secretaryRef);
    if (secretarySnap.exists()) {
      return secretarySnap.data();
    } else {
      throw new Error("No such secretary!");
    }
  } catch (e) {
    console.error("Error fetching secretary by ID: ", e);
    throw e;
  }
};

export const fetchCountGroupsByInstructor = async (instructorId) => {
  try {
    const groupsQuery = query(
      collection(db, "groups"),
      where("instructor", "==", instructorId)
    );
    const querySnapshot = await getDocs(groupsQuery);
    return querySnapshot.size;
  } catch (e) {
    console.error("Error counting groups by instructor: ", e);
    throw e;
  }
};

export const fetchGroups = async () => {
  const instructorsSnapshot = await getDocs(collection(db, "instructors"));
  const instructorsMap = {};
  instructorsSnapshot.docs.forEach((doc) => {
    instructorsMap[doc.id] = doc.data().name;
  });

  const groupsSnapshot = await getDocs(collection(db, "groups"));
  const groupsData = groupsSnapshot.docs.map((doc) => {
    const group = doc.data();
    return {
      id: doc.id,
      ...group,
      instructor:
        instructorsMap[group.instructor] || "Instructor no encontrado",
    };
  });

  groupsData.sort((a, b) => {
    const levelsOrder = [
      "Nivel I",
      "Nivel II-A",
      "Nivel II-B",
      "Nivel III-1",
      "Nivel III-2",
      "Nivel III-3",
      "Nivel IV",
      "Taller",
    ];
    const daysOrder = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const levelComparison =
      levelsOrder.indexOf(a.level) - levelsOrder.indexOf(b.level);
    if (levelComparison !== 0) return levelComparison;

    const dayComparison = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    if (dayComparison !== 0) return dayComparison;

    const convertTo24Hour = (time) => {
      const [hours, minutes] = time.match(/(\d+):(\d+)/).slice(1);
      const period = time.match(/(AM|PM)/i)[1].toUpperCase();
      let hours24 = parseInt(hours, 10);
      if (period === "PM" && hours24 !== 12) hours24 += 12;
      if (period === "AM" && hours24 === 12) hours24 = 0;
      return `${hours24.toString().padStart(2, "0")}:${minutes}`;
    };

    const timeComparison = convertTo24Hour(a.startTime).localeCompare(
      convertTo24Hour(b.startTime)
    );
    return timeComparison;
  });

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
    return groupDoc.exists()
      ? { id: groupId, ...groupDoc.data() }
      : { id: groupId, name: "Grupo no encontrado", level: "" };
  });
  const groupData = await Promise.all(groupPromises);
  return groupData;
};

export const fetchGroupsByDay = async (day) => {
  const querySnapshot = await getDocs(collection(db, "groups"));
  const groupsData = querySnapshot.docs
    .map((doc) => doc.data())
    .filter(
      (group) => group.day && group.day.toLowerCase() === day.toLowerCase()
    );

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
      return `${hours24.toString().padStart(2, "0")}:${minutes}`;
    };

    const startTimeA = convertTo24HourFormat(a.startTime);
    const startTimeB = convertTo24HourFormat(b.startTime);
    return startTimeA.localeCompare(startTimeB);
  });

  return groupsData;
};

export const fetchGroupsByInstructor = async (instructorId) => {
  try {
    const groupsQuery = query(
      collection(db, "groups"),
      where("instructor", "==", instructorId)
    );
    const querySnapshot = await getDocs(groupsQuery);
    const groupsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return groupsData;
  } catch (e) {
    console.error("Error fetching groups by instructor: ", e);
    throw e;
  }
};

export const fetchGroupDetails = async (groupId) => {
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    throw new Error("Grupo no encontrado.");
  }

  const groupData = groupDoc.data();
  const instructorDoc = await getDoc(
    doc(db, "instructors", groupData.instructor)
  );
  groupData.instructor = instructorDoc.exists()
    ? instructorDoc.data().name
    : "Instructor no encontrado";

  const studentIds = await fetchStudentGroupsByGroupId(groupId);
  const studentPromises = studentIds.map(async (studentId) => {
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) return null;

    const studentData = studentDoc.data();
    const studentGroups = await fetchStudentGroupsByStudentId(studentId);
    const isPrimaryGroup =
      (
        await getDocs(
          query(
            collection(db, "studentGroups"),
            where("studentId", "==", studentId),
            where("groupId", "==", groupId),
            where("isPrimary", "==", true)
          )
        )
      ).size > 0;

    return {
      ...studentData,
      id: studentId,
      groups: studentGroups,
      isPrimaryGroup: isPrimaryGroup,
    };
  });

  const studentsData = (await Promise.all(studentPromises)).filter(
    (student) => student !== null
  );
  studentsData.sort((a, b) => a.name.localeCompare(b.name));

  return { groupData, studentsData };
};

export const fetchExistingGroups = async () => {
  const querySnapshot = await getDocs(collection(db, "groups"));
  const groupsData = querySnapshot.docs.map((doc) => doc.data());
  return groupsData;
};

export const fetchLastReceiptNumber = async () => {
  const metadataDoc = doc(db, "metadata", "receiptNumber");
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

    const receiptsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return receiptsData;
  } catch (e) {
    console.error("Error fetching receipts: ", e);
    throw e;
  }
};

export const fetchReceiptsByMonth = async (monthYear) => {
  try {
    const receiptsRef = collection(db, "receipts");
    const receiptsQuery = query(
      receiptsRef,
      where("concept", "==", "Mensualidad"),
      where("specification", "==", monthYear)
    );
    const querySnapshot = await getDocs(receiptsQuery);

    const receipts = [];
    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });

    return receipts;
  } catch (error) {
    console.error("Error fetching receipts by month: ", error);
    throw error;
  }
};

export const fetchReceiptsByWorkshop = async (workshop) => {
  try {
    const receiptsRef = collection(db, "receipts");
    const receiptsQuery = query(
      receiptsRef,
      where("concept", "==", "Taller"),
      where("specification", "==", workshop)
    );
    const querySnapshot = await getDocs(receiptsQuery);

    const receipts = [];
    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });
    console.log("Receipts by workshop: ", receipts);

    return receipts;
  } catch (error) {
    console.error("Error fetching receipts by workshop: ", error);
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
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (e) {
    console.error("Error fetching receipts by student and concept: ", e);
    throw e;
  }
};

export const fetchReceiptsByStudentAndMonth = async (studentId, monthYear) => {
  try {
    const receiptsRef = collection(db, "receipts");
    const receiptsQuery = query(
      receiptsRef,
      where("concept", "==", "Mensualidad"),
      where("studentId", "==", studentId),
      where("specification", "==", monthYear)
    );
    const querySnapshot = await getDocs(receiptsQuery);
    const receipts = [];
    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });
    return receipts;
  } catch (error) {
    console.error("Error fetching receipts by Student And month: ", error);
    throw error;
  }
};

export const fetchReceiptByNumber = async (receiptNumber) => {
  try {
    const receiptsQuery = query(
      collection(db, "receipts"),
      where("receiptNumber", "==", receiptNumber)
    );
    const querySnapshot = await getDocs(receiptsQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    } else {
      throw new Error("Receipt not found");
    }
  } catch (e) {
    console.error("Error fetching receipt by number: ", e);
    throw e;
  }
};

export const fetchAttendances = async () => {
  try {
    const attendancesCollection = collection(db, "attendance");
    const querySnapshot = await getDocs(attendancesCollection);

    const attendancesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return attendancesData;
  } catch (e) {
    console.error("Error fetching attendances: ", e);
    throw e;
  }
};

export const fetchSpecificAttendance = async (groupId, studentId, date) => {
  try {
    const q = query(
      collection(db, "attendance"),
      where("groupId", "==", groupId),
      where("studentId", "==", studentId),
      where("date", "==", Timestamp.fromDate(date))
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error("Error finding attendance: ", error);
    return null;
  }
};

export const fetchAttendancesByGroup = async (groupId) => {
  try {
    const q = query(
      collection(db, "attendance"),
      where("groupId", "==", groupId)
    );
    const querySnapshot = await getDocs(q);
    const attendances = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      attendances[doc.id] = {
        groupId: data.groupId,
        studentId: data.studentId,
        date: data.date.toDate(),
      };
    });
    return attendances;
  } catch (error) {
    console.error("Error fetching attendances: ", error);
    return {};
  }
};

export const fetchAttendancesByStudentAndMonth = async (
  studentId,
  monthYear
) => {
  try {
    const attendances = [];
    const attendancesQuery = query(
      collection(db, "attendance"),
      where("studentId", "==", studentId),
      where("monthYear", "==", monthYear)
    );

    const snapshot = await getDocs(attendancesQuery);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const attendanceDate =
        data.date instanceof Date ? data.date : data.date.toDate();
      attendances.push({ ...data, date: attendanceDate });
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching attendances: ", error);
    throw error;
  }
};

export const fetchEmailByUsername = async (username) => {
  const secretariesQuery = query(
    collection(db, "secretaries"),
    where("username", "==", username)
  );
  const secretariesSnapshot = await getDocs(secretariesQuery);

  const ownersQuery = query(
    collection(db, "owners"),
    where("username", "==", username)
  );
  const ownersSnapshot = await getDocs(ownersQuery);

  const instructorsQuery = query(
    collection(db, "instructors"),
    where("username", "==", username)
  );
  const instructorsSnapshot = await getDocs(instructorsQuery);

  if (!secretariesSnapshot.empty) {
    return secretariesSnapshot.docs[0].data().email;
  }

  if (!ownersSnapshot.empty) {
    return ownersSnapshot.docs[0].data().email;
  }

  if (!instructorsSnapshot.empty) {
    return instructorsSnapshot.docs[0].data().email;
  }
  return null;
};

export const fetchStudentGroupsByStudentId = async (studentId) => {
  const q = query(
    collection(db, "studentGroups"),
    where("studentId", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().groupId);
};

export const fetchStudentGroupsByGroupId = async (groupId) => {
  const q = query(
    collection(db, "studentGroups"),
    where("groupId", "==", groupId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().studentId);
};

export const fetchScholarshipStudents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "scholarshipStudents"));
    return querySnapshot.docs.map((doc) => ({
      studentId: doc.data().studentId,
      dateAdded: doc.data().dateAdded,
    }));
  } catch (e) {
    console.error("Error fetching scholarship students: ", e);
    throw e;
  }
};

export const fetchEligibleStudentsForGroup = async (groupId) => {
  const levelsOrder = [
    "Nivel I",
    "Nivel II-A",
    "Nivel II-B",
    "Nivel III-1",
    "Nivel III-2",
    "Nivel III-3",
    "Nivel IV",
  ];

  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) {
    throw new Error("Grupo no encontrado.");
  }
  const currentGroupLevel = groupSnap.data().level;
  const currentGroupLevelIndex = levelsOrder.indexOf(currentGroupLevel);

  const studentsSnapshot = await getDocs(collection(db, "students"));
  const studentGroupsSnapshot = await getDocs(collection(db, "studentGroups"));

  const studentGroupsMap = {};
  studentGroupsSnapshot.docs.forEach((doc) => {
    const { studentId, groupId, isPrimary } = doc.data();
    if (!studentGroupsMap[studentId]) {
      studentGroupsMap[studentId] = [];
    }
    studentGroupsMap[studentId].push({ groupId, isPrimary });
  });

  const eligibleStudents = [];
  for (const studentDoc of studentsSnapshot.docs) {
    const studentId = studentDoc.id;
    const studentData = studentDoc.data();
    const groups = studentGroupsMap[studentId] || [];

    if (groups.some((group) => group.groupId === groupId)) {
      continue;
    }

    let hasEligibleGroup = false;
    for (const group of groups) {
      const groupRef = doc(db, "groups", group.groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        continue;
      }
      const groupLevel = groupSnap.data().level;
      const groupLevelIndex = levelsOrder.indexOf(groupLevel);
      if (
        groupLevelIndex >= currentGroupLevelIndex &&
        groupLevel !== "Taller"
      ) {
        hasEligibleGroup = true;
        break;
      }
    }

    if (hasEligibleGroup) {
      eligibleStudents.push({ id: studentId, ...studentData });
    }
  }

  return eligibleStudents;
};

//UPDATE
export const updateStudent = async (studentId, studentData) => {
  try {
    const { groups, ...updatedData } = studentData;
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, updatedData);

    const existingGroups = await fetchStudentGroupsByStudentId(studentId);
    for (const groupId of existingGroups) {
      await deleteStudentGroupRelation(studentId, groupId);
    }

    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i];
      if (groupId !== "INACTIVO") {
        await addStudentGroupRelation(studentId, groupId, i === 0);
      }
    }

    console.log("Estudiante actualizado con ID: ", studentId);
  } catch (e) {
    console.error("Error al actualizar estudiante: ", e);
    throw e;
  }
};

export const updateInstructor = async (instructorId, instructorData) => {
  try {
    const instructorRef = doc(db, "instructors", instructorId);
    await updateDoc(instructorRef, instructorData);
    console.log("Instructor actualizado con ID: ", instructorId);
  } catch (e) {
    console.error("Error al actualizar instructor: ", e);
    throw e;
  }
};

export const updateSecretary = async (secretaryId, secretaryData) => {
  try {
    const secretaryRef = doc(db, "secretaries", secretaryId);
    await updateDoc(secretaryRef, secretaryData);
    console.log("Secretaria actualizada con ID: ", secretaryId);
  } catch (e) {
    console.error("Error al actualizar secretaria: ", e);
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
    const studentSnapshot = await getDoc(studentRef);
    if (!studentSnapshot.exists()) {
      throw new Error("Student not found");
    }

    const studentData = studentSnapshot.data();
    const studentName = studentData.name;

    const existingGroups = await fetchStudentGroupsByStudentId(studentId);
    for (const groupId of existingGroups) {
      await deleteStudentGroupRelation(studentId, groupId);
    }

    const attendanceQuery = query(
      collection(db, "attendance"),
      where("studentId", "==", studentId)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    for (const attendanceDoc of attendanceSnapshot.docs) {
      await updateDoc(attendanceDoc.ref, { studentId: studentName + "*" });
    }

    const receiptQuery = query(
      collection(db, "receipts"),
      where("studentId", "==", studentId)
    );
    const receiptSnapshot = await getDocs(receiptQuery);
    for (const receiptDoc of receiptSnapshot.docs) {
      await updateDoc(receiptDoc.ref, { studentId: studentName + "*" });
    }

    await deleteDoc(studentRef);
    console.log("Estudiante eliminado con ID: ", studentId);
  } catch (e) {
    console.error("Error al eliminar estudiante: ", e);
    throw e;
  }
};

export const deleteInstructor = async (instructorId) => {
  try {
    const instructorRef = doc(db, "instructors", instructorId);
    await deleteDoc(instructorRef);
    console.log("Instructor eliminado con ID: ", instructorId);
  } catch (e) {
    console.error("Error al eliminar instructor: ", e);
    throw e;
  }
};

export const deleteSecretary = async (secretaryId) => {
  try {
    const secretaryRef = doc(db, "secretaries", secretaryId);
    await deleteDoc(secretaryRef);
    console.log("Secretaria eliminada con ID: ", secretaryId);
  } catch (e) {
    console.error("Error al eliminar secretaria: ", e);
    throw e;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupSnapshot = await getDoc(groupRef);
    if (!groupSnapshot.exists()) {
      throw new Error("Group not found");
    }

    const groupName = groupSnapshot.data().name;

    const studentsInGroup = await fetchStudentGroupsByGroupId(groupId);
    for (const studentId of studentsInGroup) {
      await deleteStudentGroupRelation(studentId, groupId);
    }

    const attendanceQuery = query(
      collection(db, "attendance"),
      where("groupId", "==", groupId)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    for (const attendanceDoc of attendanceSnapshot.docs) {
      await updateDoc(attendanceDoc.ref, { groupId: groupName + "*" });
    }

    await deleteDoc(groupRef);
    console.log("Grupo eliminado con ID: ", groupId);
  } catch (e) {
    console.error("Error al eliminar grupo: ", e);
    throw e;
  }
};

export const deleteAttendance = async (attendanceId) => {
  try {
    const attendanceDoc = doc(db, "attendance", attendanceId);
    await deleteDoc(attendanceDoc);
  } catch (e) {
    console.error("Error deleting attendance: ", e);
    throw e;
  }
};

export const deleteStudentGroupRelation = async (studentId, groupId) => {
  try {
    const q = query(
      collection(db, "studentGroups"),
      where("studentId", "==", studentId),
      where("groupId", "==", groupId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (e) {
    console.error("Error deleting student-group relation: ", e);
    throw e;
  }
};

export const deleteScholarshipStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, "scholarshipStudents"),
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    console.log("Scholarship student deleted with ID: ", studentId);
  } catch (e) {
    console.error("Error deleting scholarship student: ", e);
    throw e;
  }
};

//CHECK
export const isEmailRegistered = async (email) => {
  const secretariesQuery = query(
    collection(db, "secretaries"),
    where("email", "==", email)
  );
  const secretariesSnapshot = await getDocs(secretariesQuery);

  const ownersQuery = query(
    collection(db, "owners"),
    where("email", "==", email)
  );
  const ownersSnapshot = await getDocs(ownersQuery);

  const instructorsQuery = query(
    collection(db, "instructors"),
    where("email", "==", email)
  );
  const instructorsSnapshot = await getDocs(instructorsQuery);

  return (
    !secretariesSnapshot.empty ||
    !ownersSnapshot.empty ||
    !instructorsSnapshot.empty
  );
};

export const isUsernameRegistered = async (username) => {
  const secretariesQuery = query(
    collection(db, "secretaries"),
    where("username", "==", username)
  );
  const secretariesSnapshot = await getDocs(secretariesQuery);

  const ownersQuery = query(
    collection(db, "owners"),
    where("username", "==", username)
  );
  const ownersSnapshot = await getDocs(ownersQuery);

  const instructorsQuery = query(
    collection(db, "instructors"),
    where("username", "==", username)
  );
  const instructorsSnapshot = await getDocs(instructorsQuery);

  return (
    !secretariesSnapshot.empty ||
    !ownersSnapshot.empty ||
    !instructorsSnapshot.empty
  );
};
