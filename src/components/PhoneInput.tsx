'use client';
import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { css } from '@emotion/css';

interface MobileNumberInputProps {
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
}

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({ 
  onChange, 
  required = false,
  error = false,
  disabled = false
}) => {
  const [phone, setPhone] = useState('');

  const handleChange = (value: string) => {
    setPhone(value);
    onChange?.(value);
  };

  // Enhanced CSS styles with error states
  const styles = css`
    .react-tel-input {
      .flag-dropdown {
        background-color: #f8f8f8;
        border: 1px solid ${error ? '#ef4444' : '#e2e8f0'};
        border-right: none;
        border-radius: 0.25rem 0 0 0.25rem;
        
        .selected-flag {
          &:hover, &:focus {
            background-color: #f8f8f8;
          }
          
          .arrow {
            border-top-color: ${error ? '#ef4444' : '#64748b'};
          }
        }
      }
      
      .form-control {
        width: 100%;
        height: 48px;
        padding-left: 52px;
        background-color: #f8f8f8;
        border: 1px solid ${error ? '#ef4444' : '#e2e8f0'};
        border-radius: 0.25rem;
        color: #1e293b;
        transition: all 0.3s;
        
        &:focus {
          border-color: ${error ? '#ef4444' : '#3b82f6'};
          box-shadow: ${error ? '0 0 0 1px #ef4444' : '0 0 0 1px #3b82f6'};
        }
        
        &:disabled {
          background-color: #f1f5f9;
          cursor: not-allowed;
        }
      }
    }
    
    .country-list {
      background-color: #f8f8f8;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      
      .country {
        &:hover {
          background-color: #f1f5f9 !important;
        }
        
        &.highlight {
          background-color: #f1f5f9 !important;
        }
      }
    }
  `;

  return (
    <div className={styles}>
      <PhoneInput
        country={'in'}
        value={phone}
        onChange={handleChange}
        inputProps={{
          required,
          disabled,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : 'false'
        }}
        inputClass={`
          w-full rounded-md border bg-[#f8f8f8] text-gray-800
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        buttonClass={`
          bg-[#f8f8f8] border-r-0
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100' : ''}
        `}
        dropdownClass="bg-white shadow-lg rounded-md border border-gray-200"
        enableSearch
        searchClass="p-2 border-b border-gray-200"
        disableSearchIcon
      />
      {required && !phone && (
        <p className="mt-1 text-sm text-red-500">Phone number is required</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">Please enter a valid phone number</p>
      )}
    </div>
  );
};

export default MobileNumberInput;