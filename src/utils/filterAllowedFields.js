const filterAllowedFields = (source, allowedFields) => {
    const filtered = {};
  
    for (const key of allowedFields) {
      const val = source[key];
      if (val !== undefined) {
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed !== '') filtered[key] = trimmed;
        } else {
          filtered[key] = val;
        }
      }
    }
  
    return filtered;
  };

module.exports = filterAllowedFields;
