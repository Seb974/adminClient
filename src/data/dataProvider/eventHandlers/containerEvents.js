import { isDefined } from "src/helpers/utils";

export const updateContainers = (containers, setContainers, data, setData) => {

    let updatedContainers = containers;
    const newData = data.map(entity => {
        updatedContainers = !isDefined(entity.id) ? 
                            [...updatedContainers].filter(c => c['@id'] !== entity['@id']) :
                            getUpdatedContainers(entity, updatedContainers);
        return {...entity, treated: true};
    });
    setContainers(updatedContainers);
    setData(newData.filter(d => !isDefined(d.treated)));

    return new Promise((resolve, reject) => resolve(false));
};

const getUpdatedContainers = (newContainer, updatedContainers) => {
    const index = updatedContainers.findIndex(c => c.id === newContainer.id);
    return index !== -1 ? updatedContainers.map(c => c.id !== newContainer.id ? c : newContainer) : [...updatedContainers, newContainer];
};