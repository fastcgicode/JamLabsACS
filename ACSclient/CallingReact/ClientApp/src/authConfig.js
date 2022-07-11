/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */
export const msalConfig = {
    auth: {
        clientId: '8b48a6c6-570d-4f62-80ad-cd31215f5ae3', // Application (Client) ID from Overview of app registration from Azure Portal, e.g. 2ed40e05-ba00-4853-xxxx-xxx60029x596]
        authority: 'https://login.microsoftonline.com/9ef1bed8-1ff7-4b70-a14b-136594be8a16', // Directory (Tenant) ID from Overview of app registration from Azure Portal, or 'common' or 'organizations' or 'consumers'
        redirectUri: 'http://localhost:3000/'
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {		
                    case LogLevel.Error:		
                        console.error(message);		
                        return;		
                    case LogLevel.Info:		
                        console.info(message);		
                        return;		
                    case LogLevel.Verbose:		
                        console.debug(message);		
                        return;		
                    case LogLevel.Warning:		
                        console.warn(message);		
                        return;		
                }	
            }	
        }	
    }
};
export const loginRequest = {
  scopes: ['api://efdcfca4-8a11-45f5-ade9-ed622b5efeb3/access_as_user'] //scope added in server registration step
};