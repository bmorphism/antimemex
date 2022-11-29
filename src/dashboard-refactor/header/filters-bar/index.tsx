import React, { PureComponent } from 'react'
import styled, { css } from 'styled-components'

import { sizeConstants } from 'src/dashboard-refactor/constants'
import { fonts } from 'src/dashboard-refactor/styles'
import TagPicker from 'src/tags/ui/TagPicker'
import SpacePicker from 'src/custom-lists/ui/CollectionPicker'
import Margin from 'src/dashboard-refactor/components/Margin'
import DomainPicker from './DomainPicker/'
import DatePicker, {
    DateRangeSelectionProps,
} from 'src/overview/search-bar/components/DateRangeSelection'
import type { SearchFilterLabel, SearchFilterType } from '../types'
import { DomainPickerDependencies } from './DomainPicker/logic'
import { TagPickerDependencies } from 'src/tags/ui/TagPicker/logic'
import { HoverBox } from 'src/common-ui/components/design-library/HoverBox'
import { Icon } from 'src/dashboard-refactor/styled-components'
import * as icons from 'src/common-ui/components/design-library/icons'
import type { SpacePickerDependencies } from 'src/custom-lists/ui/CollectionPicker/logic'
import { NewHoverBox } from '@worldbrain/memex-common/lib/common-ui/components/hover-box'

const windowWidth: number = window.innerWidth
const searchBarWidthPx: number = sizeConstants.searchBar.widthPx

export interface FiltersBarProps {
    searchFilters: any
    isDisplayed: boolean
    showTagsFilter: boolean
    showDatesFilter: boolean
    areTagsFiltered: boolean
    showSpaceFilter: boolean
    areDatesFiltered: boolean
    areSpacesFiltered: boolean
    showDomainsFilter: boolean
    areDomainsFiltered: boolean
    toggleTagsFilter: () => void
    toggleDatesFilter: () => void
    toggleSpaceFilter: () => void
    toggleDomainsFilter: () => void
    tagPickerProps?: TagPickerDependencies
    datePickerProps: DateRangeSelectionProps
    spacePickerProps: SpacePickerDependencies
    domainPickerProps: DomainPickerDependencies
    spaceSidebarWidth: string
    spaceSidebarLocked: boolean
}

export default class FiltersBar extends PureComponent<FiltersBarProps> {
    private renderFilterSelectButton = (
        label: SearchFilterLabel,
        name: SearchFilterType,
        onToggle: React.MouseEventHandler,
        isShown: boolean,
        isFiltered: boolean,
        filterIcons: string,
        filterProps:
            | TagPickerDependencies
            | SpacePickerDependencies
            | DateRangeSelectionProps
            | DomainPickerDependencies,
        ref: React.RefObject<HTMLDivElement>,
    ) => (
        <Margin vertical="7px" width="auto">
            <FilterSelectButton
                selected={isShown}
                onClick={onToggle}
                className={`${name}-picker-button`}
                filterActive={isShown || isFiltered}
                ref={ref}
            >
                <Icon path={filterIcons} heightAndWidth="16px" hoverOff />
                {this.renderFilterInfo(filterProps, name, isFiltered, label)}
            </FilterSelectButton>
        </Margin>
    )

    spaceFilterButtonRef = React.createRef<HTMLDivElement>()
    dateFilterButtonRef = React.createRef<HTMLDivElement>()
    domainFilterButtonRef = React.createRef<HTMLDivElement>()

    private renderFilterInfo = (
        filterProps: any,
        name: string,
        isFiltered: boolean,
        label: string,
    ) => {
        if (name === 'date' && isFiltered) {
            var startDate = filterProps.startDateText

            if (filterProps.endDateText) {
                var endDate: string = filterProps.endDateText
            }

            if (!filterProps.endDateText && isFiltered) {
                var endDate = 'Now'
            }

            return (
                <>
                    {isFiltered && (
                        <>
                            {startDate && (
                                <>
                                    <DateHelp>From</DateHelp>
                                    <DateText>{startDate}</DateText>
                                </>
                            )}
                            {endDate && (
                                <>
                                    <DateHelp>to</DateHelp>
                                    <DateText>{endDate}</DateText>
                                </>
                            )}
                        </>
                    )}
                </>
            )
        }

        if (name === 'domain' && isFiltered) {
            var domainsIncluded = this.props.searchFilters.domainsIncluded

            return (
                <>
                    {isFiltered && (
                        <DomainScroll>
                            {domainsIncluded
                                .map((domain) => (
                                    <DomainPill>{domain}</DomainPill>
                                ))
                                .reverse()}
                        </DomainScroll>
                    )}
                </>
            )
        }

        if (name === 'space' && isFiltered) {
            var spacesIncluded = this.props.searchFilters.spacesIncluded

            return (
                <>
                    {isFiltered && (
                        <>
                            Spaces{' '}
                            <CounterPill>{spacesIncluded.length}</CounterPill>
                        </>
                    )}
                </>
            )
        }

        return (
            <>
                <TextSpan>{label}</TextSpan>
            </>
        )
    }

    private renderDatePicker = () => {
        return (
            <DatePicker
                {...this.props.datePickerProps}
                outsideClickIgnoreClass="date-picker-button"
            />
        )
    }

    private renderSpacePicker = () => {
        return (
            <SpacePicker
                {...this.props.spacePickerProps}
                searchInputPlaceholder="Add Space filters"
                removeTooltipText="Remove Space filter"
                outsideClickIgnoreClass="space-picker-button"
                filterMode
            />
        )
    }

