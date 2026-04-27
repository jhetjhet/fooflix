import { flixFetch } from "@/lib/flix-api.server";
import { resFail } from "@/lib/response-wrappers";
import { FetchResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/flix/sess/[...rest]'>
): Promise<NextResponse<FetchResponse<any>>> {
  try {
    const { rest } = await ctx.params;

    const restPath = rest.join("/");

    const searchParams = new URLSearchParams();
    
    req.nextUrl.searchParams.forEach((value, key) => {
      searchParams.set(key, value);
    });
    
    const response = await flixFetch(`/${restPath}?${searchParams.toString()}`);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: { message: "Failed to fetch Flix data" },
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