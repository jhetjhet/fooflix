import { resFail } from "@/lib/response-wrappers";
import { flixFetch } from "@/lib/flix-fetch";
import { FetchResponse } from "@/types";
import { FlixUser, FlixUserSchema } from "@/types/flix";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<FetchResponse<FlixUser>>> {
  try {
    const response = await flixFetch("/auth/users/me/");

    if (!response.ok) {
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: "Failed to fetch user" },
      }, { status: 500 });
    }

    const userResult = FlixUserSchema.safeParse(await response.json());

    if (!userResult.success) {
      return NextResponse.json(resFail({ message: "Invalid user data" }), { status: 500 });
    }

    const user = userResult.data;

    return NextResponse.json({ 
      ok: true,
      data: user,
      error: null,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(resFail({ message: "Internal Server Error" }), { status: 500 });
  }
}
