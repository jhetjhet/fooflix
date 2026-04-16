"use server";

import { cookies } from "next/headers";
import { flattenToSingleMessage } from "@/lib/utils";
import { FetchResponse } from "@/types";
import { JWTResponse } from "@/types/flix";
import { z } from "zod";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { FlixUserRegisterSchema } from "@/services/flix";

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export async function loginAction(
  formData: FormData,
): Promise<FetchResponse<JWTResponse>> {
  try {
    const result = loginSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!result.success) {
      return {
        ok: false,
        data: null,
        error: {
          fields: flattenToSingleMessage(result.error.flatten().fieldErrors),
        },
        status: 400,
      };
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
      return {
        ok: false,
        data: null,
        error: { message: "Invalid username or password" },
        status: response.status,
      };
    }

    const session = await response.json();

    const cookieStore = await cookies();

    const cookieOptions: Partial<ResponseCookie> = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }

    cookieStore.set("session", JSON.stringify(session), cookieOptions);

    return {
      ok: true,
      data: session,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      data: null,
      error: { message: "An unexpected error occurred" },
      status: 500,
    };
  }
}

export async function logoutAction(): Promise<void> {

  const cookieStore = await cookies();

  cookieStore.delete({
    name: "session",
    path: "/",
  });
}

export async function registerAction(registerForm: FormData): Promise<FetchResponse<boolean>> {
  try {
    const result = FlixUserRegisterSchema.safeParse(
      Object.fromEntries(registerForm.entries()),
    );

    if (!result.success) {
      return {
        ok: false,
        data: null,
        error: {
          fields: flattenToSingleMessage(result.error.flatten().fieldErrors),
        },
        status: 400,
      };
    }

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/auth/users/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
        cache: "no-store", // Ensure we don't cache registration responses
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.detail || "Registration failed";

      return {
        ok: false,
        data: null,
        error: { message: errorMessage, fields: flattenToSingleMessage(errorData) },
        status: response.status,
      };
    }

    return {
      ok: true,
      data: true,
      error: null,
      status: 200,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: { message: "An unexpected error occurred" },
      status: 500,
    };
  }
}