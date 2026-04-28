"use server";

import { cookies } from "next/headers";
import { flattenToSingleMessage } from "@/lib/utils";
import { FetchResponse } from "@/types";
import { FlixUserRegisterSchema, JWTResponse } from "@/types/flix";
import { z } from "zod";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { resFail, resOk, withErrorHandling } from "@/lib/response-wrappers";

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const loginAction = withErrorHandling(
  async (formData: FormData): Promise<FetchResponse<JWTResponse>> => {
    const result = loginSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!result.success) {
      return resFail({
        message: "Invalid login data",
        fields: flattenToSingleMessage(result.error.flatten().fieldErrors),
        status: 400,
      });
    }

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/auth/jwt/create/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
        cache: "no-store", // Ensure we don't cache login responses
      },
    );

     if (!response.ok) {
      return resFail({
        message: "Invalid username or password",
        status: response.status,
      });
    }

    const session = await response.json();

    const cookieStore = await cookies();

    const cookieOptions: Partial<ResponseCookie> = {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || "604800"), // Default to 7 days
    }

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "none";
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    cookieStore.set("session", JSON.stringify(session), cookieOptions);

    return resOk(session, response.status);
  },
);

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('session');
}

export const registerAction = withErrorHandling(
  async (formData: FormData): Promise<FetchResponse<boolean>> => {
    const result = FlixUserRegisterSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!result.success) {
      return resFail({
        message: "Invalid registration data",
        fields: flattenToSingleMessage(result.error.flatten().fieldErrors),
        status: 400,
      });
    }

    const response = await fetch(`${process.env.DJANGO_API_URL}/auth/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.data),
      cache: "no-store", // Ensure we don't cache registration responses
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.detail || "Registration failed";

      return resFail({
        message: errorMessage,
        fields: flattenToSingleMessage(errorData),
        status: response.status,
      });
    }

    return resOk(true, 200);
  },
);