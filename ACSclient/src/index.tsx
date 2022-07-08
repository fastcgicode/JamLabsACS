// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import { SwitchableFluentThemeProvider } from './app/theming/SwitchableFluentThemeProvider';
import "bootstrap/dist/css/bootstrap.min.css";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PageLayout } from "./components/Msal/PageLayout";
import Button from "react-bootstrap/Button";
import { GetAcsToken, CreateOrGetACSUser } from './acsAuthApiCaller';
const msalInstance = new PublicClientApplication(msalConfig);
const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [acsID, setId] = useState('');
  const [acsToken, setAcsToken] = useState('');
  const [username, setUsername] = useState('');
  async function RequestProfileData() {
    instance
      .acquireTokenSilent({
        ...{
          scopes: ['api://efdcfca4-8a11-45f5-ade9-ed622b5efeb3/access_as_user'] //scope added in server registration step
        },
        account: accounts[0]
      })
      .then((response) => {
        if (response.account) {
          setUsername(response.account.username);
        }
        CreateOrGetACSUser(response.accessToken)
          .then(() => {
            GetAcsToken(response.accessToken)
              .then((message) => {
                setAcsToken(message.token);
                setId(message.user.id);
              });
          })
          .catch((error) => console.log(error));
      });
  }
  if (acsID) {
    return (
      <>
        <App acsID={acsID} acsToken={acsToken} username={username} />
      </>
    );
  } else{
    return (
      <>
        <Button onClick={RequestProfileData}>Connect to Communication Server</Button>
      </>
    );
  }
};

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <PageLayout>
        <SwitchableFluentThemeProvider scopeId="SampleCallingApp">
          <div className="wrapper">
            <AuthenticatedTemplate>
              <ProfileContent />
            </AuthenticatedTemplate>
          </div>
        </SwitchableFluentThemeProvider>
      </PageLayout>
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
