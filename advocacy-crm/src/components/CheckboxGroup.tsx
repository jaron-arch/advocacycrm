"use client";

interface Option {
  id: string;
  name: string;
}

interface CheckboxGroupProps {
  name: string;
  options: Option[];
  defaultValues?: string[];
  label?: string;
  hint?: string;
}

export default function CheckboxGroup({
  name,
  options,
  defaultValues = [],
  label,
  hint,
}: CheckboxGroupProps) {
  if (options.length === 0) return null;

  return (
    <div>
      {label && <p className="label">{label}</p>}
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={defaultValues.includes(option.id)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">{option.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
