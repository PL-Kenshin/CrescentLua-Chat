import { useEffect, useState,useCallback } from 'react';
import { ToastAndroid, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'

const usePreventCloseApp = (onBeforeCloseApp) => {
    const [backPressedCount, setBackPressedCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const sub = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    if (onBeforeCloseApp) {
                        onBeforeCloseApp(() => setBackPressedCount(2));
                    } else {
                        setBackPressedCount((pre) => {
                            if (pre === 0) {
                                ToastAndroid.show('Dotknij ponownie, aby wyjść', 1000);
                                setTimeout(() => setBackPressedCount(0), 1000);
                            }
                            return pre + 1;
                        });
                    }
                    return true;
                },
            );
            return sub.remove;
        }, [onBeforeCloseApp]),
    );

    useEffect(() => {
        if (backPressedCount === 2) {
            BackHandler.exitApp();
        }
    }, [backPressedCount]);

    return {
        closeApp: () => setBackPressedCount(2),
    };
};

export default usePreventCloseApp;