<script lang="ts" setup>
import type { AuthFormField, ButtonProps, FormSubmitEvent } from "@nuxt/ui";
import { FirebaseError } from "firebase/app";
import { getAdditionalUserInfo, GoogleAuthProvider, type UserCredential } from "firebase/auth";
import { z } from "zod";

const user = useUser();
const registering = ref(false);
const error = ref();
const providers: ButtonProps[] = [
    {
        label: "Mit Google anmelden",
        variant: "subtle",
        color: "neutral",
        icon: "logos:google-icon",
        onClick: onGoogleSignin,
    },
];
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});
const registerSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});
type LoginSchema = z.output<typeof loginSchema>;
type RegisterSchema = z.output<typeof registerSchema>;

const signinFields: AuthFormField[] = [
    {
        name: "email",
        type: "email",
        label: "E-Mail",
        placeholder: "max.mustermann@gmail.com",
        required: true,
    },
    {
        name: "password",
        label: "Passwort",
        type: "password",
        required: true,
    },
    {
        name: "remember",
        label: "Angemeldet bleiben",
        type: "checkbox",
        defaultValue: true,
    },
];
const registerFields: AuthFormField[] = [
    {
        name: "name",
        type: "text",
        label: "Vollständiger Name",
        placeholder: "Max Mustermann",
        required: true,
    },
    {
        name: "email",
        type: "email",
        label: "E-Mail",
        placeholder: "max.mustermann@gmail.com",
        required: true,
    },
    {
        name: "password",
        label: "Passwort",
        type: "password",
        required: true,
    },
    {
        name: "remember",
        label: "Angemeldet bleiben",
        type: "checkbox",
        defaultValue: true,
    },
];

watch(
    () => user.isLogged,
    () => {
        if (user.isLogged) navigateTo("/");
    },
    { immediate: true },
);

async function onSignInSubmit(payload: FormSubmitEvent<LoginSchema>) {
    error.value = undefined;
    try {
        await user.login({ email: payload.data.email, password: payload.data.password, remember: payload.data.remember });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

async function onRegisterSubmit(payload: FormSubmitEvent<RegisterSchema>) {
    error.value = undefined;
    try {
        await user.register({
            email: payload.data.email,
            password: payload.data.password,
            remember: payload.data.remember,
            data: { fullName: payload.data.name },
        });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

async function onGoogleSignin() {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");
        await user.authenticateWithProvider({
            provider: provider,
            userDataDelegate: (credentials: UserCredential) => {
                const info = getAdditionalUserInfo(credentials);
                return <UserData>{
                    fullName: credentials.user.displayName,
                    email: credentials.user.email,
                    id: credentials.user.uid,
                };
            },
        });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

function authErrorToReadable(error: any) {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case "auth/invalid-credential":
                return "Ungültige Anmeldedaten";
            case "auth/invalid-email":
                return "Die angegebene E-Mail ist ungültig";
            case "auth/user-disabled":
                return "Benutzer wurde deaktiviert";
            case "auth/user-not-found":
                return "Benutzer nicht gefunden";
            case "auth/wrong-password":
                return "Das angegebene Passwort ist falsch";
            case "auth/email-already-in-use":
                return "Die E-Mail wird bereits verwendet";
        }
    }
    return "Allgemeiner Authentifizierungsfehler";
}
</script>

<template>
    <div class="flex flex-col items-center mt-4">
        <u-page-card class="w-full max-w-md" variant="soft">
            <div class="flex justify-center w-full">
                <u-tabs
                    :items="[
                        { label: 'Anmelden', value: 'login' },
                        { label: 'Registrieren', value: 'register' },
                    ]"
                    class="w-fit"
                    default-value="login"
                    @update:model-value="
                        (val) => {
                            registering = val === 'register';
                            error = undefined;
                        }
                    "
                ></u-tabs>
            </div>
            <u-auth-form
                v-if="!registering"
                :schema="loginSchema"
                title="Anmelden"
                loading-auto
                :validate-on="['change']"
                :providers="providers"
                :fields="signinFields"
                :submit="{ label: 'Anmelden' }"
                @submit="onSignInSubmit"
            >
                <template #validation>
                    <u-alert v-if="error" color="error" icon="i-lucide-info" title="Fehler beim Zugriff auf das Konto" :description="error" />
                </template>
            </u-auth-form>
            <u-auth-form
                v-else
                :schema="registerSchema"
                title="Registrieren"
                loading-auto
                :validate-on="['change']"
                :providers="providers"
                :fields="registerFields"
                :submit="{ label: 'Konto erstellen' }"
                @submit="onRegisterSubmit"
            >
                <template #validation>
                    <u-alert v-if="error" color="error" icon="i-lucide-info" title="Fehler beim Erstellen des Kontos" :description="error" />
                </template>
            </u-auth-form>
        </u-page-card>
    </div>
</template>

<style></style>
