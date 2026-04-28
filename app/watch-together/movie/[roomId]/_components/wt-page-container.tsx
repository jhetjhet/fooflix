import { CastList } from "@/components/cast-list";
import ViewersList from "@/components/media-page/viewers-list";
import WatchTogetherHeader from "@/components/media-page/watch-together-header";
import useWTUserHydrates from "@/hooks/use-wt-user-hydrates";
import { FlixUser } from "@/types/flix";
import { UnifiedMovie } from "@/types/unified";
import { WTRoom, WTUserEvent } from "@/types/watch-together";
import { Calendar, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";

type WTPageContainerProps = {
  roomDetails: WTRoom;
  movie: UnifiedMovie;
  user: FlixUser | null;
  users: WTUserEvent[];
  children: React.ReactNode;
};

export default function WTPageContainer({
  roomDetails,
  movie,
  user,
  users,
  children,
}: WTPageContainerProps) {
  const [shareUrl, setShareUrl] = useState("");

  const {
    isLoading,
    hydratedUsers: wtUsers,
  } = useWTUserHydrates(users, user);

  const userCount = users?.length || 0;

  useEffect(() => {
    if (!roomDetails?.roomId) return;

    setShareUrl(`${window.location.origin}/watch-together/movie/${roomDetails.roomId}`);
  }, [roomDetails?.roomId]);

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-10">
      {/* Watch Together Header */}
      <WatchTogetherHeader
        roomId={roomDetails.roomId}
        watcherCount={userCount}
        isHost={roomDetails.isHost}
        shareUrl={shareUrl}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Video Player */}
        <div className="flex-1 space-y-6 min-w-0">
          {children}

          {/* Cast */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="hidden lg:block">
              <CastList cast={movie.credits.cast} />
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="lg:w-80 shrink-0 space-y-4 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold">{movie.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            )}

            {movie.runtime > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" />
                <span>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              </div>
            )}

            {movie.release_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <div>
            <h3 className="font-semibold mb-2">Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
              {movie.overview || "No overview available."}
            </p>
          </div>

          {/* Viewers List (Mock) */}
          <div className="order-first mb-10 lg:order-none lg:mb-0">
            <ViewersList
              userCount={userCount}
              users={wtUsers}
              user={user}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="block lg:hidden">
            <CastList cast={movie.credits.cast} />
          </div>
        )}
      </div>
    </div>
  );
}
