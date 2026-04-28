import MediaPageContainer from "@/components/media-page/container";
import { fetchFlixDetails, fetchFlixUser } from "@/lib/flix-api.server";
import { unifiedMovie } from "@/services/unified";
import WTHostPage from "./_components/wt-host-page";
import WTClientPage from "./_components/wt-client-page";
import { WTRoom, WTRoomSchema } from "@/types/watch-together";
import { getTMDBDetails } from "@/lib/tmdb-api.server";
import { getBackdropUrl } from "@/services/tmdb";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function fetchRoomDetails(roomId: string): Promise<WTRoom | null> {
  const resp = await fetch(`${process.env.NODE_API_URL}/watch-together/${roomId}/`, {
    headers: {
      "Authorization": `Bearer ${process.env.NODE_SERVICE_TOKEN}`,
    }
  });

  if (!resp.ok) {
    return null;
  }

  const roomResult = WTRoomSchema.safeParse(await resp.json());

  if (!roomResult.success) {
    console.error("Invalid room data:", roomResult.error);
    return null;
  }

  return roomResult.data;
}

export async function generateMetadata({ params }: WatchTogetherMoviePageProps): Promise<Metadata> {
  const { roomId } = await params;

  const roomDetails = await fetchRoomDetails(roomId);

  if (!roomDetails) {
    return {
      title: "Watch Party Not Found | FooFlix",
      description: "The watch party room you are trying to access does not exist or has been closed.",
    };
  }

  const tmdbMovie = await getTMDBDetails({
    type: "movie",
    id: parseInt(roomDetails.movieId),
  });

  const metaData: Metadata = {
    title: `${tmdbMovie.title} | FooFlix`,
    description: `Watch ${tmdbMovie.title} and more on FooFlix. Stream movies and TV series anytime, anywhere.`,

    openGraph: {
      title: `Join the Watch Party for ${tmdbMovie.title} on FooFlix!`,
      description: tmdbMovie.overview,
      siteName: "FooFlix",
      locale: "en_US",
    },

    twitter: {
      title: `Join the Watch Party for ${tmdbMovie.title} on FooFlix!`,
      description: tmdbMovie.overview,
      site: "@fooflix",
      creator: "@fooflix",
      images: tmdbMovie.poster_path ? [getBackdropUrl(tmdbMovie.poster_path)] : undefined,
    }
  };

  if (tmdbMovie.poster_path) {
    metaData.openGraph = {
      ...metaData.openGraph,
      images: [getBackdropUrl(tmdbMovie.poster_path)],
    };
  }

  return metaData;
}

interface WatchTogetherMoviePageProps {
  params: { roomId: string };
}

export default async function WatchTogetherMoviePage({
  params,
}: WatchTogetherMoviePageProps) {
  const { roomId } = await params;

  const roomDetails = await fetchRoomDetails(roomId);

  if (!roomDetails) {
    return (
      <MediaPageContainer title="Room Not Found" backdropPath={null}>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Room Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The watch party room you are trying to access does not exist or has been closed.
          </p>
        </div>
      </MediaPageContainer>
    );
  }

  const user = await fetchFlixUser();

  if (!user) {
    return (
      <MediaPageContainer title="Unauthorized" backdropPath={null}>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
          <p className="text-lg text-muted-foreground">
            You must be logged in to join a watch party. Please log in or create an account to continue.
          </p>
        </div>
      </MediaPageContainer>
    )
  }

  const flixMovie = await fetchFlixDetails({
    type: "movie",
    id: roomDetails.movieId,
  });
  const tmdbMovie = await getTMDBDetails({
    type: "movie",
    id: parseInt(roomDetails.movieId),
  });

  const uMovie = unifiedMovie(tmdbMovie, flixMovie);

  return (
    <MediaPageContainer
      title={uMovie.title}
      backdropPath={uMovie.backdrop_path}
    >
      {roomDetails.isHost ? (
        <WTHostPage 
          movie={uMovie}
          roomDetails={roomDetails}
        />
      ) : (
        <WTClientPage
          movie={uMovie}
          roomDetails={roomDetails}
        />
      )}
    </MediaPageContainer>
  );
}