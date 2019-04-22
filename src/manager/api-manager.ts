import { NetInfo, Alert } from 'react-native';

export default class ApiManager {

    public static httpMethod = {
        get: 'GET',
        post: 'POST',
        put: 'PUT',
    };

    public static baseUrl: string = 'https://randomuser.me/api';

    public static async get<T>(url: string, callBack: (response?: T, error?: String) => void) {
        let endpointUrl = `${this.baseUrl}${url}`;
        const response = await fetch(endpointUrl, {
            method: ApiManager.httpMethod.get,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (response !== null) {
            const res = await response.json();
            callBack(res);
            return;
        }
        callBack(response, 'Unkonwn error occured');
    }

    public static async post<T>(urlStr: string, params: object, callBack: (response?: T, error?: String) => void) {

        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                const response = await fetch(urlStr, {
                    method: ApiManager.httpMethod.post,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                });
                if (response !== null) {
                    callBack(await response.json());
                    return;
                } else {
                    callBack(response, 'Unkonwn error occured');
                }
            } else {
                Alert.alert('Please check internet connection');
            }
        });

    }

    public static checkNetworkConnection() {
        return NetInfo.getConnectionInfo().then(connectionInfo => {
            if (connectionInfo.type.match(/unknown/i)) {
                return new Promise(resolve => {
                    const handleFirstConnectivityChangeIOS = (isConnected: boolean) => {
                        NetInfo.isConnected.removeEventListener('connectionChange', handleFirstConnectivityChangeIOS);
                        resolve(isConnected);
                    };
                    NetInfo.isConnected.addEventListener('connectionChange', handleFirstConnectivityChangeIOS);
                });
            }
            return connectionInfo.type.toLowerCase();
        });
    }
}