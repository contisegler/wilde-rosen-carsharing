export interface WithId<T> {
    id: string;
    payload: T;
}

export interface FirebaseEmulatorConfig {
    auth: boolean;
    firestore: boolean;
}
