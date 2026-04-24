import { FlixUser } from "@/types/flix";
import { WTUserEvent } from "@/types/watch-together";
import { Skeleton } from "@/components/ui/skeleton";

const ViewListSkeleton = () => {
  return Array.from({ length: 4 }).map((_, index) => (
    <div
      key={index}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
    >
      <Skeleton className="w-6 h-6 rounded-full" />
      <Skeleton className="h-4 w-20 rounded-full" />
    </div>
  ));
};

type ViewersListProps = {
  userCount: number;
  users: (WTUserEvent & FlixUser)[];
  user: FlixUser | null;
  isLoading?: boolean;
};

export default function ViewersList({
  userCount,
  users,
  user,
  isLoading = false,
}: ViewersListProps) {
  return (
    <div className="pt-4 border-t border-border">
      <h3 className="font-semibold mb-3">Viewers ({userCount})</h3>
      <div className="flex flex-wrap gap-2">
        {isLoading && (
          <ViewListSkeleton />
        )}

        {!isLoading &&
          users.map((userItem) => (
            <div
              key={userItem.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${userItem.id === user?.id ? "bg-primary/10" : "bg-muted"} ${userItem.isHost ? "border border-primary" : ""}`}
            >
              <div className="w-6 h-6 rounded-full bg-muted-foreground/30" />
              <span>
                {userItem.username} {userItem.id === user?.id ? "(You)" : ""}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
