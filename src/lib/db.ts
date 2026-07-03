import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { MockLayout, BrandGuideline } from "../types";

export const saveMockLayout = async (userId: string, layout: MockLayout): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "layouts", layout.id);
    await setDoc(docRef, {
      ...layout,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Firestore save error:", err);
    throw err;
  }
};

export const getMockLayouts = async (userId: string): Promise<MockLayout[]> => {
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
    console.error("Firestore fetch error:", err);
    return [];
  }
};

export const deleteMockLayout = async (userId: string, layoutId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "layouts", layoutId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Firestore delete error:", err);
    throw err;
  }
};

export const saveCustomGuideline = async (userId: string, guideline: BrandGuideline): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "guidelines", guideline.id);
    await setDoc(docRef, {
      ...guideline,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Firestore save guideline error:", err);
    throw err;
  }
};

export const getCustomGuidelines = async (userId: string): Promise<BrandGuideline[]> => {
  try {
    const colRef = collection(db, "users", userId, "guidelines");
    const snap = await getDocs(colRef);
    const guidelines: BrandGuideline[] = [];
    snap.forEach((doc) => {
      guidelines.push(doc.data() as BrandGuideline);
    });
    return guidelines;
  } catch (err) {
    console.error("Firestore fetch guidelines error:", err);
    return [];
  }
};
