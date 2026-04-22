import { resFail } from "@/lib/response-wrappers";
import { FetchResponse } from "@/types";
import { FlixUser, FlixUserSchema } from "@/types/flix";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { roomId: string } }): Promise<NextResponse<FetchResponse<FlixUser>>> {
  try {
    const { roomId } = params;

    const response = await fetch(`${process.env.NODE_API_URL}/watch-together/${roomId}/`);

    if (!response.ok) {
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: "Failed to fetch user" },
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true,
      data: await response.json(),
      error: null,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(resFail({ message: "Internal Server Error" }), { status: 500 });
  }
}
