/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Navbar from "react-bootstrap/Navbar";

import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props 
 */
export interface PageLayoutProps {
    children: any;
  }
export const PageLayout = (props: PageLayoutProps) => {
    const { children } = props;
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <Navbar>
                { isAuthenticated ? <SignOutButton /> : <SignInButton /> }
            </Navbar>
            {props.children}
        </>
    );
};
