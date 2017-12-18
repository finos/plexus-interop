
declare var window: Window;

export class UrlParamsProvider {
    /***
     * https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
     */
    public static getParam(name: string): string | undefined {
        if (typeof window === 'undefined') {
            return undefined;
        }

        let query_string = this.parseUrlParams(window.location.search);
        return query_string[name];
    }

    public static parseUrlParams(query: string): any {
        let query_string = {};
        query = query.startsWith('?') ? query.substring(1) : query;
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            // If first entry with this name
            if (typeof query_string[pair[0]] === 'undefined') {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === 'string') {
                let arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }

        return query_string;
    }
}