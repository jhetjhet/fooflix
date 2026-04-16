import { flixFetch } from "@/lib/flix-fetch";
import { isFlixUser } from "@/services/flix";
import { FetchResponse } from "@/types";
import { FlixUser } from "@/types/flix";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<FetchResponse<FlixUser>>> {
  try {
    const user = await flixFetch("/auth/users/me/");

    if (!isFlixUser(user)) {
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: "Invalid user data" },
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true,
      data: user,
      error: null,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json({ 
      ok: false,
      data: null,
      error: { message: "Internal Server Error" },
    }, { status: 500 });
  }
}
