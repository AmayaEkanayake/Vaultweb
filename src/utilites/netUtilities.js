import React from 'react';
import axios from 'axios';
import { encryptData, decryptData } from './cryptoUtilities';
import {sha1,sha256,sha384,sha512} from 'crypto-hash';

export const submitAccount = async(email, role, organisation) => {
    const submission = new FormData();

    submission.append("email", email);
    submission.append("role", role);
    submission.append("organisation", organisation);

    try{
        //Insert backend address here
        const result = await axios.post("backendendpoint.com/createAccount", submission);
        return result;
    } catch (err) {
        console.error("Post failed");
    }
} 



export const submitLogin = async(email, password) => {
    const submission = new FormData();
    const passHash = await sha256(password);

    submission.append("email", email);
    submission.append("passHash", passHash);
    try{
        //Insert backend address here
        const result = await axios.post("backendendpoint.com/login", submission);
        return result.data;
    } catch (err) {
        console.error("Post failed");
    }
}

export const submitSecret = async (key, data, userID, name, iv) => {
    var submissionData = "";
    submissionData, iv = encryptData(data, key);

    const submission = new FormData();
    submission.append("userID", userID);
    submission.append("name", name);
    submission.append("submissionData", submissionData);
    submission.append("iv", iv);

    try{
        //Insert backend address here
        const result = await axios.post("backendendpoint.com/data/submit", submission);
        return result;
    } catch (err) {
        console.error("Post failed");
    }
}

export const retriveUserInfo = async (userID) => {
    const data = ""
    axios.get("backendendpoint.com/${userID}").then(res => {
        data = res.data
    }).catch(err => {
        console.error("Get failed");
    });

    return data;
}

export const retriveUserSecrets = async (userID) => {
    const data = ""
    axios.get("backendendpoint.com/data/${userID}").then(res => {
        data = res.data
    }).catch(err => {
        console.error("Get failed");
    });

    return data;
}

export const retriveSecretByVault = async (vaultID) => {
    const data = ""
    axios.get("backendendpoint.com/data/${vaultID}").then(res => {
        data = res.data
    }).catch(err => {
        console.error("Get failed");
    });

    return data;
}

