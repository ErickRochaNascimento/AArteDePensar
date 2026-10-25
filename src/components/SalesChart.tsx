export function SalesChart() {
  return (
    <div className="sales-chart-empty" role="img" aria-label="Gráfico de vendas sem dados">
      <svg viewBox="0 0 520 180" width="100%" aria-hidden="true">
        {[35, 75, 115, 155].map((y) => (
          <line key={y} x1="36" x2="514" y1={y} y2={y} stroke="var(--line)" strokeDasharray="4 5" />
        ))}
        <line x1="36" x2="36" y1="20" y2="155" stroke="var(--line)" />
        <line x1="36" x2="514" y1="155" y2="155" stroke="var(--line)" />
      </svg>
      <p>Nenhum dado para plotar neste período.</p>
    </div>
  );
}
