import { Progress } from "@/components/ui/progress";

export default function BudgetStatus({ category, spent, total }) {
  const progress = total > 0 ? (spent / total) * 100 : 0;
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });

  // Menentukan warna progress bar
  let progressColor = "bg-blue-500"; // Default
  if (progress > 75) progressColor = "bg-yellow-500";
  if (progress >= 100) progressColor = "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{category}</span>
        <span className="text-gray-600">{formatter.format(spent)} / {formatter.format(total)}</span>
      </div>
      <Progress value={progress} className="h-2 [&>div]:bg-green-500" />
    </div>
  );
}