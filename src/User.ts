import * as z from "zod";

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .refine((value) => /[a-z]/.test(value), "Password must contain at least one lowercase letter")
    .refine((value) => /[A-Z]/.test(value), "Password must contain at least one uppercase letter")
    .refine((value) => /\d/.test(value), "Password must contain at least one digit")
    .refine((value) => /[^a-zA-Z0-9]/.test(value), "Password must contain at least one special character");
export const userBaseSchema = z.object({
    id: z.number().int(),
    name: z.string().min(5).max(20),
    email: z.string().email(),
    password: passwordSchema,
    age: z.number().min(16).max(100),
    favoriteColor: z.enum(["Blue","Yellow"], {
        errorMap: (issue, ctx) => ({ message: 'Choose  good COlor' })
    })
});

export const SampleUser = {
    id: 123,
    name: "Jhonny",
    email: "Jhonny@Vegas.com",
    password: "MySecret1Password!",
    age:35,
    favoriteColor:"Blue"
}

export type User = z.infer<typeof userBaseSchema>;

export const userCreateSchema = userBaseSchema.omit({ id: true });
export type UserCreate = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userBaseSchema.partial().required({id:true})

export type UserUpdate = z.infer<typeof userUpdateSchema>;
