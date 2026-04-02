import { defineStore } from 'pinia';
import type { UserData } from '~~/shared/types';
import { doc, setDoc, onSnapshot, DocumentSnapshot, type DocumentData, type Unsubscribe } from 'firebase/firestore';
import { updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, inMemoryPersistence, type AuthProvider, type User, type UserCredential, signInWithPopup } from 'firebase/auth';

export const useUser = defineStore('user-store', () => {
    const {$auth, $firestore} = useNuxtApp();
    
    const userData = ref<UserData>();
    const isLogged = ref<boolean>(false);

    var userDataSnapshotUnsub: Unsubscribe | undefined = undefined;
    
    const subscribe = () => {
        $auth.onAuthStateChanged(async (user) =>{
            if (user) {
                userDataSnapshotUnsub = onSnapshot(doc($firestore, "users", user.uid), onUserDataSnapshot);
                isLogged.value = true;
            }
            else {
                console.log('User logged out');
                isLogged.value = false;
                userData.value = undefined;
            }
        })
    };

    const register = async ({ email, password, displayName, remember = true}: { email: string; password: string; displayName: string; remember: boolean }) => {
        await rememberAuth(remember);
        const res = await createUserWithEmailAndPassword($auth, email, password);
        await patch({ email: email, displayName: displayName , id: res.user.uid });
        await updateProfile(res.user, { displayName: displayName });
    };

    const login = async ({ email, password, remember = true}: { email: string; password: string; remember: boolean }) => {
        await rememberAuth(remember);
        await signInWithEmailAndPassword($auth, email, password);
    };

    const authenticateWithProvider = async ({
        provider,
        remember = true,
        userDataDelegate
    }: { 
        provider: AuthProvider; 
        remember?: boolean; 
        userDataDelegate: (credential: UserCredential) => Partial<UserData>
    }): Promise<void> => {
        await rememberAuth(remember);
        const res = await signInWithPopup($auth, provider);
        const userData = userDataDelegate(res);
        await patch(userData);
        await updateProfile(res.user, { displayName: userData.displayName });
    };

    const logout = async () => {
        userDataSnapshotUnsub?.();
        await $auth.signOut();
    };

    const patch = async (data: Partial<UserData>): Promise<boolean> => {
        if (!$auth.currentUser) return false;
        try {
            const document = doc($firestore, "users", $auth.currentUser.uid);
            await setDoc(document, data, { merge: true });
            console.log('User data updated successfully');
        }
        catch (error) {
            console.warn('Error updating user data:', error);
            return false;
        }
        return true;
    };

    async function rememberAuth(remember: boolean) {
        if (remember) {
            await setPersistence($auth, browserLocalPersistence);
        } else {
            await setPersistence($auth, inMemoryPersistence);
        }
    }

    async function onUserDataSnapshot(snapshot: DocumentSnapshot<DocumentData, DocumentData>) {
        const data = snapshot.data();
        if (!data) return;
        console.log('new user data snapshot:', data);
        userData.value = data as UserData;
    }

    return {
        userData,
        isLogged,
        subscribe,
        register,
        login,
        authenticateWithProvider,
        logout,
        patch
    };
});