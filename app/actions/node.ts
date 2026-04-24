"use server"

import { handleResponse, withErrorHandling } from "@/lib/response-wrappers"
import { FetchResponse } from "@/types";
import { cookies } from "next/headers";
import zod from "zod";

const InviteLinkReponseSchema = zod.object({
    roomId: zod.string(),
    invitePath: zod.string(),
}); 

type InviteLinkReponse = zod.infer<typeof InviteLinkReponseSchema>;

export const createInviteLink = withErrorHandling(
    async (tmdbId: string): Promise<FetchResponse<InviteLinkReponse>> => {
        const cookieStore = await cookies();
        const sessionValue = cookieStore.get("session")?.value;
        const sessionParse = sessionValue ? JSON.parse(sessionValue) : null;

        const response = await fetch(`${process.env.NODE_API_URL}/watch-together/create/${tmdbId}/`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${sessionParse?.access}`,
          }
        });
        
        return handleResponse(response, InviteLinkReponseSchema);
    }
);