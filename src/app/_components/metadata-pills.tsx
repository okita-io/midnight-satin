interface MetadataPillsProps {
  tags: string[];
}

export function MetadataPills({ tags }: MetadataPillsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-xs tracking-wider uppercase border border-primary/60 text-primary rounded-sm bg-void/50 backdrop-blur-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
