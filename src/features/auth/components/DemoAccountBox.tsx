import { CircleAlert } from 'lucide-react';

export default function DemoAccountBox() {
  return (
    <div className="rounded-2xl border border-[#E8C7AE]/80 bg-[#FDF3EA]/88 px-3.5 py-2.5">
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D97853]" aria-hidden />
        <div className="text-[13px] leading-relaxed">
          <p className="font-semibold text-[#1F1F1F]">Demo account</p>
          <p className="text-[#6F5C4D]">Use user123 / 123 to explore the platform</p>
        </div>
      </div>
    </div>
  );
}
