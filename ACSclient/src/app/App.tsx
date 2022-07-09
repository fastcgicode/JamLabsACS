// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupCallLocator, GroupLocator, CallAgent } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import { initializeIcons, Spinner } from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import {
  createGroupId,
  getGroupIdFromUrl,
  navigateToHomePage
} from './utils/AppUtils';
import { CallError } from './views/CallError';
import { CallScreen } from './views/CallScreen';
import { EndCall } from './views/EndCall';
import { HomeScreen } from './views/HomeScreen';

initializeIcons();

type AppPages = 'home' | 'call' | 'endCall';

const webAppTitle = document.title;
const joiningExistingCall = !!getGroupIdFromUrl();

export interface AppProps {
  acsID: string;
  acsToken: string;
  username: string;
}
const App = (props: AppProps): JSX.Element => {
  const { acsID, acsToken, username } = props;
  const [page, setPage] = useState<AppPages>('home');
  const [userCredentialFetchError, setUserCredentialFetchError] = useState<boolean>(false);

  // Call details to join a call - these are collected from the user on the home screen
  const [callLocator, setCallLocator] = useState<GroupLocator>(getGroupIdFromUrl() || createGroupId());
  const [displayName, setDisplayName] = useState<string>('');
  if(joiningExistingCall){
    alert("joiningexisting"+callLocator.groupId);
    setPage('call');
  }

  switch (page) {
    case 'home': {
      document.title = `home - ${webAppTitle}`;
      return (
        <HomeScreen
          token={acsToken}
          userId={{ communicationUserId: acsID }}
          displayName={username}
          callLocator={callLocator}
          joiningExistingCall={joiningExistingCall}
          startCallHandler={(callId: string) => {
            setCallLocator({groupId:"e02493c0-fed7-11ec-88b7-550b2a45799e"} as GroupLocator);
            setPage('call');
          }}
        />
      );
    }
    case 'endCall': {
      break;
    }
    case 'call': {
      return (
        <CallScreen
          token={acsToken}
          userId={{ communicationUserId: acsID }}
          displayName={username}
          callLocator={callLocator}
          onCallEnded={() => console.log('')}
          webAppTitle={webAppTitle}
        />
      );
    }
    default:
      document.title = `error - ${webAppTitle}`;
      return <>Invalid page</>;
  }
  return <></>;
};

export default App;