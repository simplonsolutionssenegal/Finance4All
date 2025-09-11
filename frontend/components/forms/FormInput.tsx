// frontend/components/forms/FormInput.tsx
"use client";

import type { ChangeEvent} from "react";
// eslint-disable-next-line no-duplicate-imports
import { useState } from "react";



interface FormInputProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
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

      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        required={required}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          touched && error ? "border-red-300" : "border-gray-300"
        }`}
      />

      {touched && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { FormInput };