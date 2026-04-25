interface BackProps {
  onClick?: () => void;
  label?: string;
}

export default function Back({ onClick, label }: BackProps) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border-0 text-tx3 text-[13px] cursor-pointer p-0 mb-5 transition-colors duration-[120ms] hover:text-tx2"
    >
      ← {label || "Back"}
    </button>
  );
}
