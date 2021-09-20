import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import 'src/assets/css/select-multiple.css';

const animatedComponents = makeAnimated();

  const styles = {
    multiValue: (base, state) => {
      return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isFixed
        ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
        : base;
    },
    multiValueRemove: (base, state) => {
      return state.data.isFixed ? { ...base, display: 'none' } : base;
    },
  };

const SelectMultiple = ({ name, value, error = "", label, onChange, data }) => {

    const handleChange = (value, { action, removedValue }) => {
        switch (action) {
            case 'remove-value':
            case 'pop-value':
                if (removedValue.isFixed)
                    return;
                break;
            case 'clear':
                value = data.filter(role => role.isFixed);
                break;
        }
        onChange(value);
      }

    return (
        <div className="form-group">
            <label htmlFor={ name }>{ label }</label>
            <Select
                name={ name }
                className="basic-multi-select"
                classNamePrefix="select"
                closeMenuOnSelect={ false }
                components={ animatedComponents }
                styles={ styles }
                isClearable={ data.some(role => !role.isFixed) }
                value={ value }
                options={ data }
                onChange={ handleChange }
                isMulti
            />
            <p className="invalid-feedback">{ error }</p>
        </div>
    );
}
 
export default SelectMultiple;