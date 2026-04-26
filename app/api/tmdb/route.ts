import { resFail } from "@/lib/response-wrappers";
import { FetchResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
): Promise<NextResponse<FetchResponse<any>>> {
  try {
    const rest = params.path.join("/");

    const url = new URL(`${process.env.TMDB_API_BASE}/${rest}`);

    // copy all query params from incoming request
    req.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    url.searchParams.set("api_key", process.env.TMDB_API_KEY!);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: { message: "Failed to fetch TMDB data" },
        },
        { status: 500 },
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        ok: true,
        data,
        error: null,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(resFail({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
