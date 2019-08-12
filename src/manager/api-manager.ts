import { NetInfo, Alert } from 'react-native';
import Config from 'react-native-config';
import axios from 'axios';
import { Constant } from '../constant';

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
                    let instance = axios.create();
                    instance.defaults.timeout = Constant.timeout;
                    let response = await instance.get(url, config);
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
                    if (error.code === 'ECONNABORTED') {
                        callBack(undefined, 'Request time out');
                    } else {
                        callBack(undefined, error.message, false);
                    }
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
                    let instance = axios.create();
                    instance.defaults.timeout = Constant.timeout;
                    let response = await instance.post(url, params, config);
                    console.log('responseApi post', response);
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
                    if (error.code === 'ECONNABORTED') {
                        callBack(undefined, 'Request time out');
                    } else {
                        callBack(undefined, error.message, false);
                    }
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

// NetInfo.isConnected.fetch().then(isConnected => {
//     console.log('First, is ' + (isConnected ? 'online' : 'offline'));
// });
// function handleFirstConnectivityChange(isConnected) {
//     console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
//     NetInfo.isConnected.removeEventListener(
//         'change',
//         handleFirstConnectivityChange
//     );
// }
// NetInfo.isConnected.addEventListener(
//     'change',
//     handleFirstConnectivityChange
// );