import { AsyncStorage, Alert } from 'react-native';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
const dirs = RNFetchBlob.fs.dirs.DocumentDir + '/MagnifiMobile';

export default class LocalDbManager {

    public static async insert<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.setItem(key, await JSON.stringify(value), (error) => {
            callBack(error);
        });
    }

    public static async get<T>(key: string, callBack: (error?: Error, result?: T) => void) {
        await AsyncStorage.getItem(key, async (error, result) => {
            if (result !== null) {
                let parseJson = await JSON.parse(result!);
                callBack(error, parseJson);
            } else {
                callBack(error, result);
            }
        });
    }

    public static async update<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.mergeItem(key, await JSON.stringify(value), (error) => {
            callBack(error);
        });

    }

    public static async delete(key: string, callBack: (error?: Error) => void) {
        await AsyncStorage.removeItem(key, (error) => {
            callBack(error);
        });
    }

    public static async showConfirmationAlert(confirmationMessage: string) {
        Alert.alert(Config.APP_NAME, confirmationMessage);
    }

    public static downloadImages(url: string, destinationPath: string, type: string ) {
        RNFetchBlob
        .config({
          // response data will be saved to this path if it has access right.
          path : `${dirs}/${destinationPath}${type}`,
        })
        .fetch('GET', url, {
          //some headers ..
        })
        .then((res) => {
          // the path should be dirs.DocumentDir + 'path-to-file.anything'
          console.log('The file saved to ', res.path());
        });
    }
}