import { z } from 'zod';


export interface IProject {
    id: string;
    name: string;
    description: string;
}

// Zod schema for project validation
export const projectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
    description: z.string().min(1, "Project description is required").max(500, "Project description must be less than 500 characters")
});

// Type inference from Zod schema (optional - you can use this instead of the interface if you prefer)
export type ProjectInput = z.infer<typeof projectSchema>;