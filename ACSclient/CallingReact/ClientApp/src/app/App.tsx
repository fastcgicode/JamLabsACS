// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupLocator } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import {
  CallAdapter,
  CallAdapterState,
  CallComposite,
  createAzureCommunicationCallAdapter,
  toFlatCommunicationIdentifier,
  ParticipantItem,
  ParticipantItemProps
} from '@azure/communication-react';
import { initializeIcons, PersonaPresence, Spinner, PrimaryButton, Stack, Text, IChoiceGroupOption, ChoiceGroup, Toggle } from '@fluentui/react';
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
import { useSwitchableFluentTheme } from './theming/SwitchableFluentThemeProvider';
import { v1 as generateGUID } from 'uuid';
import './App.css'
import { createAutoRefreshingCredential } from './utils/credential';

initializeIcons();

export interface AppProps {
  name: string;
  acsID: string;
  acsToken: string;
  username: string;
  callLocator: GroupLocator;
  userAvailableHandler(): void;
  userUnavailableHandler(): void;
  inviteHandler(userName: string): void;
  joinHandler(): void;
  loggedUsers: any[];
}
const App = (props: AppProps): JSX.Element => {
  const { acsID, acsToken, username, name, callLocator, userAvailableHandler, userUnavailableHandler, inviteHandler, joinHandler, loggedUsers } = props;
  const { currentTheme, currentRtl } = useSwitchableFluentTheme();
  const [adapter, setAdapter] = useState<CallAdapter>();
  const userId = { communicationUserId: acsID };
  const displayName = username;
  const callIdRef = useRef<string>();
  const adapterRef = useRef<CallAdapter>();

  useEffect(() => {
    (async () => {
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
    })();
    return () => {
      userUnavailableHandler();
      adapterRef?.current?.dispose();
    };
  }, [callLocator]);
  window.addEventListener("beforeunload", function (e) {
    userUnavailableHandler();
  }, false);

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }
  return (
    <div className='align-left'>
      <Stack horizontal verticalFill disableShrink padding={6} gap={16}>
        <Stack verticalFill>
          <Toggle inlineLabel
            label="Online"
            defaultChecked
            onChange={
              (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
                if (checked)
                  userAvailableHandler();
                else
                  userUnavailableHandler();
              }}>
          </Toggle>
        </Stack>
        <Stack verticalFill disableShrink>
          <CallComposite
            adapter={adapter}
            fluentTheme={currentTheme.theme}
            rtl={currentRtl}
            callInvitationUrl={window.location.href}
            formFactor='desktop' />
        </Stack>
        <Stack verticalFill disableShrink>
          <div className='solid-white'>
            <div className='participant-title'>Users online:</div>
            {
              loggedUsers.map(listitem => (
                <div className='participant-row'>
                  <div className='participant-item'>
                    <ParticipantItem key={generateGUID()}
                      onClick={() => {
                        inviteHandler(listitem.userName+generateGUID());
                      }}
                      displayName={listitem.name}
                      presence={PersonaPresence.online} />
                  </div>
                  <div className='participant-item'>
                    <PrimaryButton
                      text="Join"
                      onClick={() => {
                        joinHandler();
                      }}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </Stack>
      </Stack>
    </div>
  );
}

export default App;