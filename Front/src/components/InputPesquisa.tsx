type Props = {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
};

export default function InputPesquisa({ value, onChange, onEnter, placeholder }: Props) {
  return (
    <input
      className="w-full rounded-xl border px-4 py-3 outline-none"
      placeholder={placeholder ?? "Informe modelo ou marca"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
    />
  );
}
