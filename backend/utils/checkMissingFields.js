// utils/checkMissingFields.js
import AppError from './AppError.js';

function checkMissingFields(fields) {
  const missingFields = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      missingFields.push(key);
    }
  }

  if (missingFields.length > 0) {
    const missing = missingFields.join(', ');
    throw new AppError(`Please provide the following fields: ${missing}`, 400);
  }
}

export default checkMissingFields;
