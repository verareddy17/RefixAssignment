import ApiManager from './api-manager';

export default class NetworkCheckManager {

    public static async isConnected(): Promise<boolean> {
        let networkType = await ApiManager.checkNetworkConnection();
        return (networkType === 'wifi' || networkType === 'cellular');
    }

}