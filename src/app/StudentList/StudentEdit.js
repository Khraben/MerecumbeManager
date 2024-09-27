import { doc, setDoc } from 'firebase/firestore';
import { db } from '../conf/firebase';

const updateStudent = async (editData, studentID) => {
  try {
    const docRef = doc(db, "students", studentID);
    // Update the student document
    await setDoc(docRef, editData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
    return false;
  }
};

export default updateStudent;
