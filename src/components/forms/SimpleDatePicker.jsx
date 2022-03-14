import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import React from 'react';
import Flatpickr from 'react-flatpickr';

const SimpleDatePicker = ({selectedDate, minDate = new Date(), onDateChange, label="Date", className = ""}) => {

    return (
        <>
            <label htmlFor="date" className="date-label">{ label }</label>
            <Flatpickr
                name="date"
                value={ selectedDate }
                onChange={ onDateChange }
                className={`form-control ${ className }`}
                options={{
                    minDate: minDate,
                    dateFormat: "d/m/Y",
                    locale: French,
                    disable: [ date => date.getDay() === 0 ]
                }}
            />
        </>
    );
}
 
export default SimpleDatePicker;