// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupCallLocator, GroupLocator, CallAgent } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import * as signalR from "@microsoft/signalr";
import {
  CallAdapter,
  CallAdapterState,
  CallComposite,
  createAzureCommunicationCallAdapter,
  toFlatCommunicationIdentifier
} from '@azure/communication-react';
import { initializeIcons, Spinner, PrimaryButton, Stack, Text, IChoiceGroupOption, ChoiceGroup } from '@fluentui/react';
import React, { useEffect, useState, useRef } from 'react';
import {
  createGroupId,
  getGroupIdFromUrl,
  navigateToHomePage
} from './utils/AppUtils';
import {
  imgStyle,
  infoContainerStyle,
  containerStyle,
  containerTokens,
  headerStyle,
  buttonStyle
} from './styles/HomeScreen.styles';
import { GetAcsUsers } from './api';
import { useSwitchableFluentTheme } from './theming/SwitchableFluentThemeProvider';
import { v1 as generateGUID } from 'uuid';
import { createAutoRefreshingCredential } from './utils/credential';

initializeIcons();

type AppPages = 'home' | 'call' | 'endCall';

const webAppTitle = "ACS Video Conference";
const joiningExistingCall = !!getGroupIdFromUrl();

export interface AcsUser {
  userName: string;
  connectionId: string;
}
export interface AppProps {
  acsID: string;
  acsToken: string;
  username: string;
}
const App = (props: AppProps): JSX.Element => {
  const { acsID, acsToken, username } = props;
  const [loggedUsers, setloggedUsers] = useState<string[]>([]);
  const { currentTheme, currentRtl } = useSwitchableFluentTheme();
  const [page, setPage] = useState<AppPages>('call');
  const [callLocator, setCallLocator] = useState<GroupLocator>(getGroupIdFromUrl() || createGroupId());
  const [adapter, setAdapter] = useState<CallAdapter>();
  const [groupId, setGroup] = useState<string>();
  const [userId, setUserId] = useState<CommunicationUserIdentifier>({ communicationUserId: acsID });
  const connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
  const displayName = username;
  const callIdRef = useRef<string>();
  const adapterRef = useRef<CallAdapter>();

  const updateAvailable = () => {
    let availableusers: string[] = [];
    GetAcsUsers().then(
      (users: AcsUser[]) => {
        users.map((user) => {
          availableusers.push(user.userName);
        });
        setloggedUsers(availableusers);
      });
  }
  connection.start().catch((err) => alert(err));
  useEffect(() => {
    (async () => {
      updateAvailable();
      connection.on("inviteReceived", (user: string, from: string, groupId: string) => {
        if (user == username) {
          alert(`Invitation from ${from}`);
          setGroup(groupId);
        }
      });
      connection.on("availableReceived", (user: string, connectionId: string) => {
        alert(user + " is available"); 
        updateAvailable();
      });
      connection.on("unavailableReceived", (user: string, connectionId: string) => {
        alert(user + " is unavailable");
        updateAvailable();
      });
      const adapter = await createAzureCommunicationCallAdapter({
        userId,
        displayName,
        credential: createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), acsToken),
        locator: callLocator
      });
      adapter.on('callEnded', () => {
        console.log("");
      });
      adapter.on('error', (e) => {
        console.log('Adapter error event:', e);
      });
      adapter.onStateChange((state: CallAdapterState) => {
        const pageTitle = convertPageStateToString(state);
        document.title = `${pageTitle} - ${webAppTitle}`;

        callIdRef.current = state?.call?.id;
      });
      setAdapter(adapter);
      adapterRef.current = adapter;
    })();

    return () => {
      adapterRef?.current?.dispose();
    };
  }, [callLocator, username, acsToken, acsID]);

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }

  const available = () => {
    connection.send("available", username);
  };
  const unavailable = () => {
    connection.send("unavailable", username);
  };
  const invite = (user) => {
    connection.send("invite", user, username, callLocator.groupId);
  };

  switch (page) {
    case 'home': {
      document.title = `home - ${webAppTitle}`;
      return (<Stack horizontal verticalFill disableShrink>
        <Stack
          horizontal
          wrap
          horizontalAlign="center"
          verticalAlign="center"
          tokens={containerTokens}
          className={containerStyle}>
        </Stack>
      </Stack>
      );
    }
    case 'endCall': {
      break;
    }
    case 'call': {
      return (<Stack horizontal verticalFill disableShrink>
        <Stack>
          <PrimaryButton
            text="Available"
            onClick={() => {
              available();
            }}
          />
          <PrimaryButton
            text="Unavailable"
            onClick={() => {
              unavailable();
            }}
          />
          <PrimaryButton
            text="Join"
            onClick={() => {
              if (groupId) {
                setCallLocator({ groupId: groupId });
              }
              setPage('call');
            }}
          />
          <Stack><h3>Available:</h3>
            {
              loggedUsers.map(listitem => (
                <PrimaryButton
                  text={listitem}
                  key={generateGUID()}
                  onClick={() => {
                    invite(listitem);
                  }}>
                </PrimaryButton>
              ))
            }
          </Stack>
        </Stack>
        <CallComposite
          adapter={adapter}
          fluentTheme={currentTheme.theme}
          rtl={currentRtl}
          callInvitationUrl={window.location.href}
          formFactor='desktop' />
      </Stack>
      );
    }
    default:
      document.title = `error - ${webAppTitle}`;
      return <>Invalid page</>;
  }
  return <></>;
};
const convertPageStateToString = (state: CallAdapterState): string => {
  switch (state.page) {
    case 'accessDeniedTeamsMeeting':
      return 'error';
    case 'leftCall':
      return 'end call';
    case 'removedFromCall':
      return 'end call';
    default:
      return `${state.page}`;
  }
};

export default App;