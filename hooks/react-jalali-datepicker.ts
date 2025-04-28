// declare module 'react-jalali-datepicker' {
//     import { Component } from 'react';

//     export interface JalaliDatePickerProps {
//       id?: string;
//       value?: any; // Adjust type as needed
//       onChange?: (date: any) => void; // Adjust type as needed
//       locale?: string;
//       style?: React.CSSProperties;
//     }

//     export class JalaliDatePicker extends Component<JalaliDatePickerProps> {}
//   }
declare module 'react-jalali-datepicker' {
  import { Component } from 'react';

  interface JalaliDatePickerProps {
    onChange: (date: any) => void; // Adjust the type as needed
    value: any; // Adjust the type as needed
    locale?: string;
    style?: React.CSSProperties;
    isGregorian?: boolean;
    timePicker?: boolean;
  }

  export class JalaliDatePicker extends Component<JalaliDatePickerProps> {}
}