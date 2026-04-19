import CreatePageState from "./create-page-state";


export default function CreatePage() {

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Content</h1>
        <p className="text-muted-foreground">
          Search for movies or series and manage your content uploads
        </p>
      </div>

      <CreatePageState />
    </div>
  );
}
