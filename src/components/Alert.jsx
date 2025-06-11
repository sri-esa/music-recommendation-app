// src/components/Alert.jsx
import React from 'react';
import { XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid'; // Using solid icons

const alertStyles = {
  error: {
    bg: 'bg-red-100 border-red-400 text-red-700',
    icon: <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
    title: 'Error',
    textClass: 'text-red-700', // For dismiss button's ring-current
    hoverBgClass: 'hover:bg-red-200',
  },
  success: {
    bg: 'bg-green-100 border-green-400 text-green-700',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />,
    title: 'Success',
    textClass: 'text-green-700',
    hoverBgClass: 'hover:bg-green-200',
  },
  warning: {
    bg: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
    title: 'Warning',
    textClass: 'text-yellow-700',
    hoverBgClass: 'hover:bg-yellow-200',
  },
  info: {
    bg: 'bg-blue-100 border-blue-400 text-blue-700',
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    title: 'Information',
    textClass: 'text-blue-700',
    hoverBgClass: 'hover:bg-blue-200',
  },
};

const Alert = ({ type = 'error', title, message, onClose }) => {
  const styles = alertStyles[type] || alertStyles.info;
  const displayTitle = title || styles.title;

  if (!message) return null;

  const messages = Array.isArray(message) ? message : message.split('\n').filter(msg => msg.trim() !== '');

  if (messages.length === 0) return null;

  return (
    <div className={`border-l-4 p-4 my-4 rounded-md shadow-md ${styles.bg}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.textClass}`}>{displayTitle}</h3>
          <div className={`mt-2 text-sm ${styles.textClass}`}>
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${styles.textClass} ${styles.hoverBgClass} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent focus:ring-current transition ease-in-out duration-150`}
                aria-label="Dismiss"
              >
                <XCircleIcon className="h-5 w-5" /> {/* Icon color will be current text color */}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
