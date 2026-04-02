<template>
    <div class="flex flex-col gap-4">
        <u-card class="my-4" variant="subtle">
            <template #header>
                <div class="flex items-center gap-2 flex-wrap">
                    <p class="typ-subtitle">Hello 👋</p>
                    <u-user :name="user.userData?.fullName" class="ml-auto"></u-user>
                </div>
            </template>
            <u-form v-if="user.userData" :schema="formSchema" :state="user.userData" @submit="onSubmit" class="flex flex-col gap-4">
                <u-form-field label="Full name" required name="fullName">
                    <u-input v-model="user.userData.fullName"></u-input>
                </u-form-field>
                <u-button type="submit" label="Save" variant="subtle" class="w-fit ml-auto"></u-button>
            </u-form>

            <template #footer>
                <u-button label="Logout" icon="lucide:log-out" @click="logout" color="neutral" variant="soft"></u-button>
            </template>
        </u-card>


    </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const formSchema = z.object({ fullName: z.string().nonempty() });
type FormSchema = z.infer<typeof formSchema>;

const toast = useToast();
const user = useUser();

async function onSubmit(e: FormSubmitEvent<FormSchema>) {
    if (await user.patch(e.data)) {
        toast.add({ title: "Data saved", color: "success" });
    } else {
        toast.add({ title: "Error saving data", color: "warning" });
    }
}

async function logout() {
    await user.logout();
    navigateTo("/");
}
</script>

<style></style>
