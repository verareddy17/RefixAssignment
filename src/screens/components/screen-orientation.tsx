
import Orientation from 'react-native-orientation';
import { Dimensions } from 'react-native';

const handleOrientationOfScreen = (callBack: (orientation: string) => void) => {
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener((orientaion) => {
        callBack(orientaion);
    });
};
const getInitialScreenOrientation = () => {
    return Orientation.getInitialOrientation();
};
const removeOrientationOfScreen = () => {
    Orientation.removeOrientationListener((orientation) => { console.log('removed listener'); });
};
const handleScreenDimensions = (callBack: (width: number, height: number) => void) => {
    Dimensions.addEventListener('change', (size) => {
        callBack(size.window.width, size.window.height);
    });
};

const removeScreenDimensionsListner = () => {
    Dimensions.removeEventListener('change', () => { });
};


export { handleOrientationOfScreen, removeOrientationOfScreen, getInitialScreenOrientation, handleScreenDimensions, removeScreenDimensionsListner };