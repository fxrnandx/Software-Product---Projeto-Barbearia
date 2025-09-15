"use server";
import { createRating } from "@/utils/ratings";
import { createSchedule } from "@/utils/schedules";
import dayjs from "dayjs";
import { success, z } from "zod";
export async function SendSchedule(initialState: any, formData: FormData) {
  const formJson = Object.fromEntries((formData as any).entries());
  const schema = z.object({
    date: z.string().min(1, "Date is required"),
  });
  const result = schema.safeParse(formJson);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }
  const date = dayjs(formJson.date).subtract(3, "hour");
  try {
    await createSchedule({
      employeeId: parseInt(formJson.employeeId as string),
      date: date.toISOString(),
      duration: parseInt(formJson.duration as string),
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to create schedule", error);
    return {
      errors: {
        date: "Failed to create schedule",
      },
    };
  }
}

export async function SendRating(
  shopId: number,
  images: string[],
  initialState: any,
  formData: FormData
) {
  const schema = z.object({
    value: z
      .string()
      .min(1, "Value is required")
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 0 && val <= 10, {
        message: "Value must be between 0 and 10",
      }),
    comment: z.string().optional(),
  });
  const formJson = Object.fromEntries((formData as any).entries());
  const result = schema.safeParse(formJson);
  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors
    };
  }
  const data = {
    shopId: shopId,
    value: (parseInt(formJson.value as string) * 2) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    comment: formJson.comment as string,
    images: images
  }
  try {
    console.log(data);
    await createRating(data);
  } catch (error) {
    console.error("Failed to create rating", error);
    return { error: "Failed to create rating", success: false };
  }
  return { success: true };
}