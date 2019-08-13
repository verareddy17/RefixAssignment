import { AsyncStorage, Alert, Image, View } from 'react-native';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { FileType } from '../constant';

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

    public static async unlinkFile(path: string, type: string, unzipPath: string) {
        await RNFetchBlob.fs.unlink(path)
            .then(async () => {
                console.log('succesfully removed file from device');
                if (type === FileType.zip) {
                    await RNFetchBlob.fs.unlink(unzipPath)
                        .then(() => { })
                        .catch((err) => { console.log('file not deleted at physically', err); });
                }
            })
            .catch((err) => { console.log('file not deleted at physically', err); });
    }
}