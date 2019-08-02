import { Platform } from 'react-native';
const check = {
  isAndroid: () => {
    return Platform.OS === 'android';
  },
};
export default check;