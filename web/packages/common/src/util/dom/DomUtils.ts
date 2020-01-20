/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Logger, LoggerFactory } from '../../logger';

export class DomUtils {

    private static log: Logger = LoggerFactory.getLogger('DomUtils');

    public static iFrameLoaded(iFrameElement: HTMLIFrameElement): Promise<HTMLIFrameElement> {
        return new Promise((resolve) => {
            iFrameElement.addEventListener('load', () => {
                resolve(iFrameElement);
            }, false);
        });
    }

    public static getOrCreateHiddenIFrame(id: string, url: string): Promise<HTMLIFrameElement> {
        let iFrameElement = document.getElementById(id) as HTMLIFrameElement;
        if (iFrameElement) {
            DomUtils.log.debug(`iFrame [${id}] already exist`);
            return Promise.resolve(iFrameElement as HTMLIFrameElement);
        } else {
            iFrameElement = document.createElement('iframe');
            iFrameElement.setAttribute('id', id);
            iFrameElement.setAttribute('src', url);
            iFrameElement.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;display:none';
            document.body.appendChild(iFrameElement);
        }
        return DomUtils.iFrameLoaded(iFrameElement);
    }

    public static getOrigin(url: string): string {
        if (url.startsWith('/')) {
            return window.location.origin;
        }
        const parts = url.split('/');
        if (parts.length > 2 && parts[0].indexOf('http') === 0) {
            return parts[0] + '//' + parts[2];
        } else {
            throw new Error(`Couldn't get origin, unsupported URL - ${url}`);
        }
    }

    public static getQueryParam(name: string): string | undefined {
        const top = DomUtils.getTopWindow(window);
        const value = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(top.location.search);
        return value ? decodeURIComponent(value[1]) : undefined;
    }

    public static getTopWindow(window: Window): Window {
        try {
            if (window.parent && window.parent !== window) {
                return DomUtils.getTopWindow(window.parent);
            } else {
                return window;
            }
        } catch (e) {
            // parent from other domain, we should stop here
            return window;
        }
    }

}
