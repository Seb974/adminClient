import React from 'react';

export default React.createContext({
    isAuthenticated: false,
    setIsAuthenticated: (value) => {},
    currentUser: {},
    setCurrentUser: (value) => {},
    eventSource: {},
    setEventSource: (value) => {},
    settings: {},
    setSettings: (value) => {},
    seller: {},
    setSeller: (value) => {},
    supervisor: {},
    setSupervisor: (value) => {}
});