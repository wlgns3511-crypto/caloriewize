'use client';
import { useState } from 'react';

interface FAQItem { question: string; answer: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-3">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full p-4 text-left font-medium flex justify-between items-center hover:bg-slate-50">
              {item.question}
              <span className="text-slate-400">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-slate-600">{item.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
