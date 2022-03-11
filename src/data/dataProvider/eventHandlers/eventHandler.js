import touringEvents from './touringEvents';

function dispatch(event) {
    const data = JSON.parse(event.data);
    if (data['@id'].includes('tourings'))
        touringEvents.update(data);
}

export default {
    dispatch
}