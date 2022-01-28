export const isDefined = variable => variable !== undefined && variable !== null;

export const isDefinedAndNotVoid = variable => Array.isArray(variable) ? isDefined(variable) && variable.length > 0 : isDefined(variable);

export const getDateFrom = (date, nbDaysToAdd = 0, hour = 9, minutes = 0) => {
    return new Date(date.getFullYear(), date.getMonth(), (date.getDate() + nbDaysToAdd), hour, minutes, 0);
};

export const getHourFrom = (date, nbMinutesToAdd = 0) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, (date.getMinutes() + nbMinutesToAdd), 0);
};

export const getAmericanStringDate = date => {
    return date.getFullYear() + "-" + getTwoDigits(date.getMonth() + 1) + "-" + getTwoDigits(date.getDate());
}

export const getTwoDigits = number => number < 10 ? '0' + number : number;

export const getNumericOrNull = value => typeof value === 'string' ? (value.length > 0 ? parseFloat(value) : null) : value;

export const getFloat = value => typeof value === 'string' ? parseFloat(value.replace(',','.')) : value;

export const getInt = value => typeof value === 'string' ? parseInt(value) : value;

export const isSameAddress = (address1, address2) => {
    return isDefined(address1) && isDefined(address2) &&
           address1.address === address2.address &&
           address1.zipcode === address2.zipcode &&
           address1.address2 === address2.address2;
};

export const formatUTC = dates => {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
};

export const getEvolutionPoints = (start = -100, end = 100, step = 10) => {
    let result = [];
    let i = start;
    while (i <= end) {
        result = [...result, {value: i, label: i === 0 ? "Pas d'évolution" : i < 0 ? i + " %" : "+" + i + " %" }];
        i += step;
    }
    return result;
};