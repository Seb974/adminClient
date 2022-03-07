import { isDefined, isDefinedAndNotVoid } from "./utils";

export const getStore = (seller, user) => {
    let store = null;
    if (isDefinedAndNotVoid(seller.stores)) {
        store = seller.stores.find(s => s.managers.findIndex(u => u.id === user.id) !== -1);
    }
    return store;
};