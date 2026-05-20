import { Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export const useDateTimePicker = () => {
  const open = ({
    value,
    mode = 'date',
    onChange,
  }: {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    onChange: (date: Date) => void;
  }) => {
    if (Platform.OS === 'android') {
      // ❗ Android doesn't support "datetime"
      if (mode === 'datetime') {
        // 👉 first pick date
        DateTimePickerAndroid.open({
          value,
          mode: 'date',
          is24Hour: true,
          onChange: (_event, selectedDate) => {
            if (!selectedDate) return;

            // 👉 then pick time
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (_event2, selectedTime) => {
                if (!selectedTime) return;

                const finalDate = new Date(selectedDate);
                finalDate.setHours(
                  selectedTime.getHours(),
                  selectedTime.getMinutes()
                );

                onChange(finalDate);
              },
            });
          },
        });

        return;
      }

      // ✅ normal case
      DateTimePickerAndroid.open({
        value,
        mode, // now safe: only "date" | "time"
        is24Hour: true,
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        },
      });
    }
  };

  return { open };
};