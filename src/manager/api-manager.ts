export default class apiManager {
    static httpMethod = {
        get: 'GET',
        post: 'POST',
        put: 'PUT'
    };
    static baseUrl: string = 'https://randomuser.me';
    static async get<T>(urlStr: string, callBack: (response?: T, error?: String) => void) {
        const response = await fetch(urlStr, {
            method: apiManager.httpMethod.get,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        })
        if (response !== null) {
            console.log('responseSatusCode:', response)
            callBack(await response.json())
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
            console.log('responseSatusCode:', response)
            callBack(await response.json())
            return
        }
        callBack(response, 'Unkonwn error occured');
    }
}