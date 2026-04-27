import { clientFetchFlixUsers } from "@/lib/flix-api.client";
import { FlixUser } from "@/types/flix";
import { WTUserEvent } from "@/types/watch-together";
import { useMemo } from "react";
import useSWR from "swr";

export default function useWTUserHydrates(
  wtUsers: WTUserEvent[],
  user: FlixUser | null,
) {
  const { data: detailedUsers, isLoading } = useSWR(
    wtUsers ? ["users", wtUsers] : null,
    ([_, wtUsers]) => clientFetchFlixUsers(wtUsers),
  );

  const detailedUsersMap = useMemo(() => {
    if (!detailedUsers) return {};

    return detailedUsers.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, FlixUser>,
    );
  }, [detailedUsers]);

  const hydratedUsers = useMemo(() => {
    if (!wtUsers || !detailedUsers) return [];

    return wtUsers.map((u) => {
      const details = detailedUsersMap[u.userId];
      return {
        ...u,
        ...details,
      };
    });
  }, [user?.id, wtUsers, detailedUsersMap]);

  return {
    detailedUsers,
    detailedUsersMap,
    hydratedUsers,
    isLoading,
  };
}
