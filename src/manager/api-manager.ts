import { NetInfo } from 'react-native';
import Config from 'react-native-config';

export default class ApiManager {

    public static httpMethod = {
        get: 'GET',
        post: 'POST',
        put: 'PUT',
    };


    public static async get<T>(url: string, callBack: (response?: T, error?: string, isNetworkFail?: boolean) => void) {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                const response = await fetch(url, {
                    method: ApiManager.httpMethod.get,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                });
                if (response !== null) {
                    const res = await response.json();
                    callBack(res);
                    return;
                }
                callBack(response, 'Unkonwn error occured');
            } else {
                callBack(undefined, undefined, true);
            }
        });

    }

    public static async post<T>(url: string, params: object, callBack: (response?: T, error?: string, isNetworkFail?: boolean) => void) {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                const response = await fetch(url, {
                    method: ApiManager.httpMethod.post,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                });
                if (response !== null) {
                    callBack(await response.json());
                    return;
                }
                callBack(response, 'Unkonwn error occured');
            } else {
                callBack(undefined, undefined, true);
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