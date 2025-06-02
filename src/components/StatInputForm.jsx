import React, { useState, useEffect } from 'react';
import { STAT_FIELDS_CONFIG } from '../config/formConfig';
import './StatInputForm.css';

const StatInputForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const defaultFormState = STAT_FIELDS_CONFIG.reduce((acc, field) => {
      acc[field.name] = field.type === 'select' ? (field.options[0]?.value || '') : '';
      return acc;
    }, {});
    defaultFormState.PlayerName = "YourPlayer";
    setFormData(initialData || defaultFormState);
  }, [initialData]);


  const validateField = (name, value) => {
    const field = STAT_FIELDS_CONFIG.find(f => f.name === name);
    if (!field || !field.validation) return '';

    const rules = field.validation;
    const Svalue = String(value).trim();

    if (rules.required && Svalue === '') {
      return `${field.label} is required.`;
    }

    if (Svalue !== '') {
        const numValue = parseFloat(Svalue);
        if (field.type === 'number') {
            if (isNaN(numValue)) return `${field.label} must be a number.`;
            if (rules.min !== undefined && numValue < rules.min) return `${field.label} must be at least ${rules.min}.`;
            if (rules.max !== undefined && numValue > rules.max) return `${field.label} must be no more than ${rules.max}.`;
        }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formIsValid = true;
    const newErrors = {};
    STAT_FIELDS_CONFIG.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);

    if (formIsValid) {
      const processedData = { ...formData };
      STAT_FIELDS_CONFIG.forEach(field => {
        if (field.type === 'number' && formData[field.name] !== '') {
          processedData[field.name] = parseFloat(formData[field.name]);
        }
      });

      const FGM = processedData.FieldGoalsMade, FGA = processedData.FieldGoalsAttempted;
      if (FGM !== undefined && FGA !== undefined && FGA > 0 && (processedData.FieldGoalsPercentage === undefined || processedData.FieldGoalsPercentage === '' || !STAT_FIELDS_CONFIG.find(f=>f.name==="FieldGoalsPercentage").isPercentage) ) {
          processedData.FieldGoalsPercentage = parseFloat(((FGM / FGA) * 100).toFixed(1));
      }
      const TPM = processedData.ThreePointersMade, TPA = processedData.ThreePointersAttempted;
      if (TPM !== undefined && TPA !== undefined && TPA > 0 && (processedData.ThreePointersPercentage === undefined || processedData.ThreePointersPercentage === '' || !STAT_FIELDS_CONFIG.find(f=>f.name==="ThreePointersPercentage").isPercentage)) {
          processedData.ThreePointersPercentage = parseFloat(((TPM / TPA) * 100).toFixed(1));
      }
      const FTM = processedData.FreeThrowsMade, FTA = processedData.FreeThrowsAttempted;
      if (FTM !== undefined && FTA !== undefined && FTA > 0 && (processedData.FreeThrowsPercentage === undefined || processedData.FreeThrowsPercentage === '' || !STAT_FIELDS_CONFIG.find(f=>f.name==="FreeThrowsPercentage").isPercentage)) {
          processedData.FreeThrowsPercentage = parseFloat(((FTM / FTA) * 100).toFixed(1));
      }
      
      processedData.Name = formData.PlayerName || "Your Player";
      processedData.Team = "USER";
      processedData.Games = 1;
      processedData.PlayerID = "USER_PLAYER"; 
      processedData.Minutes = 30;
      
      if (processedData.Points !== undefined && !processedData.PlayerEfficiencyRating) {
        let simplePER = (processedData.Points || 0) + (processedData.Rebounds || 0) + (processedData.Assists || 0) +
                        (processedData.Steals || 0) + (processedData.BlockedShots || 0) -
                        ((processedData.FieldGoalsAttempted || 0) - (processedData.FieldGoalsMade || 0)) -
                        ((processedData.FreeThrowsAttempted || 0) - (processedData.FreeThrowsMade || 0)) -
                        (processedData.Turnovers || 0);
        processedData.PlayerEfficiencyRating = parseFloat(simplePER.toFixed(1));
      }

      onSubmit(processedData);
    } else {
        const firstErrorKey = Object.keys(newErrors)[0];
        if (firstErrorKey) {
            const errorElement = document.getElementById(firstErrorKey);
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stat-input-form card" noValidate>
      <h2 className="form-title">Enter Your Player Profile</h2>
       <div className="form-field">
          <label htmlFor="PlayerName">Your Player Name/Nickname:</label>
          <input
            type="text"
            id="PlayerName"
            name="PlayerName"
            value={formData.PlayerName || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., FutureStar24"
            className={errors.PlayerName ? 'input-error' : ''}
          />
          {errors.PlayerName && <span className="error-message-inline">{errors.PlayerName}</span>}
        </div>

      <div className="form-grid">
        {STAT_FIELDS_CONFIG.map(field => (
          <div key={field.name} className={`form-field field-${field.name}`}>
            <label htmlFor={field.name}>{field.label}:</label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors[field.name] ? 'input-error' : ''}
              >
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === "" && field.validation?.required}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={field.placeholder || ''}
                className={errors[field.name] ? 'input-error' : ''}
                step={field.isPercentage || field.name.includes("PerGame") ? "0.1" : "1"}
              />
            )}
            {errors[field.name] && <span className="error-message-inline">{errors[field.name]}</span>}
          </div>
        ))}
      </div>
      <button type="submit" className="btn btn-primary submit-btn">Calculate & Save Stats</button>
    </form>
  );
};

export default StatInputForm;