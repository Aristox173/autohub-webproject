// src/repositories/UserRepository.ts
import { db } from "../utils/firebase";
import UserFactory from "../factories/UserFactory";
import { User, Mechanic, Supplier } from "../models/user";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

class UserRepository {
  private usersCollection = collection(db, "users");

  async findById(id: string): Promise<User | null> {
    const userDoc = doc(this.usersCollection, id);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    return data.isSupplier
      ? UserFactory.createSupplier(data)
      : UserFactory.createMechanic(data);
  }

  async findAll(): Promise<User[]> {
    const querySnapshot = await getDocs(this.usersCollection);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return data.isSupplier
        ? UserFactory.createSupplier(data)
        : UserFactory.createMechanic(data);
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const newDocRef = doc(this.usersCollection);
    const newUser = data.isSupplier
      ? UserFactory.createSupplier({ id: newDocRef.id, ...data })
      : UserFactory.createMechanic({ id: newDocRef.id, ...data });
    await setDoc(newDocRef, newUser);
    return newUser;
  }

  async update(user: User): Promise<void> {
    const userDoc = doc(this.usersCollection, user.id);
    await updateDoc(userDoc, { ...user });
  }

  async delete(user: User): Promise<void> {
    const userDoc = doc(this.usersCollection, user.id);
    await deleteDoc(userDoc);
  }
}

export default UserRepository;
