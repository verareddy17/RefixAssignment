import { AsyncStorage } from 'react-native';

export default class localDbManager {
    static async insert<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.setItem(key, await JSON.stringify(value), (error) => {
            callBack(error)
        });
    }
    static async get<T>(key: string, callBack: (error?: Error, result?: T) => void) {
        await AsyncStorage.getItem(key, async (error, result) => {
            if (result !== null) {
                console.log('result', result)
                let parseJson = await JSON.parse(result!)
                callBack(error, parseJson)
            } else {
                callBack(error, result)
            }
        })
    }
    static async update<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.mergeItem(key, await JSON.stringify(value), (error) => {
            callBack(error)
        })

    }
    static async delete(key: string, callBack: (error?: Error) => void) {
        await AsyncStorage.removeItem(key, (error) => {
            callBack(error)
        });
    }
}