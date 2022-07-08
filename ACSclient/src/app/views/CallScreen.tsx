// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupCallLocator, TeamsMeetingLinkLocator, CallClient, CallAgent, Call } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import {
  CallAdapter,
  CallAdapterState,
  CallComposite,
  createAzureCommunicationCallAdapter,
  toFlatCommunicationIdentifier
} from '@azure/communication-react';
import { Spinner, Stack, PrimaryButton } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useSwitchableFluentTheme } from '../theming/SwitchableFluentThemeProvider';
import { createAutoRefreshingCredential } from '../utils/credential';

const alex = "8:acs:6a98df63-9bde-4af3-8c1b-8c76a9266a99_00000012-667e-bbe2-e3c7-593a0d004d99";
const alma = "8:acs:6a98df63-9bde-4af3-8c1b-8c76a9266a99_00000012-6687-ce3f-2c8a-084822004d53";
export interface CallScreenProps {
  token: string;
  userId: CommunicationUserIdentifier;
  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;
  displayName: string;
  webAppTitle: string;
  onCallEnded: () => void;
}

export const CallScreen = (props: CallScreenProps): JSX.Element => {
  const { token, userId, callLocator, displayName, webAppTitle, onCallEnded } = props;
  const [adapter, setAdapter] = useState<CallAdapter>();
  const [call, setCall] = useState<Call>();
  const callIdRef = useRef<string>();
  const adapterRef = useRef<CallAdapter>();
  const { currentTheme, currentRtl } = useSwitchableFluentTheme();

  useEffect(() => {
    (async () => {
      const adapter = await createAzureCommunicationCallAdapter({
        userId,
        displayName,
        credential: createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token),
        locator: callLocator
      });
      ///if (userId.communicationUserId != alex) {
      ///  setCall(adapter.joinCall(false));///adapter.startCall(["8:acs:6a98df63-9bde-4af3-8c1b-8c76a9266a99_00000012-667e-bbe2-e3c7-593a0d004d99"]);
      ///}
      adapter.on('callEnded', () => {
        onCallEnded();
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
  }, [callLocator, displayName, token, userId, onCallEnded]);

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }

  const invite = (called) => {
    ///if (call) {
    ///  if (call.id) {
    ///    alert(call.id);
    ///    call.addParticipant({ communicationUserId: called });
    ///  }
    ///}
  };

  return (<Stack horizontal verticalFill disableShrink>
    <CallComposite
      adapter={adapter}
      fluentTheme={currentTheme.theme}
      rtl={currentRtl}
      callInvitationUrl={window.location.href}
      formFactor='desktop'
    />
    <PrimaryButton
      text="Invite"
      onClick={() => {
        invite(alex);
      }}
    /></Stack>
  );
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
