import BrowseContent from "./_components/browse-content";

export default function BrowsePage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse</h1>
        <p className="text-muted-foreground">
          Discover movies and series from our extensive collection
        </p>
      </div>

      <BrowseContent />
    </div>
  );
}
