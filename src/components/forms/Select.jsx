import { CFormGroup, CInvalidFeedback, CLabel, CSelect } from '@coreui/react';
import React from 'react';

const Select = ({ name, id, value, error = "", label, onChange, children, required = false, disabled = false, valid = false, multiple = false, style = null}) => {
    return (
        <CFormGroup>
            <CLabel htmlFor={ name }>{ label }</CLabel>
            <CSelect custom name={ name } id={ id || name } value={ value } onChange={ onChange } invalid={ error.length > 0 } valid={ valid } required={ required } disabled={ disabled } multiple={ multiple } style={ style } >
                { children }
            </CSelect>
            <CInvalidFeedback>{ error }</CInvalidFeedback>
        </CFormGroup>
    );
}
 
export default Select;