import React, { useState } from 'react';
import '../css/JobFilter.css';
import { filterData } from '../data/filterData';

const JobFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    categories: [],
    level: 'Tất cả',
    salary: 'Tất cả',
    companyType: 'Tất cả'
  });

  const handleCheckboxChange = (group, value) => {
    setFilters(prev => {
      const list = prev[group];
      const newList = list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value];
      
      const newFilters = { ...prev, [group]: newList };
      if (onFilterChange) onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleRadioChange = (group, value) => {
    const newFilters = { ...filters, [group]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <span className="icon">⚡</span>
        <h3>Lọc nâng cao</h3>
      </div>

      <div className="filter-group">
        <h4 className="group-title">Theo danh mục nghề</h4>
        <div className="group-content scrollable">
          {filterData.categories.map((cat, idx) => (
            <label key={idx} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.name)}
                onChange={() => handleCheckboxChange('categories', cat.name)}
              />
              <span className="checkmark"></span>
              <span className="label-text">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="group-title">Cấp bậc</h4>
        <div className="group-content">
          <select
            className="filter-select"
            value={filters.level}
            onChange={(e) => handleRadioChange('level', e.target.value)}
          >
            {filterData.levels.map((lvl, idx) => (
              <option key={idx} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-group">
        <h4 className="group-title">Mức lương</h4>
        <div className="group-content">
          {filterData.salaries.map((sal, idx) => (
            <label key={idx} className="radio-item">
              <input
                type="radio"
                name="salary"
                checked={filters.salary === sal}
                onChange={() => handleRadioChange('salary', sal)}
              />
              <span className="radio-mark"></span>
              <span className="label-text">{sal}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="group-title">Loại hình công ty</h4>
        <div className="group-content">
          {filterData.companyTypes.map((type, idx) => (
            <label key={idx} className="radio-item">
              <input
                type="radio"
                name="companyType"
                checked={filters.companyType === type}
                onChange={() => handleRadioChange('companyType', type)}
              />
              <span className="radio-mark"></span>
              <span className="label-text">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobFilter;