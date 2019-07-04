import { NetInfo, Alert } from 'react-native';
import Config from 'react-native-config';
import axios from 'axios';

export default class ApiManager {

    public static httpMethod = {
        get: 'GET',
        post: 'POST',
        put: 'PUT',
    };


    public static async get<T>(url: string, bearer_token: string, callBack: (response?: T, error?: string, isNetworkFail?: boolean) => void) {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                const response = await fetch(url, {
                    method: ApiManager.httpMethod.get,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + bearer_token },
                });
                if (response !== null) {
                    const res = await response.json();
                    callBack(res);
                    return;
                }
                console.log('login response', response);
                callBack(response, 'Unkonwn error occured');
            } else {
                callBack(undefined, undefined, true);
            }
        });

    }

    public static async post<T>(url: string, params: object, bearer_token: string, callBack: (response?: T, error?: string, isNetworkFail?: boolean) => void) {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                console.log('lpost login pin ', params);
                // const response = await fetch(url, {
                //     method: ApiManager.httpMethod.post,
                //     headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + bearer_token },
                //     body: JSON.stringify(params),
                // });
                let config = {
                    headers: { 'Authorization': 'Bearer ' + bearer_token },
                };
                console.log('try');
                const response = await axios.post(url, params, config);
                console.log('response', response);
                if (response !== null) {
                    let jsonData = await response.data;
                    callBack(jsonData);
                    return;
                }
                callBack(response, 'Unkonwn error occured');

            } else {
                callBack(undefined, undefined, true);
            }

        });
    }

    public static async checkNetworkConnection() {
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