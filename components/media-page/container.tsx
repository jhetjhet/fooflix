import { getBackdropUrl } from "@/services/tmdb";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type MediaPageContainerProps = {
  title: string;
  backdropPath: string | null;
  children: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function MediaPageContainer({
  title,
  backdropPath,
  children,
  backLink,
}: MediaPageContainerProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(backdropPath, "original")}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        {/* Back Button */}
        {backLink && (
          <div className="absolute top-20 left-4 z-10">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="size-4" />
                {backLink.label}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
