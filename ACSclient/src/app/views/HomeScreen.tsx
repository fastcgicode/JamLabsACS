// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useState } from 'react';
import { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField } from '@fluentui/react';
import heroSVG from '../../assets/hero.svg';
import {
  imgStyle,
  infoContainerStyle,
  containerStyle,
  containerTokens,
  headerStyle,
  buttonStyle
} from '../styles/HomeScreen.styles';
import { GroupCallLocator, CallClient, CallAgent } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import { createAutoRefreshingCredential } from '../utils/credential';
import {
  toFlatCommunicationIdentifier
} from '@azure/communication-react';

export interface HomeScreenProps {
  startCallHandler(callId: string | undefined): void;
  token: string;
  userId: CommunicationUserIdentifier;
  displayName: string;
  callLocator: GroupCallLocator;
  joiningExistingCall: boolean;
}

export const HomeScreen = (props: HomeScreenProps): JSX.Element => {
  const { token, userId, displayName, callLocator } = props;
  const imageProps = { src: heroSVG.toString() };
  const headerTitle = props.joiningExistingCall ? 'Join Call' : 'Start or join a call';
  const buttonText = 'Start';
  const buttonEnabled = displayName;
  const [callId, setCallId] = useState<string>("e02493c0-fed7-11ec-88b7-550b2a45799e");
  const [callAgent, setAgent] = useState<CallAgent>();
  /*let isIncoming = false;

  if (!props.joiningExistingCall&&userId.communicationUserId == "8:acs:6a98df63-9bde-4af3-8c1b-8c76a9266a99_00000012-667e-bbe2-e3c7-593a0d004d99") {
    var callClient: CallClient = new CallClient({ diagnostics: { appName: 'azure-communication-services', appVersion: '1.3.1-beta.1', tags: ["javascript_calling_sdk"] } });
    ///var environmentInfo = await callclient.getEnvironmentInfo();
    callClient.createCallAgent(createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token), { displayName: displayName }).then((agent) => {
      console.log(callClient);
      console.log(agent);
      if (agent) {
        setAgent(agent);
        agent.on('incomingCall', args => {
          const incomingCall = args.incomingCall;
          incomingCall.accept().then((call) => {
          if(!isIncoming){
          isIncoming=true;
        alert("invited " + incomingCall.id);
        window.location.href=window.location.href.split('?')[0]+"?groupId="+call.id;return;}
          });
        });
      }
    });
  }
  if (false) {
    var callClient: CallClient = new CallClient({ diagnostics: { appName: 'azure-communication-services', appVersion: '1.3.1-beta.1', tags: ["javascript_calling_sdk"] } });
    ///var environmentInfo = await callclient.getEnvironmentInfo();
    callClient.createCallAgent(createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token), { displayName: displayName }).then((agent) => {
      setAgent(agent);
      if (callAgent) {
        callAgent.on('incomingCall', args => {
          const incomingCall = args.incomingCall;
          setCallId(incomingCall.id);
        });
      }
    });
  }*/

  return (
    <Stack
      horizontal
      wrap
      horizontalAlign="center"
      verticalAlign="center"
      tokens={containerTokens}
      className={containerStyle}
    >
      <Image alt="Welcome to the ACS Calling sample app" className={imgStyle} {...imageProps} />
      <Stack className={infoContainerStyle}>
        <Text role={'heading'} aria-level={1} className={headerStyle}>
          {headerTitle}
        </Text>
        <Stack>
          <PrimaryButton
            disabled={!buttonEnabled}
            className={buttonStyle}
            text={buttonText}
            onClick={() => {
              props.startCallHandler("e02493c0-fed7-11ec-88b7-550b2a45799e");
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
