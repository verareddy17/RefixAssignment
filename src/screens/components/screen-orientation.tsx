
import Orientation from 'react-native-orientation';

const handleOrientationOfScreen = (callBack: (orientation: string) => void) => {
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener((orientaion) => {
       callBack(orientaion);
    });
};
const getInitialScreenOrientation = () =>  {
    return Orientation.getInitialOrientation();
};
const removeOrientationOfScreen = () => {
    Orientation.removeOrientationListener((orientation) => {console.log('removed listener'); });
};


export {handleOrientationOfScreen, removeOrientationOfScreen, getInitialScreenOrientation};