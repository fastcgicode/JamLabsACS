// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  CallAdapter,
  CallAdapterState,
  CallComposite,
  createAzureCommunicationCallAdapter,
  toFlatCommunicationIdentifier,
  ParticipantItem
} from '@azure/communication-react';
import { initializeIcons, PersonaPresence, Spinner, PrimaryButton, Stack, Text, Toggle } from '@fluentui/react';
import React, { useEffect, useState, useRef } from 'react';
import { useSwitchableFluentTheme } from './theming/SwitchableFluentThemeProvider';
import { v1 as generateGUID } from 'uuid';
import './App.css'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { createAutoRefreshingCredential } from './utils/credential';

initializeIcons();

export interface AppProps {
  name: string;
  acsID: string;
  acsToken: string;
  username: string;
  group_id: string;
  userAvailableHandler(userName: string, name: string): void;
  userUnavailableHandler(userName: string): void;
  inviteHandler(username: string, shortname: string, invitedUser: string, groupId: string): void;
  updateHandler(): void;
  loggedUsers: any[];
  showInvite: boolean;
  showInviteUser: string;
  showInviteGroupId: string;
}
const App = (props: AppProps): JSX.Element => {
  const { showInviteUser, showInviteGroupId, showInvite, acsID, acsToken, username, name, group_id, userAvailableHandler, userUnavailableHandler, inviteHandler, updateHandler, loggedUsers } = props;
  const { currentTheme, currentRtl } = useSwitchableFluentTheme();
  const [adapter, setAdapter] = useState<CallAdapter>();
  const [userName, setUserName] = useState<string>(username);
  const [shortname, setName] = useState<string>(name);
  const [groupId, setGroupId] = useState<string>(group_id);
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
        locator: { groupId: groupId }
      });
      adapter.on('callEnded', () => {
        setGroupId(generateGUID);
        setGroupId(group_id);
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
      adapterRef?.current?.dispose();
    };
  }, [groupId]);
  window.addEventListener("beforeunload", function (e) {
    userUnavailableHandler(userName);
  }, false);

  function filterUsersList(userslist, username) {
    let list = [];
    for (var c = 0; c < userslist.length; c++) {
      let un = userslist[c].userName;
      let length = userslist.filter(i => i.userName == un).length;
      if (length == 1) {
        list.push(userslist[c]);
      } else {
        if (userslist[c].invitedUser == username) {
          list.push(userslist[c]);
        } else if (userslist.filter(i => i.invitedUser == username && i.userName == un).length == 0 && userslist[c].invitedUser == "") {
          list.push(userslist[c]);
        }
      }
    }
    return list;
  }

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }
  return (
    <div className='align-left'>
      <Stack horizontal verticalFill disableShrink padding={6} gap={16}>
        <Stack verticalFill>{name}
          <Toggle inlineLabel
            label="Online"
            defaultChecked
            onChange={
              (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
                if (checked)
                  userAvailableHandler(userName, shortname);
                else
                  userUnavailableHandler(userName);
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
              filterUsersList(loggedUsers, userName).map(listitem => (
                <div className='participant-row'>
                  <div className='participant-item'>
                    <ParticipantItem key={generateGUID()}
                      onClick={() => {
                      }}
                      displayName={listitem.name}
                      presence={PersonaPresence.online} />
                  </div>
                  <div className='participant-item'>
                    <PrimaryButton
                      text="Invite to call"
                      onClick={() => {
                        inviteHandler(userName, shortname, listitem.userName, groupId);
                        adapter.joinCall();
                      }} />
                  </div>
                  <div className='participant-item'>
                    <PrimaryButton
                      disabled={!listitem.groupId}
                      text="Join call"
                      onClick={() => {
                        setGroupId(listitem.groupId);
                        adapter.joinCall();
                      }}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </Stack>
      </Stack>
      <ToastContainer position="middle-center">
        <Toast onClose={() => { updateHandler(); }} show={showInvite} bg="warning">
          <Toast.Header>Call from {showInviteUser}
          </Toast.Header>
          <Toast.Body>
            <PrimaryButton
              text="Join call"
              onClick={() => {
                setGroupId(showInviteGroupId);
                updateHandler();
                adapter.joinCall();
              }}
            />
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default App;