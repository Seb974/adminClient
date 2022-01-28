import categoryEvents from './categoryEvents';
import productEvents from './productEvents';
import touringEvents from './touringEvents';
import userEvents from './userEvents';

function dispatch(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data['@id'].includes('tourings'))
        touringEvents.update(data);

    // if (data['@id'].includes('products'))
    //     productEvents.update(data);

    // if (data['@id'].includes('categories'))
    //     categoryEvents.update(data);

    // if (data['@id'].includes('users') || data['@id'].includes('metas'))
        // userEvents.update(data);
}

export default {
    dispatch
}