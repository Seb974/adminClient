import { isDefined } from "src/helpers/utils";

export const updateMessages = (messages, setMessages, data, setData) => {

    let updatedMessages = messages;
    const newData = data.map(entity => {
        updatedMessages = !isDefined(entity.id) ? 
                            [...updatedMessages].filter(m => m['@id'] !== entity['@id']) :
                            getUpdatedMessages(entity, updatedMessages);
        return {...entity, treated: true};
    });
    setMessages(updatedMessages);
    setData(newData.filter(d => !isDefined(d.treated)));

    return new Promise((resolve, reject) => resolve(false));
};

const getUpdatedMessages = (newMessage, updatedMessages) => {
    const index = updatedMessages.findIndex(c => c.id === newMessage.id);
    return index !== -1 ? updatedMessages.map(c => c.id !== newMessage.id ? c : newMessage) : [...updatedMessages, newMessage];
};