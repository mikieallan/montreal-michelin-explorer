interface StarButtonProps {
  saved: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function StarButton({ saved, onToggle, size = "sm" }: StarButtonProps) {
  const dim = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${dim} ${
        saved
          ? "border-michelin-red bg-michelin-red-light text-michelin-red"
          : "border-michelin-border bg-white text-michelin-muted hover:border-michelin-red hover:text-michelin-red"
      }`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
