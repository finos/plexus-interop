
declare var window: Window;

export class UrlParamsProvider {

    public static getParam(name: string): string | undefined {
        if (typeof window === 'undefined') {
            return undefined;
        }
        const queryString = this.parseUrlParams(window.location.search);
        return queryString[name];
    }

    public static parseUrlParams(query: string): any {
        let queryString = {};
        query = query.startsWith('?') ? query.substring(1) : query;
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            // If first entry with this name
            if (typeof queryString[pair[0]] === 'undefined') {
                queryString[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof queryString[pair[0]] === 'string') {
                let arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
                queryString[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                queryString[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return queryString;
    }
}