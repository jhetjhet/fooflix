import type { MediaItem, User, WatchTogetherRoom } from "@/types/tmdb";

// Mock user data
export const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://i.pravatar.cc/150?img=1",
};

// Generate random room ID
export function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Languages for subtitles
export const subtitleLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

// Generate year options
export function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear + 1; year >= 1900; year--) {
    years.push(year);
  }
  return years;
}
