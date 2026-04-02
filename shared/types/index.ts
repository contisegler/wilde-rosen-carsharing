export interface WithId<T> {
    id: string;
    payload: T;
}

export interface UserData {
    id: string;
    email: string;
    fullName: string;
    lastName: string;
}

export interface FirebaseEmulatorConfig {
    auth: boolean;
    firestore: boolean;
}
