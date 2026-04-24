import {
  Star,
  Clock,
  Calendar,
  Play,
  Users,
  ArrowLeft,
  Tv,
} from "lucide-react";
import { Button } from "./ui/button";
import { TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { Skeleton } from "./ui/skeleton";
import { useTransition } from "react";
import { createInviteLink } from "@/app/actions/node";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

function isTMDBTVShow(
  media: TMDBMovieDetails | TMDBTVShowDetails,
): media is TMDBTVShowDetails {
  return "number_of_seasons" in media;
}

export default function MediaInfo({
  media,
}: {
  media: TMDBMovieDetails | TMDBTVShowDetails;
}) {
  const router = useRouter();

  const [isCreateInviteLinkPending, startCreateInviteLinkTransition] = useTransition();

  const isTV = isTMDBTVShow(media);

  const title = isTV ? media.name : media.title;
  const releaseDate = isTV ? media.first_air_date : media.release_date;

  const runtime = isTV ? media.episode_run_time?.[0] || 0 : media.runtime;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

      {media.tagline && (
        <p className="text-muted-foreground italic">
          &quot;{media.tagline}&quot;
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {media.vote_average > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="size-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{media.vote_average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({media.vote_count.toLocaleString()})
            </span>
          </div>
        )}

        {runtime > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-4" />
            <span>
              {isTV
                ? `${runtime} min/ep`
                : `${Math.floor(runtime / 60)}h ${runtime % 60}m`}
            </span>
          </div>
        )}

        {releaseDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{new Date(releaseDate).getFullYear()}</span>
          </div>
        )}
      </div>

      {/* TV only */}
      {isTV && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tv className="size-4" />
            <span>
              {media.number_of_seasons} Season
              {media.number_of_seasons !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-muted-foreground">
            {media.number_of_episodes} Episode
            {media.number_of_episodes !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Genres */}
      {media.genres?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {media.genres.map((genre) => (
            <span
              key={genre.id}
              className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
            >
              {genre.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button className="w-full gap-2" size="lg">
          <Play className="size-5 fill-current" />
          Watch Now
        </Button>

        <Button 
          variant="outline" 
          className="w-full 
          gap-2" 
          size="lg"
          disabled={isCreateInviteLinkPending}
          onClick={() => {
            startCreateInviteLinkTransition(async () => {
              const response = await createInviteLink(media.id.toString());

              if (!response.ok) {
                toast({
                  title: "Failed to create invite link",
                  description: response.error?.message || "An error occurred while creating the invite link. Please try again.",
                  variant: "destructive",
                });
                return;
              }

              router.push(`/watch-together/movie/${response?.data?.roomId}`);
            });
          }}
        >
          <Users className="size-5" />
          {isCreateInviteLinkPending ? "Creating Link..." : "Watch Together"}
        </Button>
      </div>

      {/* Additional */}
      <div className="pt-4 space-y-3 text-sm border-t border-border">
        {media.status && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span>{media.status}</span>
          </div>
        )}

        {media.original_language && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Language</span>
            <span className="uppercase">{media.original_language}</span>
          </div>
        )}

        {/* Movie only */}
        {!isTV && media.budget > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budget</span>
            <span>${media.budget.toLocaleString()}</span>
          </div>
        )}

        {!isTV && media.revenue > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue</span>
            <span>${media.revenue.toLocaleString()}</span>
          </div>
        )}

        {/* TV only */}
        {isTV && media.created_by?.length > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created by</span>
            <span className="text-right">
              {media.created_by.map((c) => c.name).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaInfoSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative h-[50vh] md:h-[60vh] bg-muted animate-pulse" />

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="lg:hidden space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="hidden lg:block w-80 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
