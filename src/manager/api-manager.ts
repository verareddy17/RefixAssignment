export default class apiManager {

    static httpMethod = {
        get: 'GET',
        post: 'POST',
        put: 'PUT'
    };

    static baseUrl: string = 'https://randomuser.me/api';

    static async get<T>(url: string, callBack: (response?: T, error?: String) => void) {
        let endpointUrl = `${this.baseUrl}${url}`;
        const response = await fetch(endpointUrl, {
            method: apiManager.httpMethod.get,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        })
        if (response !== null) {
            const res = await response.json();
            callBack(res);
            return
        }
        callBack(response, 'Unkonwn error occured');
    }

    static async post<T>(urlStr: string, params: object, callBack: (response?: T, error?: String) => void) {
        const response = await fetch(urlStr, {
            method: apiManager.httpMethod.post,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        })
        if (response !== null) {
            callBack(await response.json())
            return
        }
        callBack(response, 'Unkonwn error occured');
    }

}