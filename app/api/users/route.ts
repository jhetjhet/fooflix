

import { resFail } from "@/lib/response-wrappers";
import { flixFetch } from "@/lib/flix-fetch";
import { FetchResponse } from "@/types";
import { FlixUser, FlixUserSchema } from "@/types/flix";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse<FetchResponse<FlixUser[]>>> {
  try {
    const url = new URL(request.url);

    const response = await flixFetch(`/auth/users/lookup/${url?.search}`);

    if (!response.ok) {
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: "Failed to fetch user" },
      }, { status: 500 });
    }

    const data = await response.json();

    const usersRes = FlixUserSchema.array().safeParse(data);
    
    if (!usersRes.success) {
      console.error("Invalid user data:", usersRes.error);
      return NextResponse.json(resFail({ message: "Invalid user data" }), { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: true,
      data: usersRes.data,
      error: null,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(resFail({ message: "Internal Server Error" }), { status: 500 });
  }
}
