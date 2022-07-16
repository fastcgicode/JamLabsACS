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
import { fetchTokenResponse } from './app/utils/AppUtils';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PageLayout } from "./components/Msal/PageLayout";
import Button from "react-bootstrap/Button";
import { GetAcsToken, CreateOrGetACSUser } from './acsAuthApiCaller';
import * as signalR from "@microsoft/signalr";
import { GetAcsUsers } from './app/api';
import { GroupLocator } from '@azure/communication-calling';
import { createGroupId, getGroupIdFromUrl, navigateToHomePage } from './app/utils/AppUtils';

export interface AcsUser {
  userName: string;
  connectionId: string;
  name: string;
}
const msalInstance = new PublicClientApplication(msalConfig);
const connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [groupId, setGroup] = useState<string>();
  const [loggedUsers, setloggedUsers] = useState<AcsUser[]>([]);
  const [callLocator, setCallLocator] = useState<GroupLocator>(getGroupIdFromUrl() || createGroupId());
  const [acsID, setId] = useState('');
  const [acsToken, setAcsToken] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  async function RequestProfileData() {
    connection.start().catch((err) => alert(err));
    const updateAvailableUsers = () => {
      GetAcsUsers().then(
        (users: AcsUser[]) => {
          setloggedUsers(users);
        });
    }
    connection.on("inviteReceived", (user: string, from: string, groupId: string) => {
      if (user == username) {
        alert(`Invitation from ${from}`);
        setGroup(groupId);
      }
    });
    connection.on("availableReceived", (user: string) => {
      alert(user + " is available");
      updateAvailableUsers();
    });
    connection.on("unavailableReceived", (user: string) => {
      alert(user + " is unavailable");
      updateAvailableUsers();
    });
    instance
      .acquireTokenSilent({
        ...{
          scopes: ['api://efdcfca4-8a11-45f5-ade9-ed622b5efeb3/access_as_user'] //scope added in server registration step
        },
        account: accounts[0]
      })
      .then((response) => {
        const mode = "prod";
        if (response.account) {
          setUsername(response.account.username);
          setName(accounts[0].name);
        }
        if (mode != "prod") {
          CreateOrGetACSUser(response.accessToken)
            .then(() => {
              GetAcsToken(response.accessToken)
                .then((message) => {
                  setAcsToken(message.token);
                  setId(message.user.id);
                });
            })
            .catch((error) => console.log(error));
        } else {
          try {
            fetchTokenResponse().then(({ token, user }) => {
              setAcsToken(token);
              setId(user.communicationUserId);
            });
          } catch (e) {
            console.error(e);
          }
        }
      });
  }
  if (acsID) {
    return (
      <>
        <App acsID={acsID} acsToken={acsToken} username={username} name={name} callLocator={callLocator}
          userAvailableHandler={async () => {
            await connection.send("available", username, name);
          }}
          userUnavailableHandler={async () => {
            await connection.send("unavailable", username);
          }}
          inviteHandler={async (user: string) => {
            await connection.send("invite", user, username, callLocator.groupId);
          }}
          joinHandler={async () => {
            if (groupId) {
              setCallLocator({ groupId: groupId });
            }
          }} loggedUsers={loggedUsers} />
      </>
    );
  } else {
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
