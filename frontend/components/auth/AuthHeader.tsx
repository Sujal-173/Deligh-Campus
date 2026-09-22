export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-grey-50">{subtitle}</p>}
    </div>
  );
}
