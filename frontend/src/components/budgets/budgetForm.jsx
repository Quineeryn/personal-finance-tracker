import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BudgetForm({ onSubmit, onCancel, initialData = {} }) {
  const [category, setCategory] = useState(initialData.category || '');
  const [amount, setAmount] = useState(initialData.amount || '');
  // Default ke bulan saat ini jika tidak ada data awal
  const [month, setMonth] = useState(initialData.month || new Date().toISOString().slice(0, 7)); // Format YYYY-MM

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ category, amount: parseFloat(amount), month });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Category</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">Amount</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="month" className="text-right">Month</Label>
        <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required className="col-span-3" />
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Budget</Button>
      </div>
    </form>
  );
}
