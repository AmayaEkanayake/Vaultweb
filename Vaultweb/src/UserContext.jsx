import React, { useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = React.createContext();

const UserProvider = props => {
    const [userName, setUserName] = useState("");
    const [userKey, setUserKey] = useState("");
    const [uuID, setuuID] = useState("");

    return (
        <UserContext.Provider value={{userName, setUserName, uuID, setuuID, userKey, setUserKey}}>
            {props.children}
        </UserContext.Provider>
    );
}

export default UserProvider;
