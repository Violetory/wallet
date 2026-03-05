import * as React from 'react';
import { Text, View } from 'react-native';
import { Button, Portal, Snackbar } from 'react-native-paper';

export type AlertType = 'success' | 'warning' | 'danger' | 'info' | 'default';

type AlertProps = {
  visible?: boolean;
  message: string;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  type?: AlertType;
  actionDisabled?: boolean;
  duration?: number;
  defaultVisible?: boolean;
};

const paletteByType: Record<AlertType, { backgroundClassName: string; textClassName: string }> = {
  success: {
    backgroundClassName: 'bg-success-bg',
    textClassName: 'text-success',
  },
  warning: {
    backgroundClassName: 'bg-warning-bg',
    textClassName: 'text-warning',
  },
  danger: {
    backgroundClassName: 'bg-danger-bg',
    textClassName: 'text-danger',
  },
  info: {
    backgroundClassName: 'bg-info-bg',
    textClassName: 'text-info',
  },
  default: {
    backgroundClassName: 'bg-primary-bg',
    textClassName: 'text-primary',
  },
};

const Alert = ({
  visible,
  message,
  onDismiss,
  icon,
  type = 'info',
  actionDisabled = false,
  duration = Snackbar.DURATION_MEDIUM,
  defaultVisible = true,
}: AlertProps) => {
  const palette = paletteByType[type];
  const isControlled = typeof visible === 'boolean';
  const [internalVisible, setInternalVisible] = React.useState(defaultVisible);
  const currentVisible = isControlled ? visible : internalVisible;

  React.useEffect(() => {
    if (!isControlled) {
      setInternalVisible(true);
    }
  }, [isControlled, message]);

  const handleDismiss = React.useCallback(() => {
    if (!isControlled) {
      setInternalVisible(false);
    }
    onDismiss?.();
  }, [isControlled, onDismiss]);

  return (
    <Portal>
      <Snackbar
        visible={currentVisible}
        onDismiss={handleDismiss}
        duration={duration}
        elevation={0}
        wrapperStyle={{ zIndex: 9999, elevation: 9999, padding: 0 }}
        style={{
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          margin: 0,
        }}>
        <View
          className={`w-full flex-row items-center justify-between rounded-md py-2 pr-2 pl-4 ${palette.backgroundClassName}`}>
          <View className="mr-3 flex-1 flex-row items-center">
            {icon ? <View className="mr-2">{icon}</View> : null}
            <Text className={`shrink leading-5 font-medium ${palette.textClassName}`}>
              {message}
            </Text>
          </View>
          {!actionDisabled ? (
            <Button mode="text" compact style={{ minWidth: 48 }} onPress={handleDismiss}>
              <Text className={`text-sm font-semibold ${palette.textClassName}`}>OK</Text>
            </Button>
          ) : null}
        </View>
      </Snackbar>
    </Portal>
  );
};

export default Alert;
