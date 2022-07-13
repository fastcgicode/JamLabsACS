CREATE DATABASE AcsCalling;
USE [AcsCalling]
GO

/****** Object: Table [dbo].[AcsUsers] Script Date: 7/13/2022 4:39:28 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[AcsUsers] (
    [userName]     NVARCHAR (450) NOT NULL,
    [connectionId] NVARCHAR (MAX) NULL
);
