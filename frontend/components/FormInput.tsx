import { ChangeEvent } from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  inputType?: 'input' | 'textarea' | 'select';
  options?: string[];
}

export default function FormInput({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  required = false,
  onChange,
  inputType = 'input',
  options = [],
}: FormInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-bold text-slate-700">{label}</span>
      {inputType === 'textarea' ? (
        <textarea
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition shadow-sm"
        />
      ) : inputType === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition shadow-sm"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition shadow-sm"
        />
      )}
    </label>
  );
}
