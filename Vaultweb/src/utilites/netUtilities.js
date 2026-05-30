import React from 'react';
import axios from 'axios';
import { encryptData } from './cryptoUtilities';
import { sha256 } from 'crypto-hash';

export const submitAccount = async(email, role, password, organisation) => {
    const submission = new FormData();

    const passHash = await sha256(password);

    submission.append("email", email);
    submission.append("role", role);
    submission.append("passHash", passHash);
    submission.append("organisation", organisation);

    try{
        //Insert backend address here
        const result = await axios.post("http://localhost:3000/createAccount", submission);
        return result;
    } catch {
        console.error("Post failed");
    }
}

export const submitLogin = async(email, password) => {
    const passHash = await sha256(password);
    try{
        const result = await axios.post("http://localhost:3000/auth/login", { email, passHash }); // Routes are defined in VaultWeb_Project_B\vault-api\src\index.ts. Then created in routes/auth/PostLogin.ts
        return result.data;
    } catch {
        console.error("Post failed");
    }
}

export const submitSecret = async (key, data, userID, vaultID, name, iv) => {
    var submissionData = "";
    submissionData, iv = encryptData(data, key);

    const submission = new FormData();
    submission.append("userID", userID);
    submission.append("vaultID", vaultID);
    submission.append("name", name);
    submission.append("submissionData", submissionData);
    submission.append("iv", iv);

    try{
        //Insert backend address here
        const result = await axios.post("http://localhost:3000/data/submit", submission);
        return result;
    } catch {
        console.error("Post failed");
    }
}

export const retriveUserInfo = async (userID) => {
    const res = await axios.get(`http://localhost:3000/users/${userID}`);
    return res.data;
}

export const retriveUserSecrets = async (userID) => {
    const res = await axios.get(`http://localhost:3000/data/${userID}`);
    return res.data;
}

export const retriveSecretByVault = async (vaultID) => {
    const res = await axios.get(`http://localhost:3000/data/${vaultID}`);
    return res.data;
}

export const getVaultsByOrg = async (orgId) => {
    const res = await axios.get(`http://localhost:3000/org/${orgId}/vaults`);
    return res.data;
}

export const createVault = async (orgId, name, adminUserId) => {
    const res = await axios.post(`http://localhost:3000/org/${orgId}/vaults`, { name, adminUserId });
    return res.data;
}

export const updateVault = async (orgId, vaultId, name) => {
    const res = await axios.patch(`http://localhost:3000/org/${orgId}/vaults/${vaultId}`, { name });
    return res.data;
}

export const deleteVault = async (orgId, vaultId) => {
    const res = await axios.delete(`http://localhost:3000/org/${orgId}/vaults/${vaultId}`);
    return res.data;
}

