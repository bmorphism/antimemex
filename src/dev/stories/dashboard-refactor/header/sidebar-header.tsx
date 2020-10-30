import React from 'react'
import { storiesOf } from '@storybook/react'

import { sidebarToggleProps } from './sidebar-toggle'

import SidebarHeader from 'src/dashboard-refactor/header/SidebarHeader/SidebarHeader'

const stories = storiesOf('Dashboard Refactor|Header/Sidebar Header', module)

const collectionsHeaderProps = {
    open: {
        sidebarPeekState: {
            toggleSidebarPeekState: function () {},
            isSidebarPeeking: false,
        },
        selectedCollectionHeader: 'Inbox',
        ...sidebarToggleProps.lockedHover,
    },
    closed: {
        sidebarPeekState: {
            toggleSidebarPeekState: function () {},
            isSidebarPeeking: false,
        },
        ...sidebarToggleProps.noHover,
    },
}

stories.add('Sidebar Header/Open', () => (
    <SidebarHeader {...collectionsHeaderProps.open} />
))
stories.add('Sidebar Header/Closed', () => (
    <SidebarHeader {...collectionsHeaderProps.closed} />
))
