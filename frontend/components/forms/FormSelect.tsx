// frontend/components/forms/FormSelect.tsx
"use client";

import type { ChangeEvent} from "react";
// eslint-disable-next-line no-duplicate-imports
import { useState } from "react";



interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options?: Option[];
  error?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  options = [],
  error = "",
}) => {
  const [touched, setTouched] = useState<boolean>(false);

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        required={required}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          touched && error ? "border-red-300" : "border-gray-300"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {touched && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { FormSelect };