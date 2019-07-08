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
                let config = {
                    headers: { 'Authorization': 'Bearer ' + bearer_token },
                };
                try {
                    let response = await axios.get(url, config);
                    if (response.status === 200) {
                        if (response !== null) {
                            let res = await response.data;
                            console.log('response axios', res);
                            callBack(res);
                            return;
                        }
                        callBack(response, 'Unkonwn error occured');
                    } else {
                        callBack(undefined, ' Request failed', false);
                    }
                } catch (error) {
                    callBack(undefined, error.message, false);
                }
            } else {
                callBack(undefined, undefined, true);
            }
        });

    }

    public static async post<T>(url: string, params: object, bearer_token: string, callBack: (response?: T, error?: string, isNetworkFail?: boolean) => void) {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            if (networkType === 'wifi' || networkType === 'cellular') {
                let config = {
                    headers: { 'Authorization': 'Bearer ' + bearer_token },
                };
                try {
                    let response = await axios.post(url, params, config);
                    if (response.status === 200) {
                        if (response !== null) {
                            let jsonData = await response.data;
                            console.log('jsonData', jsonData);
                            callBack(jsonData, '', false);
                            return;
                        }
                        callBack(response, 'Unkonwn error occured', false);
                    } else {
                        callBack(undefined, ' Request failed', false);
                    }

                } catch (error) {
                    callBack(undefined, error.message, false);
                }
            } else {
                callBack(undefined, '', true);
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