// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { DefaultButton, PrimaryButton, Stack, Link, Text } from '@fluentui/react';
import { Video20Filled } from '@fluentui/react-icons';
import {
  endCallContainerStyle,
  endCallTitleStyle,
  buttonStyle,
  buttonWithIconStyles,
  mainStackTokens,
  buttonsStackTokens,
  upperStackTokens,
  videoCameraIconStyle,
  bottomStackFooterStyle
} from '../styles/EndCall.styles';

export interface EndCallProps {
  rejoinHandler(): void;
  homeHandler(): void;
}

export const EndCall = (props: EndCallProps): JSX.Element => {
  const leftCall = 'You left the call';
  const goHomePage = 'Go to homepage';
  const rejoinCall = 'Rejoin call';

  return (
    <Stack
      horizontal
      wrap
      horizontalAlign="center"
      verticalAlign="center"
      tokens={mainStackTokens}
      className={endCallContainerStyle}
    >
      <Stack tokens={upperStackTokens}>
        <Text role={'heading'} aria-level={1} className={endCallTitleStyle}>
          {leftCall}
        </Text>
        <Stack horizontal wrap tokens={buttonsStackTokens}>
          <PrimaryButton
            className={buttonStyle}
            styles={buttonWithIconStyles}
            text={rejoinCall}
            onClick={props.rejoinHandler}
            onRenderIcon={() => <Video20Filled className={videoCameraIconStyle} />}
          />
          <DefaultButton
            className={buttonStyle}
            styles={buttonWithIconStyles}
            text={goHomePage}
            onClick={props.homeHandler}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
