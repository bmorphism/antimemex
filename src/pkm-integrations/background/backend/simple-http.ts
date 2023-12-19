import { browser } from 'webextension-polyfill-ts'
import { BackupObject } from './types'
import { getPkmSyncKey } from './utils'
import TurndownService from 'turndown'
import { left } from '@popperjs/core'

export class MemexLocalBackend {
    private url

    constructor({ url }: { url: string }) {
        this.url = url
    }

    async isConnected() {
        try {
            const response = await fetch(`${this.url}/status`)
            if (response.status === 200) {
                return true
            } else if (response.status === 500) {
                return false
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }
    async isReadyToSync() {
        console.log('isReadyToSync', this.url)
        try {
            const response = await fetch(`${this.url}/status`)
            if (response.status === 200) {
                return true
            } else if (response.status === 500) {
                return 'not-available'
            } else {
                return false
            }
        } catch (error) {
            console.error('Error in isReadyToSync:', error)
            return false
        }
    }

    async isReachable() {
        return this.isConnected()
    }

    async bufferPKMSyncItems(itemToBuffer) {
        // Get the current buffer from browser.storage.local
        const data = await browser.storage.local.get('PKMSYNCbufferedItems')
        const currentBuffer = data.PKMSYNCbufferedItems || []

        if (currentBuffer.length > 2000) {
            await browser.storage.local.set({ PKMSYNCbufferMaxReached: true })
            return
        }

        // Append the new item to the buffer
        currentBuffer.push(itemToBuffer)

        // Save the updated buffer back to browser.storage.local
        await browser.storage.local.set({ PKMSYNCbufferedItems: currentBuffer })
    }

    async getBufferedItems() {
        // Check for buffered items in browser.storage.local
        const data = await browser.storage.local.get('PKMSYNCbufferedItems')
        const bufferedItems = data.PKMSYNCbufferedItems || []

        // After retrieving the buffered items, delete them from local storage
        await browser.storage.local.remove('PKMSYNCbufferedItems')

        return bufferedItems
    }

    async storeObject(
        fileName: string,
        fileContent: string,
        pkmType: string,
    ): Promise<any> {
        const syncKey = await getPkmSyncKey()

        const body = JSON.stringify({
            pageTitle: fileName,
            fileContent: fileContent,
            pkmSyncType: pkmType,
            syncKey: syncKey,
        })

        const response = await fetch(`${this.url}/update-file`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        })

        if (response.ok) {
            await browser.storage.local.set({
                PKMSYNCsyncWasSetupBefore: true,
            })
        }

        if (!response.ok || response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    }

    async vectorIndexDocument(document): Promise<any> {
        const syncKey = await getPkmSyncKey()
        let body

        if (document.contentType === 'annotation') {
            body = {
                sourceApplication: 'Memex',
                createdWhen: document.createdWhen,
                pageTitle: document.pageTitle,
                creatorId: document.creatorId,
                fullUrl: document.fullUrl,
                contentType: document.contentType,
                fullHTML: document.fullHTML,
                syncKey: syncKey,
            }

            const response = await fetch(`${this.url}/add_annotation`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (response.ok) {
            }

            if (!response.ok || response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } else {
            body = {
                sourceApplication: 'Memex',
                createdWhen: document.createdWhen,
                pageTitle: document.pageTitle,
                creatorId: document.creatorId,
                fullUrl: document.fullUrl,
                contentType: document.contentType,
                fullHTML: document.fullHTML,
                syncKey: syncKey,
            }

            const response = await fetch(`${this.url}/add_page`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (response.ok) {
            }

            if (!response.ok || response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }
    }
    async findSimilar(document?, fullUrl?): Promise<any> {
        const syncKey = await getPkmSyncKey()

        const body = {
            contentText: document,
            fullUrl: fullUrl,
            syncKey: syncKey,
        }

        console.log('body', body)

        try {
            const response = await fetch(`${this.url}/get_similar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (response.ok) {
                const responseObj = await response.json()
                return responseObj
            }

            if (!response.ok || response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            return 'not-connected'
        }
    }
    async addFeedSources(
        feedSources: {
            feedUrl: string
            feedTitle: string
            type?: 'substack'
            feedFavIcon?: string
        }[],
    ): Promise<any> {
        const syncKey = await getPkmSyncKey()

        console.log('feedSources', feedSources)

        const body = JSON.stringify({
            feedSources: feedSources,
            syncKey: syncKey,
        })

        console.log('body', body)

        const response = await fetch(`${this.url}/add_feed_source`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        })

        if (response.ok) {
            const responseObj = await response.json()
            return responseObj
        }

        if (!response.ok || response.status !== 200) {
            throw new Error(`Error getting all RSS feeds: ${response.status}`)
        }
    }
    async loadFeedSources(): Promise<any> {
        const syncKey = await getPkmSyncKey()

        const body = JSON.stringify({
            syncKey: syncKey,
        })

        const response = await fetch(`${this.url}/load_feed_sources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        })

        if (response.ok) {
            const responseObj = await response.json()
            return responseObj
        }

        if (!response.ok || response.status !== 200) {
            throw new Error(`Error getting all RSS feeds: ${response.status}`)
        }
    }

    async listObjects(): Promise<string[]> {
        const response = await fetch(`${this.url}/backup/change-sets`)
        if (response.status === 404) {
            return []
        }
        if (!response.ok) {
            throw new Error(await response.text())
        }

        const body = await response.text()
        if (body.length > 0) {
            const fileNames = body.split(',')
            return fileNames.length > 0 ? fileNames : []
        } else {
            return []
        }
    }

    async retrievePage(fileName: string, pkmType: string) {
        const syncKey = await getPkmSyncKey()

        let body = {
            pageTitle: fileName,
            pkmSyncType: pkmType,
            syncKey: syncKey,
        }

        const response = await fetch(`${this.url}/get-file-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        if (response.ok && response.status === 200) {
            const pageContent = await response.text() // or response.text() if the data is plain text
            return pageContent
        }
    }

    async retrieveIndexFile(object: string) {
        return (
            await fetch(`${this.url}/Memex Sync/Memex Sync History.md`)
        ).json()
    }
}
