type ServiceFormHeaderProps = {
  title: string;
  subtitle: string;
};

export function ServiceFormHeader({ title, subtitle }: ServiceFormHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-8 py-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
