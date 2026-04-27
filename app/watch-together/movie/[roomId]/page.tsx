import MediaPageContainer from "@/components/media-page/container";
import { fetchFlixDetails, fetchFlixUser } from "@/lib/flix-api.server";
import { unifiedMovie } from "@/services/unified";
import { notFound } from "next/navigation";
import WTHostPage from "./_components/wt-host-page";
import WTClientPage from "./_components/wt-client-page";
import { WTRoom, WTRoomSchema } from "@/types/watch-together";
import { authFetch } from "@/lib/auth-fetch";
import { getTMDBDetails } from "@/lib/tmdb-api.server";

async function fetchRoomDetails(roomId: string): Promise<WTRoom> {
  const resp = await authFetch(`${process.env.NODE_API_URL}/watch-together/${roomId}/`);

  if (!resp.ok) {
    throw new Error("Failed to fetch room details");
  }

  const roomResult = WTRoomSchema.safeParse(await resp.json());

  if (!roomResult.success) {
    console.error("Invalid room data:", roomResult.error);
    throw new Error("Invalid room data");
  }

  return roomResult.data;
}

interface WatchTogetherMoviePageProps {
  params: { roomId: string };
}

export default async function WatchTogetherMoviePage({
  params,
}: WatchTogetherMoviePageProps) {
  const { roomId } = await params;
  const user = await fetchFlixUser();

  if (!user) {
    notFound();
  }

  const roomDetails = await fetchRoomDetails(roomId);

  if (!roomDetails) {
    notFound();
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