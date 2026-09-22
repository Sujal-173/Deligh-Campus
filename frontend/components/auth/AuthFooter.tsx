export default function AuthFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-center text-sm mt-4 text-grey-50">{children}</p>;
}
