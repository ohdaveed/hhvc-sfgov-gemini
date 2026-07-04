import { db, handleFirestoreError, OperationType } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { MockLayout, BrandGuideline } from "../types";

export const saveMockLayout = async (userId: string, layout: MockLayout): Promise<void> => {
  const path = `users/${userId}/layouts/${layout.id}`;
  try {
    const docRef = doc(db, "users", userId, "layouts", layout.id);
    await setDoc(docRef, {
      ...layout,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const getMockLayouts = async (userId: string): Promise<MockLayout[]> => {
  const path = `users/${userId}/layouts`;
  try {
    const colRef = collection(db, "users", userId, "layouts");
    const q = query(colRef);
    const snap = await getDocs(q);
    const layouts: MockLayout[] = [];
    snap.forEach((doc) => {
      layouts.push(doc.data() as MockLayout);
    });
    return layouts;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
};

export const deleteMockLayout = async (userId: string, layoutId: string): Promise<void> => {
  const path = `users/${userId}/layouts/${layoutId}`;
  try {
    const docRef = doc(db, "users", userId, "layouts", layoutId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const saveCustomGuideline = async (userId: string, guideline: BrandGuideline): Promise<void> => {
  const path = `users/${userId}/guidelines/${guideline.id}`;
  try {
    const docRef = doc(db, "users", userId, "guidelines", guideline.id);
    await setDoc(docRef, {
      ...guideline,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const getCustomGuidelines = async (userId: string): Promise<BrandGuideline[]> => {
  const path = `users/${userId}/guidelines`;
  try {
    const colRef = collection(db, "users", userId, "guidelines");
    const snap = await getDocs(colRef);
    const guidelines: BrandGuideline[] = [];
    snap.forEach((doc) => {
      guidelines.push(doc.data() as BrandGuideline);
    });
    return guidelines;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
};