    private renderDomainPicker = () => {
        return (
            <DomainPicker
                {...this.props.domainPickerProps}
                searchInputPlaceholder="Add domain filters"
                removeToolTipText="Remove filter"
                outsideClickIgnoreClass="domain-picker-button"
            />
        )
    }

    render() {
        return (
            <>
                <Container hidden={!this.props.isDisplayed}>
                    <FilterBtnsContainer
                        sidebarWidth={this.props.spaceSidebarWidth}
                        spaceSidebarLocked={this.props.spaceSidebarLocked}
                    >
                        <NewHoverBox
                            referenceEl={this.dateFilterButtonRef.current}
                            componentToOpen={
                                this.props.showDatesFilter
                                    ? this.renderDatePicker()
                                    : null
                            }
                            placement={'bottom-start'}
                            offsetX={10}
                            closeComponent={this.props.toggleDatesFilter}
                        >
                            {this.renderFilterSelectButton(
                                'Date',
                                'date',
                                this.props.toggleDatesFilter,
                                this.props.showDatesFilter,
                                this.props.areDatesFiltered,
                                icons.date,
                                this.props.datePickerProps,
                                this.dateFilterButtonRef,
                            )}
                        </NewHoverBox>
                        <NewHoverBox
                            referenceEl={this.domainFilterButtonRef.current}
                            componentToOpen={
                                this.props.showDomainsFilter
                                    ? this.renderDomainPicker()
                                    : null
                            }
                            placement={'bottom-start'}
                            offsetX={10}
                            closeComponent={this.props.toggleDomainsFilter}
                        >
                            {this.renderFilterSelectButton(
                                'Domains',
                                'domain',
                                this.props.toggleDomainsFilter,
                                this.props.showDomainsFilter,
                                this.props.areDomainsFiltered,
                                icons.globe,
                                this.props.domainPickerProps,
                                this.domainFilterButtonRef,
                            )}
                        </NewHoverBox>
                        <NewHoverBox
                            referenceEl={this.spaceFilterButtonRef.current}
                            componentToOpen={
                                this.props.showSpaceFilter
                                    ? this.renderSpacePicker()
                                    : null
                            }
                            placement={'bottom-start'}
                            offsetX={10}
                            closeComponent={this.props.toggleSpaceFilter}
                        >
                            {this.renderFilterSelectButton(
                                'Spaces',
                                'space',
                                this.props.toggleSpaceFilter,
                                this.props.showSpaceFilter,
                                this.props.areSpacesFiltered,
                                this.props.areSpacesFiltered
                                    ? icons.collectionsFull
                                    : icons.collectionsEmpty,
                                this.props.spacePickerProps,
                                this.spaceFilterButtonRef,
                            )}
                        </NewHoverBox>
                    </FilterBtnsContainer>
                </Container>
            </>
        )
    }
}

const DateHelp = styled.div`
    color: ${(props) => props.theme.colors.darkText};
`

const DateText = styled.div`
    color: ${(props) => props.theme.colors.normalText};
`

const Container = styled.div<{ hidden: boolean }>`
    height: 50px;
    width: 100%;
    border-bottom: 1px solid ${(props) => props.theme.colors.lineGrey};
    justify-content: center;
    position: sticky;
    top: 60px;
    background: ${(props) => props.theme.colors.backgroundColor};
    z-index: 2147483640;
    border-top: 1px solid ${(props) => props.theme.colors.lineGrey};

    ${(props) =>
        css`
            display: ${props.hidden ? 'none' : 'flex'};
        `};
`

const FilterBtnsContainer = styled.div<{ sidebarWidth; spaceSidebarLocked }>`
    max-width: 800px;
    flex: 1;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    grid-gap: 7px;

    @media screen and (max-width: 900px) {
        margin-left: ${(props) => props.spaceSidebarLocked && '24px'};
    }
`

const PickersContainer = styled.div`
    position: relative;
    top: 30px;
`

const DomainScroll = styled.div`
    overflow: scroll;
    white-space: nowrap;
    display: flex;
    align-items: center;
    width: 200px;

    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`

const FilterSelectButton = styled.div<{ filterActive: boolean }>`
    width: fit-content;
    display: grid;
    grid-gap: 5px;
    grid-auto-flow: column;
    align-items: center;
    padding: 3px 12px;
    background: ${(props) => props.theme.colors.greyScale1};
    border-radius: 8px;
    white-space: nowrap;
    max-width: fit-content;
    font-size: 13px;
    color: ${(props) => props.theme.colors.normalText};

    &:hover {
        background: ${(props) => props.theme.colors.lightHover};
    }

    ${(props) =>
        props.filterActive &&
        css`
            background: ${(props) => props.theme.colors.lightHover};
        `}

    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    cursor: pointer;
    height: 30px;
`

const TextSpan = styled.span`
    font-family: ${fonts.primary.name};
    font-weight: ${fonts.primary.weight.normal};
    line-height: 15px;
`

const CounterPill = styled.div`
    background: ${(props) => props.theme.colors.purple};
    color: ${(props) => props.theme.colors.black};
    border-radius: 3px;
    height: 20px;
    padding: 0 5px;
    width: fit-content;
    margin-left: 5px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
`

const TagPill = styled.div`
    display: flex;
    justify-content: center;
    padding: 2px 6px;
    background: ${(props) => props.theme.colors.purple};
    color: white;
    border-radius: 3px;
`

const DomainPill = styled.div`
    display: flex;
    justify-content: center;
    padding: 2px 6px;
    color: ${(props) => props.theme.colors.normalText};
    border-radius: 3px;
`
