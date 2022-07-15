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
  toFlatCommunicationIdentifier,
  ParticipantItem,
  ParticipantItemProps
} from '@azure/communication-react';
import { initializeIcons, IContextualMenuItem, PersonaPresence, Spinner, PrimaryButton, Stack, Text, IChoiceGroupOption, ChoiceGroup, Toggle } from '@fluentui/react';
import React, { useEffect, useState, useRef, ComponentState } from 'react';
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
import './App.css'
import { createAutoRefreshingCredential } from './utils/credential';

initializeIcons();

type AppPages = 'home' | 'call' | 'endCall';

const webAppTitle = "ACS Video Conference";
const joiningExistingCall = !!getGroupIdFromUrl();

export interface AcsUser {
  userName: string;
  connectionId: string;
  name: string;
}
export interface AppProps {
  name: string;
  acsID: string;
  acsToken: string;
  username: string;
}
const App = (props: AppProps): JSX.Element => {
  const { acsID, acsToken, username, name } = props;
  const [loggedUsers, setloggedUsers] = useState<AcsUser[]>([]);
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
  document.title = webAppTitle;

  connection.start().catch((err) => alert(err));
  const updateAvailable = () => {
    GetAcsUsers().then(
      (users: AcsUser[]) => {
        setloggedUsers(users);
      });
  }

  const available = async () => {
    await connection.send("available", username, name);
  };
  const unavailable = async () => {
    await connection.send("unavailable", username);
  };
  const invite = async (user) => {
    await connection.send("invite", user, username, callLocator.groupId);
  };
  const changetoggle = async (checked)=>{
                  if (checked){
                    available();
                  }else{
                    unavailable();}
                    updateAvailable();}
  ///available().then(() => updateAvailable());

  useEffect(() => {
    (async () => {
      connection.on("inviteReceived", (user: string, from: string, groupId: string) => {
        if (user == username) {
          alert(`Invitation from ${from}`);
          setGroup(groupId);
        }
      });
      connection.on("availableReceived", (user: string, connectionId: string, name: string) => {
        updateAvailable();
      });
      connection.on("unavailableReceived", (user: string, connectionId: string) => {
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
        callIdRef.current = state?.call?.id;
      });
      setAdapter(adapter);
      adapterRef.current = adapter;
      window.addEventListener("beforeunload", function (e) {
        ///unavailable();
      }, false);
    })();
    return () => {
      ///unavailable();
      adapterRef?.current?.dispose();
    };
  }, [callLocator, username, acsToken, acsID]);

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }
  switch (page) {
    case 'home': {
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
      return (
        <Stack horizontal verticalFill disableShrink>
            <Stack verticalFill disableShrink>
            <Toggle inlineLabel
              onText="Available"
              offText="Unavailable"
              onChange={
                (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
                  changetoggle(checked);
                }}>
            </Toggle>
            </Stack>
            <Stack verticalFill disableShrink>
              {
                loggedUsers.map(listitem => (<ParticipantItem key={generateGUID()}
                  onClick={() => {
                    invite(listitem.userName);
                  }}
                  displayName={listitem.name}
                  presence={PersonaPresence.online} />
                ))
              }
            </Stack>
          <CallComposite
            adapter={adapter}
            fluentTheme={currentTheme.theme}
            rtl={currentRtl}
            callInvitationUrl={window.location.href}
            formFactor='desktop' />
          <Stack>
            <PrimaryButton
              text="Join"
              onClick={() => {
                if (groupId) {
                  setCallLocator({ groupId: groupId });
                }
                setPage('call');
              }}
            />
          </Stack>
        </Stack>
      );
    }
    default:
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