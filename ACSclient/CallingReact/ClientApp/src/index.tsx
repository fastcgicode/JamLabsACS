// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { GroupLocator } from '@azure/communication-calling';
import Button from "react-bootstrap/Button";
import * as signalR from "@microsoft/signalr";
import { msalConfig } from "./authConfig";
import { GetAcsToken, CreateOrGetACSUser } from './acsAuthApiCaller';
import { GetAcsUsers } from './app/api';
import { createGroupId, getGroupIdFromUrl, navigateToHomePage, fetchTokenResponse } from './app/utils/AppUtils';
import { PageLayout } from "./components/Msal/PageLayout";
import { SwitchableFluentThemeProvider } from './app/theming/SwitchableFluentThemeProvider';
import './index.css';
import App from './app/App';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

export interface AcsUser {
  userName: string;
  connectionId: string;
  name: string;
  invitedUser: string;
  groupId: string;
}
const msalInstance = new PublicClientApplication(msalConfig);
const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [groupId, setGroup] = useState<string>();
  const [loggedUsers, setloggedUsers] = useState<AcsUser[]>([]);
  const [callLocator, setCallLocator] = useState<GroupLocator>(getGroupIdFromUrl() || createGroupId());
  const [acsID, setId] = useState('');
  const [acsToken, setAcsToken] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [show, setShow] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
  connection.start().catch((err) => {
    setShow(true); setShowMessage(err);
  });
  async function RequestProfileData() {
    const updateAvailableUsers = (user) => {
      GetAcsUsers(user).then(
        (users: AcsUser[]) => {
          setloggedUsers(users);
        });
    }
    connection.on("inviteReceived", (user: string, from: string, groupId: string) => {
      if (user == username) {
        setShow(true); setShowMessage(`Invitation from ${from}`);
        setGroup(groupId);
      }
    });
    connection.on("availableReceived", (user: string) => {
      setShow(true); setShowMessage(user + ' is available');
      updateAvailableUsers(user);
    });
    connection.on("unavailableReceived", (user: string) => {
      setShow(true); setShowMessage(user + ' is unavailable');
      updateAvailableUsers(user);
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
          connection.send("available", response.account.username, accounts[0].name);
        }
        if (mode == "prod") {
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
            setShow(true); setShowMessage(user);
            await connection.send("invite", user, username, callLocator.groupId);
          }}
          joinHandler={async () => {
            if (groupId) {
              setCallLocator({ groupId: groupId });
            }
          }} loggedUsers={loggedUsers} />
        <ToastContainer position="bottom-start">
          <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg="primary">
            <Toast.Body>{showMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
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