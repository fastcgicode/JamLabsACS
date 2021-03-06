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
import { CallUserInvites, CallAvailable, CallUnavailable, CallInvite, CallUpdateInCall } from './app/api';
import { createGroupId, getGroupIdFromUrl, navigateToHomePage, fetchTokenResponse } from './app/utils/AppUtils';
import { PageLayout } from "./components/Msal/PageLayout";
import { SwitchableFluentThemeProvider } from './app/theming/SwitchableFluentThemeProvider';
import './index.css';
import App from './app/App';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

export interface AcsUser {
  userName: string;
  name: string;
  invitedUser: string;
  connectionId: string;
  groupId: string;
  isInCall: boolean;
}
const msalInstance = new PublicClientApplication(msalConfig);
const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [loggedUsers, setloggedUsers] = useState<AcsUser[]>([]);
  const [callLocator, setCallLocator] = useState<GroupLocator>(getGroupIdFromUrl() || createGroupId());
  const [acsID, setId] = useState('');
  const [acsToken, setAcsToken] = useState('');
  const [usersGroupId, setUsersGroupId] = useState(callLocator.groupId);
  const [groupId, setGroupId] = useState(callLocator.groupId);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [show, setShow] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const [showException, setShowException] = useState(false);
  const [exceptionText, setExceptionText] = useState('');
  const [showInviteUser, setShowInviteUser] = useState('');
  const [showInviteGroupId, setShowInviteGroupId] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
  connection.start().catch((err) => {
    setShowException(true);
    setExceptionText(err);
  });
  const updateAvailableUsers = () => {
    CallUserInvites().then(
      (users: AcsUser[]) => {
        setloggedUsers(users);
      });
  }
  async function RequestProfileData() {
    connection.on("inviteReceived", (invitedUser: string, user: string, groupId: string) => {
      updateAvailableUsers();
      setShowInvite(true); setShowInviteUser(user); setShowInviteGroupId(groupId);
      connection.send("update");
    });
    connection.on("availableReceived", (user: string) => {
      updateAvailableUsers();
      setShow(true); setShowMessage(user + ' is available');
    });
    connection.on("updateReceived", () => {
      updateAvailableUsers();
    });
    connection.on("unavailableReceived", (user: string) => {
      updateAvailableUsers();
      setShow(true); setShowMessage(user + ' is unavailable');
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
          ///CallAvailable(response.account.username, accounts[0].name, connection.connectionId).then(async () => {
          ///  await connection.send("available", response.account.username, accounts[0].name);
          ///});
          setConnectionId(connection.connectionId);
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
            .catch((error) => {
              setShowException(true);
              setExceptionText(error);
            });
        } else {
          try {
            fetchTokenResponse().then(({ token, user }) => {
              setAcsToken(token);
              setId(user.communicationUserId);
            });
          } catch (e) {
            setShowException(true);
            setExceptionText(e);
          }
        }
      });
  }
  if (acsID) {
    return (
      <>
        <App
          acsID={acsID}
          acsToken={acsToken}
          username={username}
          name={name}
          groupId={groupId}
          usersGroupId={usersGroupId}
          connectionId={connectionId}
          userAvailableHandler={async (username, name, connectionId) => {
            CallAvailable(username, name, connectionId).then(async () => {
              await connection.send("available", username, name);
            });
          }}
          userUnavailableHandler={async (username) => {
            CallUnavailable(username).then(async () => {
              await connection.send("unavailable", username);
            });
          }}
          inviteHandler={async (username: string, name: string, invitedUser: string, groupId: string) => {
            CallInvite(username, name, invitedUser, groupId).then(async () => {
              await connection.send("invite", invitedUser, name, username, groupId);
            });
          }}
          hideInviteHandler={() => {
            setShowInvite(false);
          }}
          updateGroupIdHandler={(groupId) => {
            setGroupId(groupId);
          }}
          updateInCallHandler={(username, name, isInCall) => {
            CallUpdateInCall(username, isInCall).then(async () => {
              await connection.send("update");
            });
          }}
          loggedUsers={loggedUsers}
          showInvite={showInvite}
          showInviteUser={showInviteUser}
          showInviteGroupId={showInviteGroupId} />
        <ToastContainer position="bottom-start">
          <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg="primary">
            <Toast.Body>{showMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
        <ToastContainer position="bottom-start">
          <Toast onClose={() => setShowException(false)} show={showException} bg="primary">
            <Toast.Header>Runtime Error
            </Toast.Header>
            <Toast.Body>{exceptionText}</Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    );
  } else {
    return (
      <>
        <Button onClick={RequestProfileData}>Connect to Communication Server</Button>
        <ToastContainer position="bottom-start">
          <Toast onClose={() => setShowException(false)} show={showException} bg="primary">
            <Toast.Header>Runtime Error
            </Toast.Header>
            <Toast.Body>{exceptionText}</Toast.Body>
          </Toast>
        </ToastContainer>
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