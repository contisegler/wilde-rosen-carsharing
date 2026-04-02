import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import type { FirebaseEmulatorConfig } from '~~/shared/types';
import firebaseJson from '~~/firebase.json';

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const appConfig = useAppConfig();
    const runtimeConfig = useRuntimeConfig();
    const clientAppConfig = {
      apiKey: runtimeConfig.public.firebaseApiKey,
      authDomain: runtimeConfig.public.firebaseAuthDomain,
      projectId: runtimeConfig.public.firebaseProjectId,
      storageBucket: runtimeConfig.public.firebaseStorageBucket,
      messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
      appId: runtimeConfig.public.firebaseAppId,
    };

    const app = initializeApp(clientAppConfig);
    const auth = getAuth(app);
    const firestore = initializeFirestore(app, {ignoreUndefinedProperties: true});

    const emulatorsConfig: boolean | FirebaseEmulatorConfig = (appConfig as any).firebase.emulators;
    if (process.env.NODE_ENV !== 'production') {
      const authEmulator = emulatorsConfig === true || (emulatorsConfig as FirebaseEmulatorConfig)?.auth === true;
      const firestoreEmulator = emulatorsConfig === true || (emulatorsConfig as FirebaseEmulatorConfig)?.firestore === true;
      if (authEmulator) {
        connectAuthEmulator(auth, `http://localhost:${firebaseJson.emulators.auth.port}`);
      }
      if (firestoreEmulator) {
        connectFirestoreEmulator(firestore, 'localhost', firebaseJson.emulators.firestore.port);
      }
    }
    console.log(`[Firebase] initialized {emulators: ${JSON.stringify(emulatorsConfig)}}`);
    return {
      provide: {
        firestore: firestore,
        auth: auth
      },
    };
  },
  enforce: "pre",
});