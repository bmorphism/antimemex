import React from 'react'

import CopyPaster, { Props as CopyPasterProps } from './CopyPaster'
import { BackgroundSearchParams } from 'src/search/background/types'
import { runInBackground } from 'src/util/webextensionRPC'

export interface Props extends Omit<CopyPasterProps, 'renderTemplate'> {
    searchParams: BackgroundSearchParams
    getRootElement: () => HTMLElement
}

export default class AnnotationSearchCopyPaster extends React.PureComponent<
    Props
> {
    static defaultProps: Partial<Props> = { copyPaster: runInBackground() }

    private renderTemplate = (id: number) =>
        this.props.copyPaster.renderTemplateForAnnotationSearch({
            id,
            searchParams: this.props.searchParams,
        })

    render() {
        return (
            <CopyPaster {...this.props} renderTemplate={this.renderTemplate} />
        )
    }
}
