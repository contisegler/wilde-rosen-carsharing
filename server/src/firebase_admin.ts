import admin from 'firebase-admin';
import firebaseJson from '~~/firebase.json';
import type { FirebaseEmulatorConfig } from '~~/shared/types';

const appConfig = useAppConfig();

const emulatorsConfig: boolean | FirebaseEmulatorConfig = (appConfig as any).firebase.emulators;
if (process.env.NODE_ENV !== 'production') {
    const authEmulator = emulatorsConfig === true || (emulatorsConfig as FirebaseEmulatorConfig)?.auth === true;
    const firestoreEmulator = emulatorsConfig === true || (emulatorsConfig as FirebaseEmulatorConfig)?.firestore === true;
    if (authEmulator) {
        process.env["FIREBASE_AUTH_EMULATOR_HOST"] = `localhost:${firebaseJson.emulators.auth.port}`;
    }
    if (firestoreEmulator) {
        process.env["FIRESTORE_EMULATOR_HOST"] = `localhost:${firebaseJson.emulators.firestore.port}`;
    }
}
console.log(`[Firebase admin app] connected {emulators: ${JSON.stringify(emulatorsConfig)}}`);

const $adminApp = admin.initializeApp();
const $firestore = $adminApp.firestore();
$firestore.settings({ ignoreUndefinedProperties: true });
const $auth = $adminApp.auth();

export { $auth, $firestore };
export default $adminApp;
