export function SectionHeader({
  label,
  title,
  sub,
  align = "left",
}: {
  label?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {label && <div className="section-label mb-3">{label}</div>}
      <h2 className="font-display text-3xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-3 text-sm text-muted-foreground md:text-base">{sub}</p>}
    </div>
  );
}
