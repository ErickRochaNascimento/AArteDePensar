export function Stars({ value }: { value: number }) {
  const n = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`${value} de 5 estrelas`}>
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </span>
  );
}
